import Dexie from "dexie";
import type { SupabaseClient } from "@supabase/supabase-js";
import { db, type OutboxItem, type OutboxStatus } from "../db/schema";
import { supabaseTables } from "../db/supabaseMeta";
import { getSupabaseClient } from "./supabaseClient";

const primaryKeyByTable = new Map<string, string>(
  supabaseTables.flatMap((t) => (t.pkField ? [[t.name, t.pkField] as const] : [])),
);

type WorkerOptions = {
  pollMs?: number;
  maxAttempts?: number;
};

export type OutboxWorker = {
  start: () => void;
  stop: () => void;
  runOnce: () => Promise<void>;
};

export function createOutboxWorker(options: WorkerOptions = {}): OutboxWorker {
  const pollMs = options.pollMs ?? 1500;
  const maxAttempts = options.maxAttempts ?? 20;
  const supabase = getSupabaseClient();

  let timer: number | null = null;
  let running = false;

  async function runOnce() {
    if (running) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    running = true;
    try {
      const item = await claimNextPendingItem();
      if (!item) return;
      await processItemSequentially(supabase, item, maxAttempts);
    } finally {
      running = false;
    }
  }

  function start() {
    if (timer) return;
    void runOnce();
    timer = window.setInterval(() => void runOnce(), pollMs);
  }

  function stop() {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  }

  return { start, stop, runOnce };
}

async function claimNextPendingItem(): Promise<OutboxItem | undefined> {
  return db.transaction("rw", db.outbox, async () => {
    const item = await db.outbox
      .where("[status+createdAt]")
      .between(["pending", Dexie.minKey], ["pending", Dexie.maxKey])
      .first();
    if (!item?.id) return;
    await db.outbox.update(item.id, { status: "processing", updatedAt: Date.now() });
    return { ...item, status: "processing" };
  });
}

async function processItemSequentially(
  supabase: SupabaseClient,
  item: OutboxItem,
  maxAttempts: number,
): Promise<void> {
  if (!item.id) return;
  if (item.attempts >= maxAttempts) {
    await db.outbox.update(item.id, {
      status: "error",
      lastError: `max attempts reached (${maxAttempts})`,
      updatedAt: Date.now(),
    });
    return;
  }

  try {
    const result = await syncToSupabase(supabase, item);
    await applyLocalSideEffects(item, result);
    await db.outbox.update(item.id, { status: "done", updatedAt: Date.now() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.outbox.update(item.id, {
      status: "pending",
      attempts: item.attempts + 1,
      lastError: msg,
      updatedAt: Date.now(),
    });
  }
}

type SyncResult =
  | { kind: "none" }
  | { kind: "upserted"; row: Record<string, unknown> }
  | { kind: "deleted"; pkField: string; pkValue: number | string }
  | {
      kind: "inserted";
      row: Record<string, unknown>;
      pkField: string;
      localPk?: number | string;
      remotePk: number | string;
    };

async function syncToSupabase(supabase: SupabaseClient, item: OutboxItem): Promise<SyncResult> {
  const pkField = item.pkField ?? primaryKeyByTable.get(item.table);
  const payload = { ...item.payload };

  if (item.op === "insert") {
    if (pkField) delete payload[pkField];
    delete payload.__local;
    const { data, error } = await supabase.from(item.table).insert(payload).select("*").single();
    if (error) throw new Error(error.message);
    if (!pkField) return { kind: "upserted", row: data as Record<string, unknown> };
    const remotePk = (data as Record<string, unknown>)[pkField] as number | string | undefined;
    if (remotePk === undefined) throw new Error(`missing pk field '${pkField}' from insert result`);
    return {
      kind: "inserted",
      row: data as Record<string, unknown>,
      pkField,
      localPk: item.localPk,
      remotePk,
    };
  }

  if (!pkField) throw new Error(`missing pkField for '${item.table}' operation '${item.op}'`);
  const pkValue = (item.pkValue ?? (payload[pkField] as number | string | undefined)) as
    | number
    | string
    | undefined;
  if (pkValue === undefined) throw new Error(`missing pkValue for '${item.table}.${pkField}'`);

  if (item.op === "delete") {
    const { error } = await supabase.from(item.table).delete().eq(pkField, pkValue);
    if (error) throw new Error(error.message);
    return { kind: "deleted", pkField, pkValue };
  }

  const clean = { ...payload };
  delete clean[pkField];
  delete clean.__local;

  if (item.op === "update") {
    const { data, error } = await supabase
      .from(item.table)
      .update(clean)
      .eq(pkField, pkValue)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { kind: "upserted", row: data as Record<string, unknown> };
  }

  const { data, error } = await supabase
    .from(item.table)
    .upsert({ ...clean, [pkField]: pkValue })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { kind: "upserted", row: data as Record<string, unknown> };
}

async function applyLocalSideEffects(item: OutboxItem, result: SyncResult): Promise<void> {
  if (result.kind === "none") return;

  if (result.kind === "deleted") {
    await db.table(item.table).delete(result.pkValue);
    return;
  }

  if (result.kind === "upserted") {
    await db.table(item.table).put(result.row);
    return;
  }

  await db.transaction("rw", db.id_map, db.outbox, db.table(item.table), async () => {
    await db.table(item.table).put(result.row);

    if (result.localPk === undefined || result.localPk === null) return;
    if (result.localPk === result.remotePk) return;

    await db.id_map.put({
      entity: item.table,
      localId: result.localPk,
      remoteId: result.remotePk,
      createdAt: Date.now(),
    });

    await replacePrimaryKey(item.table, result.pkField, result.localPk, result.remotePk, result.row);
    await remapForeignKeys(item.table, result.localPk, result.remotePk);
    await remapOutboxPayloads(item.table, result.localPk, result.remotePk);
  });
}

async function replacePrimaryKey(
  tableName: string,
  pkField: string,
  localPk: number | string,
  remotePk: number | string,
  remoteRow: Record<string, unknown>,
) {
  const table = db.table(tableName);
  await table.delete(localPk);
  await table.put({ ...remoteRow, [pkField]: remotePk });
}

async function remapForeignKeys(entity: string, localId: number | string, remoteId: number | string) {
  if (entity !== "sales") return;
  if (typeof localId !== "number" || typeof remoteId !== "number") return;
  await db.toko.where("id_sales").equals(localId).modify({ id_sales: remoteId });
}

async function remapOutboxPayloads(entity: string, localId: number | string, remoteId: number | string) {
  if (entity !== "sales") return;

  const pending = await db.outbox.where("status").equals("pending").toArray();
  for (const item of pending) {
    if (!item.id) continue;
    const payloadId = item.payload.id_sales;
    if (payloadId !== localId) continue;
    const nextPayload = { ...item.payload, id_sales: remoteId };
    await db.outbox.update(item.id, { payload: nextPayload, updatedAt: Date.now() });
  }
}

export async function getOutboxSummary(): Promise<{ pending: number; processing: number; error: number }> {
  const [pending, processing, error] = await Promise.all([
    countByStatus("pending"),
    countByStatus("processing"),
    countByStatus("error"),
  ]);
  return { pending, processing, error };
}

async function countByStatus(status: OutboxStatus): Promise<number> {
  return db.outbox.where("status").equals(status).count();
}
