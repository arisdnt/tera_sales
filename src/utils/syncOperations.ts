import { db } from "../db/schema";

/**
 * Delete a record with sync to Supabase via outbox.
 * This ensures the delete operation is propagated to the remote database.
 */
export async function deleteWithSync(
    tableName: string,
    pkField: string,
    pkValue: number | string
): Promise<void> {
    await db.transaction("rw", db.table(tableName), db.outbox, async () => {
        // 1. Add to outbox FIRST (this gets synced to Supabase)
        await db.outbox.add({
            table: tableName,
            op: "delete",
            pkField,
            pkValue,
            payload: { [pkField]: pkValue },
            status: "pending",
            attempts: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // 2. Delete locally (immediate UI feedback)
        await db.table(tableName).delete(pkValue);
    });
}

/**
 * Update a record with sync to Supabase via outbox.
 * This ensures the update operation is propagated to the remote database.
 */
export async function updateWithSync(
    tableName: string,
    pkField: string,
    pkValue: number | string,
    payload: Record<string, unknown>
): Promise<void> {
    const now = new Date().toISOString();
    const fullPayload = {
        ...payload,
        [pkField]: pkValue,
        diperbarui_pada: now,
    };

    await db.transaction("rw", db.table(tableName), db.outbox, async () => {
        // 1. Update locally (immediate UI feedback)
        await db.table(tableName).update(pkValue, fullPayload);

        // 2. Add to outbox for sync to Supabase
        await db.outbox.add({
            table: tableName,
            op: "update",
            pkField,
            pkValue,
            payload: fullPayload,
            status: "pending",
            attempts: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    });
}

/**
 * Generate a negative local ID for optimistic inserts.
 * This ID will be replaced by Supabase's auto-generated ID after sync.
 */
function makeLocalNegativeId(): number {
    return -Math.floor(Date.now() + Math.random() * 1000);
}

/**
 * Insert a record with sync to Supabase via outbox.
 * Uses negative local ID pattern - the ID in payload is only for local storage.
 * After sync, Supabase will assign a positive ID and local record will be replaced.
 * 
 * IMPORTANT: payload should NOT contain the pkField value - this function will add it.
 */
export async function insertWithSync(
    tableName: string,
    pkField: string,
    payload: Record<string, unknown>
): Promise<number> {
    const localId = makeLocalNegativeId();
    const now = new Date().toISOString();

    // Prepare local record with negative ID and __local flag
    const localRecord = {
        ...payload,
        [pkField]: localId,
        __local: true,
        dibuat_pada: payload.dibuat_pada ?? now,
        diperbarui_pada: now,
    };

    // Prepare payload for Supabase (WITHOUT the pkField - let Supabase auto-generate)
    const supabasePayload = { ...payload };
    delete supabasePayload[pkField];
    delete supabasePayload.__local;

    await db.transaction("rw", db.table(tableName), db.outbox, async () => {
        // 1. Save locally with negative ID for immediate UI feedback
        await db.table(tableName).put(localRecord);

        // 2. Add to outbox for sync to Supabase
        await db.outbox.add({
            table: tableName,
            op: "insert",
            pkField,
            localPk: localId, // Worker will use this to delete local record after sync
            payload: supabasePayload, // No pkField - Supabase will auto-generate
            status: "pending",
            attempts: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    });

    return localId;
}
