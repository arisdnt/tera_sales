import { db } from "../db/schema";
import { supabaseTables, supabaseViews } from "../db/supabaseMeta";
import { getSupabaseClient } from "./supabaseClient";

const PAGE_SIZE = 1000;

/**
 * Force resync all data from Supabase cloud to local IndexedDB.
 * This will clear local data and replace it with cloud data.
 * Pending outbox items will be preserved.
 */
export async function forceResyncFromCloud(
    onProgress?: (message: string) => void
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseClient();

    try {
        onProgress?.("Memulai sinkronisasi dari cloud...");

        // Sync all tables
        for (const table of supabaseTables) {
            onProgress?.(`Sinkronisasi tabel ${table.name}...`);
            await syncRelation(supabase, table.name, table.pkField);
        }

        // Sync all views
        for (const viewName of supabaseViews) {
            onProgress?.(`Sinkronisasi view ${viewName}...`);
            await syncRelation(supabase, viewName, undefined);
        }

        onProgress?.("Sinkronisasi selesai!");
        return { success: true };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("[CloudSync] Error:", errorMessage);
        onProgress?.(`Error: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
}

async function syncRelation(
    supabase: ReturnType<typeof getSupabaseClient>,
    name: string,
    pkField: string | undefined
) {
    const table = db.table(name);
    const allRows: Record<string, unknown>[] = [];
    let from = 0;

    while (true) {
        const { data, error } = await supabase
            .from(name)
            .select("*")
            .range(from, from + PAGE_SIZE - 1);

        if (error) throw new Error(`${name}: ${error.message}`);
        const chunk = (data ?? []) as Record<string, unknown>[];
        allRows.push(...chunk);

        if (chunk.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    if (pkField) {
        // Preserve pending outbox items
        const pendingPks = await getPendingOutboxPks(name);
        const preservedRows = await table.filter((row: Record<string, unknown>) => {
            const pk = row[pkField];
            return pendingPks.has(pk as string | number);
        }).toArray();

        await db.transaction("rw", table, async () => {
            await table.clear();
            await table.bulkPut(allRows as never[]);
            if (preservedRows.length) await table.bulkPut(preservedRows as never[]);
        });
        return;
    }

    // For views (no pkField), just replace all data
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

async function getPendingOutboxPks(tableName: string): Promise<Set<string | number>> {
    const pendingItems = await db.outbox
        .where("table")
        .equals(tableName)
        .and((item) => item.status === "pending" || item.status === "processing")
        .toArray();

    return new Set(
        pendingItems
            .map((item) => item.pkValue ?? item.localPk)
            .filter((pk): pk is string | number => pk !== undefined)
    );
}
