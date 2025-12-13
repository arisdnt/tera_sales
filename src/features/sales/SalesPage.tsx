import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { SaleForm } from "./SaleForm";

export function SalesPage() {
  const sales = useLiveQuery(
    async () => {
      const rows = await db.sales.toArray();
      rows.sort((a, b) => a.nama_sales.localeCompare(b.nama_sales));
      return rows;
    },
    [],
    [],
  );

  return (
    <div className="flex h-full w-full flex-col bg-zinc-50">
      <div className="w-full px-4 py-6 lg:px-6">
        <div className="flex h-full flex-col gap-6 overflow-hidden lg:flex-row">
          {/* Form Section - Left */}
          <div className="w-full flex-shrink-0 lg:w-80">
            <SaleForm />
          </div>

          {/* Table Section - Right */}
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col border-2 border-slate-200 bg-white shadow-sm">
              {/* Table Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Daftar Sales</h2>
                <span className="text-xs text-slate-500">{sales.length} items</span>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto">
                {/* Column Headers */}
                <div className="flex items-center px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  <div className="flex-1">Nama Sales</div>
                  <div className="w-40">Telepon</div>
                  <div className="w-24 text-center">Status</div>
                </div>

                {/* Rows */}
                {sales.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-400">
                    Belum ada data sales
                  </div>
                ) : (
                  sales.map((s, idx) => (
                    <div
                      key={s.id_sales}
                      className={[
                        "flex items-center px-5 py-4 transition-colors hover:bg-slate-50",
                        idx !== sales.length - 1 ? "border-b border-slate-100" : "",
                      ].join(" ")}
                    >
                      {/* Name & ID */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{s.nama_sales}</span>
                          {s.__local && (
                            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
                              LOCAL
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">ID: {s.id_sales}</div>
                      </div>

                      {/* Phone */}
                      <div className="w-40 text-sm text-slate-600">
                        {s.nomor_telepon || <span className="text-slate-300">-</span>}
                      </div>

                      {/* Status */}
                      <div className="w-24 flex justify-center">
                        {s.status_aktif ? (
                          <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
