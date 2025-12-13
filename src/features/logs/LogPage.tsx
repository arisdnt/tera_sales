import { AlertCircle, CheckCircle2, TriangleAlert } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type ActivityLogRow } from "../../db/schema";

const STATUS_STYLES: Record<ActivityLogRow["status"], string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  success: "bg-emerald-100 text-emerald-800 border-emerald-300",
  error: "bg-red-100 text-red-800 border-red-300",
};

function formatTimestamp(value?: number) {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.toLocaleDateString("id-ID")} ${date.toLocaleTimeString("id-ID")}`;
}

export function LogPage() {
  const rows = useLiveQuery(
    () => db.activity_logs.orderBy("createdAt").reverse().limit(400).toArray(),
    [],
    []
  );

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <section className="flex-1 overflow-auto border-l border-r border-slate-200 bg-white">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600">
            <tr>
              <Th>Waktu</Th>
              <Th>Entity</Th>
              <Th>Aksi</Th>
              <Th>Status</Th>
              <Th>Referensi</Th>
              <Th>Detail</Th>
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((item) => (
                <tr key={item.id ?? `${item.entity}-${item.createdAt}`} className="border-b border-slate-100 hover:bg-slate-50">
                  <Td>
                    <div className="font-medium text-slate-900">{formatTimestamp(item.createdAt)}</div>
                  </Td>
                  <Td>
                    <span className="text-slate-800">{item.entity}</span>
                  </Td>
                  <Td>
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 uppercase">
                      {item.action}
                    </span>
                  </Td>
                  <Td>
                    <span className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}>
                      {item.status}
                    </span>
                  </Td>
                  <Td>
                    <div className="text-slate-700">{item.reference ?? "-"}</div>
                  </Td>
                  <Td>
                    <div className="flex items-start gap-2 text-slate-600">
                      {item.status === "error" ? (
                        <TriangleAlert size={12} className="text-red-500 mt-0.5" />
                      ) : item.status === "success" ? (
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5" />
                      ) : (
                        <AlertCircle size={12} className="text-amber-500 mt-0.5" />
                      )}
                      <span className="break-words text-slate-700">{item.details ?? "-"}</span>
                    </div>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                  Belum ada aktivitas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-r border-slate-200 px-3 py-2 font-semibold uppercase tracking-wide text-[11px]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="border-r border-slate-100 px-3 py-3 align-top">{children}</td>;
}
