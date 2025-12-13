import { db, type KvRow } from "../db/schema";

export async function setKv<T>(key: string, value: T): Promise<void> {
  console.log('Setting KV:', key, typeof value === 'object' ? (value as any).status || 'object' : value);

  // Use put() for atomic upsert - this will insert or update based on existing record
  await db.transaction('rw', db.kv, async () => {
    // Find existing record by key
    const existing = await db.kv.where('key').equals(key).first();

    if (existing?.id) {
      // Update existing record using put() with the existing ID
      const row: KvRow = { id: existing.id, key, value, updatedAt: Date.now() };
      await db.kv.put(row);
      console.log('KV updated with ID:', existing.id);
    } else {
      // Insert new record using put() without ID (will auto-increment)
      const row: KvRow = { key, value, updatedAt: Date.now() };
      const id = await db.kv.put(row);
      console.log('KV added with ID:', id);
    }
  });

  console.log('KV set completed');
}

export async function getKv<T>(key: string): Promise<T | undefined> {
  const row = await db.kv.where('key').equals(key).first();
  console.log('Getting KV:', key, row ? 'found' : 'not found');
  return row?.value as T | undefined;
}

export async function deleteKv(key: string): Promise<void> {
  console.log('Deleting KV:', key);
  const record = await db.kv.where('key').equals(key).first();
  if (record?.id) {
    await db.kv.delete(record.id);
    console.log('KV deleted with ID:', record.id);
  } else {
    console.log('KV not found for deletion');
  }
  console.log('KV delete completed');
}

