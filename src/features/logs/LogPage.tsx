import { useLiveQuery } from "dexie-react-hooks";
import { db, type OutboxItem } from "../../db/schema";
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  RotateCcw,
  Package,
} from "lucide-react";
import { useState } from "react";

type FilterStatus = "all" | "pending" | "done" | "error";

const STATUS_CONFIG = {
  pending: {
    label: "Menunggu",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    icon: Clock,
    iconColor: "text-amber-500",
  },
  processing: {
    label: "Proses",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
    icon: RefreshCw,
    iconColor: "text-blue-500",
  },
  done: {
    label: "Sukses",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
    borderColor: "border-emerald-300",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  error: {
    label: "Gagal",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-300",
    icon: AlertTriangle,
    iconColor: "text-red-500",
  },
};

const OP_LABELS: Record<string, string> = {
  insert: "Tambah",
  update: "Edit",
  delete: "Hapus",
};

function formatTimestamp(value?: number) {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.toLocaleDateString("id-ID")} ${date.toLocaleTimeString("id-ID")}`;
}

function summarizePayload(item: OutboxItem): string {
  if (!item.payload) return "-";
  const entries = Object.entries(item.payload as Record<string, unknown>);
  if (entries.length === 0) return "-";
  return entries
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`)
    .join(", ");
}

export function LogPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isRetrying, setIsRetrying] = useState<number | null>(null);

  const outboxItems = useLiveQuery(
    () => db.outbox.orderBy("createdAt").reverse().limit(100).toArray(),
    [],
    []
  );

  const filteredItems = outboxItems?.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const counts = {
    all: outboxItems?.length ?? 0,
    pending: outboxItems?.filter((i) => i.status === "pending").length ?? 0,
    done: outboxItems?.filter((i) => i.status === "done").length ?? 0,
    error: outboxItems?.filter((i) => i.status === "error").length ?? 0,
  };

  async function handleRetry(item: OutboxItem) {
    if (!item.id) return;
    setIsRetrying(item.id);
    try {
      await db.outbox.update(item.id, {
        status: "pending",
        attempts: 0,
        lastError: undefined,
        updatedAt: Date.now(),
      });
    } finally {
      setIsRetrying(null);
    }
  }

  async function handleCancel(item: OutboxItem) {
    if (!item.id) return;
    if (!confirm("Yakin ingin membatalkan operasi ini? Data tidak akan disinkronkan ke server.")) {
      return;
    }
    await db.outbox.delete(item.id);
  }

  async function handleClearDone() {
    const doneItems = outboxItems?.filter((i) => i.status === "done") ?? [];
    if (doneItems.length === 0) return;
    if (!confirm(`Hapus ${doneItems.length} item yang sudah selesai?`)) return;
    const ids = doneItems.map((i) => i.id!).filter(Boolean);
    await db.outbox.bulkDelete(ids);
  }

  async function handleRetryAllFailed() {
    const errorItems = outboxItems?.filter((i) => i.status === "error") ?? [];
    if (errorItems.length === 0) return;
    await db.outbox.bulkUpdate(
      errorItems.map((i) => ({
        key: i.id!,
        changes: { status: "pending" as const, attempts: 0, lastError: undefined, updatedAt: Date.now() },
      }))
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-50">
      {/* Toolbar with Filters and Actions */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          {counts.error > 0 && (
            <button
              onClick={handleRetryAllFailed}
              className="flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              <RotateCcw size={14} />
              Retry Semua Gagal ({counts.error})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Tabs */}
          <div className="flex gap-1">
            {(["all", "pending", "error", "done"] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === status
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {status === "all" ? "Semua" : STATUS_CONFIG[status].label} ({counts[status]})
              </button>
            ))}
          </div>

          {counts.done > 0 && (
            <button
              onClick={handleClearDone}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Trash2 size={14} />
              Hapus Selesai ({counts.done})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <section className="flex-1 overflow-auto bg-white">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600">
            <tr>
              <Th width="15%">Waktu</Th>
              <Th width="10%">Tabel</Th>
              <Th width="8%">Operasi</Th>
              <Th width="10%">Status</Th>
              <Th width="7%">Retry</Th>
              <Th width="35%">Detail</Th>
              <Th width="15%">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const config = STATUS_CONFIG[item.status];
                const Icon = config.icon;
                return (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <Td>
                      <div className="text-slate-700">{formatTimestamp(item.createdAt)}</div>
                      {item.updatedAt !== item.createdAt && (
                        <div className="text-[10px] text-slate-400">
                          Updated: {formatTimestamp(item.updatedAt)}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <Package size={12} className="text-slate-400" />
                        <span className="font-medium text-slate-800">{item.table}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-700">
                        {OP_LABELS[item.op] ?? item.op}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold ${config.bgColor} ${config.textColor} ${config.borderColor}`}
                      >
                        <Icon size={10} className={config.iconColor} />
                        {config.label}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-slate-600">{item.attempts}</span>
                    </Td>
                    <Td>
                      <div className="text-slate-600">{summarizePayload(item)}</div>
                      {item.lastError && (
                        <div className="mt-1 text-[10px] text-red-500">{item.lastError}</div>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        {item.status === "error" && (
                          <button
                            onClick={() => handleRetry(item)}
                            disabled={isRetrying === item.id}
                            className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50"
                          >
                            <RotateCcw size={10} className={isRetrying === item.id ? "animate-spin" : ""} />
                            Retry
                          </button>
                        )}
                        {item.status === "pending" && (
                          <button
                            onClick={() => handleCancel(item)}
                            className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-200"
                          >
                            <Trash2 size={10} />
                            Batal
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-slate-400">
                  {filter === "all"
                    ? "Tidak ada item dalam antrian sync."
                    : `Tidak ada item dengan status "${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label ?? filter}".`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Th({ children, width }: { children: React.ReactNode; width?: string }) {
  return (
    <th
      className="border-r border-slate-200 px-3 py-2 font-semibold uppercase tracking-wide text-[11px]"
      style={{ width }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="border-r border-slate-100 px-3 py-3 align-top">{children}</td>;
}
