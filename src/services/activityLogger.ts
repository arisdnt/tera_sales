import { db, type ActivityLogRow, type OutboxItem, type OutboxOperation, type OutboxStatus } from "../db/schema";

const DOMAIN_TABLES = [
  "sales",
  "produk",
  "toko",
  "pengiriman",
  "detail_pengiriman",
  "penagihan",
  "detail_penagihan",
  "potongan_penagihan",
  "setoran",
  "pengeluaran_operasional",
];

const STATUS_MAP: Partial<Record<OutboxStatus, ActivityLogRow["status"]>> = {
  pending: "pending",
  processing: "pending",
  done: "success",
  error: "error",
};

let initialized = false;

export function initActivityLogger() {
  if (initialized) return;
  initialized = true;

  DOMAIN_TABLES.forEach(registerCrudHooks);
  registerOutboxHooks();
}

function registerCrudHooks(tableName: string) {
  const table = db.table(tableName);

  table.hook("creating", function (primKey, obj) {
    void logEntry({
      entity: tableName,
      action: "insert",
      status: "success",
      reference: toReference(primKey ?? extractPreferredKey(obj)),
      details: summarizePayload(obj),
    });
  });

  table.hook("updating", function (mods, primKey) {
    void logEntry({
      entity: tableName,
      action: "update",
      status: "success",
      reference: toReference(primKey),
      details: summarizePayload(mods),
    });
  });

  table.hook("deleting", function (primKey, obj) {
    void logEntry({
      entity: tableName,
      action: "delete",
      status: "success",
      reference: toReference(primKey ?? extractPreferredKey(obj)),
      details: summarizePayload(obj),
    });
  });
}

function registerOutboxHooks() {
  const table = db.outbox;

  table.hook("creating", function (primKey, obj) {
    void logOutboxEntry(primKey, obj);
  });

  table.hook("updating", function (mods, primKey, obj) {
    const next: OutboxItem = { ...obj, ...mods };
    void logOutboxEntry(primKey, next);
  });
}

async function logEntry(entry: Omit<ActivityLogRow, "id" | "createdAt">) {
  try {
    await db.activity_logs.add({
      ...entry,
      createdAt: Date.now(),
    });
  } catch (err) {
    // Silently fail if activity_logs table doesn't exist yet (schema upgrade pending)
    console.warn("[ActivityLogger] Failed to log entry:", err);
  }
}

function logOutboxEntry(primKey: unknown, item?: OutboxItem | null) {
  if (!item) return;
  const status = STATUS_MAP[item.status] ?? "pending";
  const action: OutboxOperation = item.op ?? "insert";
  const details = summarizePayload({
    target: item.table,
    attempts: item.attempts,
    lastError: item.lastError,
  });

  void logEntry({
    entity: `outbox:${item.table ?? "unknown"}`,
    action,
    status,
    reference: toReference(primKey ?? item.localPk ?? item.pkValue),
    details,
  });
}

function summarizePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const entries = Object.entries(payload as Record<string, unknown>).slice(0, 4);
  if (entries.length === 0) return null;
  const summary = entries
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join(", ");
  return summary.length > 120 ? `${summary.slice(0, 117)}...` : summary;
}

function extractPreferredKey(obj: unknown): string | number | null {
  if (!obj || typeof obj !== "object") return null;
  if ("id" in obj && typeof obj.id !== "object") return obj.id as string | number;
  if ("id_sales" in obj) return (obj as Record<string, unknown>)["id_sales"] as string | number;
  if ("id_toko" in obj) return (obj as Record<string, unknown>)["id_toko"] as string | number;
  if ("id_pengiriman" in obj) return (obj as Record<string, unknown>)["id_pengiriman"] as string | number;
  if ("id_penagihan" in obj) return (obj as Record<string, unknown>)["id_penagihan"] as string | number;
  return null;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value.length > 24 ? `${value.slice(0, 21)}...` : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

function toReference(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
