import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import Dexie from "dexie";
import type { SupabaseClient } from "@supabase/supabase-js";
import { db } from "../db/schema";
import { supabaseTables, supabaseViews } from "../db/supabaseMeta";
import { getSupabaseClient } from "../services/supabaseClient";

type Options = {
  enabled?: boolean;
  initialSync?: boolean;
  refreshViewsDebounceMs?: number;
  pageSize?: number;
};

export function useRealtimeSync(options: Options = {}) {
  const enabled = options.enabled ?? true;
  const refreshViewsDebounceMs = options.refreshViewsDebounceMs ?? 750;
  const pageSize = options.pageSize ?? 1000;

  const supabase = useMemo(() => getSupabaseClient(), []);
  const refreshTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    if (options.initialSync !== false) {
      void (async () => {
        await initialSyncAll(supabase, pageSize);
        if (!cancelled) scheduleViewsRefresh(supabase, refreshViewsDebounceMs, refreshTimer);
      })();
    }

    const channel = supabase.channel("dexie-mirror");

    for (const table of supabaseTables) {
      const pkField = table.pkField;
      if (!pkField) continue;
      const tableName = table.name;
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: tableName },
        async (payload) => {
          const eventType = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
          if (eventType === "DELETE") {
            const pkValue = (payload.old as Record<string, unknown>)[pkField];
            if (pkValue !== undefined && pkValue !== null) await db.table(tableName).delete(pkValue as never);
          } else {
            await db.table(tableName).put(payload.new as never);
          }
          scheduleViewsRefresh(supabase, refreshViewsDebounceMs, refreshTimer);
        },
      );
    }

    void channel.subscribe();

    return () => {
      cancelled = true;
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
      void supabase.removeChannel(channel);
    };
  }, [enabled, pageSize, refreshViewsDebounceMs, supabase, options.initialSync]);
}

function scheduleViewsRefresh(
  supabase: SupabaseClient,
  debounceMs: number,
  ref: MutableRefObject<number | null>,
) {
  if (ref.current) window.clearTimeout(ref.current);
  ref.current = window.setTimeout(() => void refreshAllViews(supabase), debounceMs);
}

async function initialSyncAll(supabase: SupabaseClient, pageSize: number) {
  for (const table of supabaseTables) {
    await syncRelation(supabase, table.name, table.pkField, pageSize);
  }
  for (const viewName of supabaseViews) {
    await syncRelation(supabase, viewName, undefined, pageSize);
  }
}

async function refreshAllViews(supabase: SupabaseClient) {
  await Promise.all(
    supabaseViews.map(async (viewName) => {
      await syncRelation(supabase, viewName, undefined, 2000);
    }),
  );
}

async function syncRelation(
  supabase: SupabaseClient,
  name: string,
  pkField: string | undefined,
  pageSize: number,
) {
  const table = db.table(name);
  const allRows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(name)
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    const chunk = (data ?? []) as Record<string, unknown>[];
    allRows.push(...chunk);

    if (chunk.length < pageSize) break;
    from += pageSize;
  }

  if (pkField) {
    const preserved = await preserveOptimisticRows(table, pkField);
    await db.transaction("rw", table, async () => {
      await table.clear();
      await table.bulkPut(allRows as never[]);
      if (preserved.length) await table.bulkPut(preserved as never[]);
    });
    return;
  }

  await db.transaction("rw", table, async () => {
    await table.clear();
    await table.bulkAdd(allRows.map(stripLocalId) as never[]);
  });
}

function stripLocalId(row: Record<string, unknown>) {
  const next = { ...row } as Record<string, unknown>;
  delete next.__id;
  return next;
}

async function preserveOptimisticRows(table: Dexie.Table, pkField: string): Promise<Record<string, unknown>[]> {
  const rows = (await table.toArray()) as Record<string, unknown>[];
  return rows.filter((r) => isOptimisticRow(r, pkField));
}

function isOptimisticRow(row: Record<string, unknown>, pkField: string): boolean {
  if (row.__local === true) return true;
  const pkValue = row[pkField];
  return typeof pkValue === "number" && pkValue < 0;
}
