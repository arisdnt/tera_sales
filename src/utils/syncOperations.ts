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
