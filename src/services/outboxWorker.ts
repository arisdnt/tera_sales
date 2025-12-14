import Dexie from "dexie";
import type { SupabaseClient } from "@supabase/supabase-js";
import { db, type OutboxItem, type OutboxStatus } from "../db/schema";
import { supabaseTables } from "../db/supabaseMeta";
import { getSupabaseClient } from "./supabaseClient";

const primaryKeyByTable = new Map<string, string>(
  supabaseTables.flatMap((t) => (t.pkField ? [[t.name, t.pkField] as const] : [])),
);

type ForeignKeyEdge = {
  parentTable: string;
  parentPkField: string;
  childTable: string;
  childField: string;
};

/**
 * Relasi FK yang dipakai oleh frontend (Dexie/outbox) untuk remapping local negative-id -> remote id.
 * Tidak mengubah apapun di Supabase; hanya dipakai untuk memperbaiki sinkronisasi sisi klien.
 */
const FOREIGN_KEYS: ForeignKeyEdge[] = [
  { parentTable: "sales", parentPkField: "id_sales", childTable: "toko", childField: "id_sales" },
  { parentTable: "toko", parentPkField: "id_toko", childTable: "pengiriman", childField: "id_toko" },
  { parentTable: "toko", parentPkField: "id_toko", childTable: "penagihan", childField: "id_toko" },
  {
    parentTable: "pengiriman",
    parentPkField: "id_pengiriman",
    childTable: "detail_pengiriman",
    childField: "id_pengiriman",
  },
  { parentTable: "produk", parentPkField: "id_produk", childTable: "detail_pengiriman", childField: "id_produk" },
  {
    parentTable: "penagihan",
    parentPkField: "id_penagihan",
    childTable: "detail_penagihan",
    childField: "id_penagihan",
  },
  { parentTable: "produk", parentPkField: "id_produk", childTable: "detail_penagihan", childField: "id_produk" },
  {
    parentTable: "penagihan",
    parentPkField: "id_penagihan",
    childTable: "potongan_penagihan",
    childField: "id_penagihan",
  },
];

const fkEdgesByParent = new Map<string, ForeignKeyEdge[]>();
const fkEdgesByChild = new Map<string, ForeignKeyEdge[]>();
for (const edge of FOREIGN_KEYS) {
  fkEdgesByParent.set(edge.parentTable, [...(fkEdgesByParent.get(edge.parentTable) ?? []), edge]);
  fkEdgesByChild.set(edge.childTable, [...(fkEdgesByChild.get(edge.childTable) ?? []), edge]);
}

class DeferredDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeferredDependencyError";
  }
}

function computeBackoffMs(attempt: number): number {
  // 1,2,3... -> 1.5s, 3s, 6s, 12s ... max 60s
  const base = 1500;
  const ms = base * Math.pow(2, Math.max(0, attempt - 1));
  return Math.min(60_000, ms);
}

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
    const now = Date.now();
    const candidates = await db.outbox
      .where("[status+createdAt]")
      .between(["pending", Dexie.minKey], ["pending", Dexie.maxKey])
      .limit(25)
      .toArray();
    const item = candidates.find((i) => !i.nextAttemptAt || i.nextAttemptAt <= now);
    if (!item?.id) return;
    await db.outbox.update(item.id, { status: "processing", nextAttemptAt: undefined, updatedAt: now });
    return { ...item, status: "processing", nextAttemptAt: undefined };
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
      nextAttemptAt: undefined,
      updatedAt: Date.now(),
    });
    return;
  }

  try {
    const ack = item.remoteAck as SyncResult | undefined;
    const result = ack ?? (await syncToSupabase(supabase, item));
    if (!ack) {
      await db.outbox.update(item.id, { remoteAck: result, updatedAt: Date.now() });
    }
    await applyLocalSideEffects(item, result);
    await db.outbox.update(item.id, {
      status: "done",
      remoteAck: undefined,
      nextAttemptAt: undefined,
      updatedAt: Date.now(),
    });
  } catch (err) {
    if (err instanceof DeferredDependencyError) {
      const now = Date.now();
      await db.outbox.update(item.id, {
        status: "pending",
        lastError: err.message,
        nextAttemptAt: now + 1200,
        updatedAt: now,
      });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    const now = Date.now();
    const nextAttempts = item.attempts + 1;
    await db.outbox.update(item.id, {
      status: "pending",
      attempts: nextAttempts,
      lastError: msg,
      nextAttemptAt: now + computeBackoffMs(nextAttempts),
      updatedAt: now,
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
  const payload = await resolvePayloadIds(item.table, item.payload);

  if (item.op === "insert") {
    if (!pkField) throw new Error(`missing pkField for '${item.table}' operation 'insert'`);
    if (pkField) delete payload[pkField];
    delete payload.__local;
    const { data, error } = await supabase.from(item.table).insert(payload).select("*").single();
    if (error) throw new Error(error.message);
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
  const resolvedPkValue = await resolveEntityPrimaryKey(item.table, pkValue);

  if (item.op === "delete") {
    const { error } = await supabase.from(item.table).delete().eq(pkField, resolvedPkValue);
    if (error) throw new Error(error.message);
    return { kind: "deleted", pkField, pkValue: resolvedPkValue };
  }

  const clean = { ...payload };
  delete clean[pkField];
  delete clean.__local;

  if (item.op === "update") {
    const { data, error } = await supabase
      .from(item.table)
      .update(clean)
      .eq(pkField, resolvedPkValue)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { kind: "upserted", row: data as Record<string, unknown> };
  }

  const { data, error } = await supabase
    .from(item.table)
    .upsert({ ...clean, [pkField]: resolvedPkValue })
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

  const txTables = collectTablesForIdRemap(item.table);
  await db.transaction("rw", [db.id_map, db.outbox, ...txTables], async () => {
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
    await remapLocalForeignKeys(item.table, result.localPk, result.remotePk);
    await remapOutboxReferences(item.table, result.pkField, result.localPk, result.remotePk);
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

function collectTablesForIdRemap(entity: string): Dexie.Table[] {
  const names = new Set<string>();
  names.add(entity);
  for (const edge of fkEdgesByParent.get(entity) ?? []) names.add(edge.childTable);
  return [...names].map((n) => db.table(n));
}

async function remapLocalForeignKeys(entity: string, localId: number | string, remoteId: number | string) {
  const edges = fkEdgesByParent.get(entity) ?? [];
  for (const edge of edges) {
    if (typeof localId !== "number" || typeof remoteId !== "number") continue;
    await db
      .table(edge.childTable)
      .where(edge.childField)
      .equals(localId as never)
      .modify({ [edge.childField]: remoteId } as never);
  }
}

async function remapOutboxReferences(
  entity: string,
  pkField: string,
  localId: number | string,
  remoteId: number | string,
) {
  const candidates = await db.outbox.where("status").anyOf("pending", "processing", "error").toArray();
  const edges = fkEdgesByParent.get(entity) ?? [];

  for (const item of candidates) {
    if (!item.id) continue;

    let changed = false;
    const next: Partial<OutboxItem> = {};

    if (item.table === entity) {
      if (item.pkValue === localId) {
        next.pkValue = remoteId;
        changed = true;
      }
      if (item.payload?.[pkField] === localId) {
        next.payload = { ...item.payload, [pkField]: remoteId };
        changed = true;
      }
    }

    for (const edge of edges) {
      if (item.payload?.[edge.childField] !== localId) continue;
      next.payload = { ...(next.payload ?? item.payload), [edge.childField]: remoteId };
      changed = true;
    }

    if (!changed) continue;
    next.updatedAt = Date.now();
    await db.outbox.update(item.id, next);
  }
}

async function resolvePayloadIds(
  tableName: string,
  raw: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const next = { ...raw } as Record<string, unknown>;
  const refs = fkEdgesByChild.get(tableName) ?? [];
  for (const edge of refs) {
    const v = next[edge.childField];
    if (typeof v !== "number" || v >= 0) continue;
    const mapped = await getMappedRemoteId(edge.parentTable, v);
    if (mapped === undefined) {
      throw new DeferredDependencyError(
        `waiting FK map: ${tableName}.${edge.childField}=${v} -> ${edge.parentTable}.${edge.parentPkField}`,
      );
    }
    next[edge.childField] = mapped;
  }
  return next;
}

async function resolveEntityPrimaryKey(entity: string, pkValue: number | string): Promise<number | string> {
  if (typeof pkValue !== "number" || pkValue >= 0) return pkValue;
  const mapped = await getMappedRemoteId(entity, pkValue);
  if (mapped === undefined) throw new DeferredDependencyError(`waiting PK map: ${entity} id=${pkValue}`);
  return mapped;
}

async function getMappedRemoteId(entity: string, localId: number): Promise<number | string | undefined> {
  const row = await db.id_map.where("[entity+localId]").equals([entity, localId]).first();
  return row?.remoteId;
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
