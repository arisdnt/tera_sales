import { useState } from "react";
import { db } from "../../db/schema";

export function SaleForm() {
  const [namaSales, setNamaSales] = useState("");
  const [nomorTelepon, setNomorTelepon] = useState("");
  const [statusAktif, setStatusAktif] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const name = namaSales.trim();
    if (!name) {
      setError("Nama sales wajib diisi.");
      return;
    }

    setBusy(true);
    try {
      const now = new Date().toISOString();
      const localId = makeLocalNegativeId();

      await db.transaction("rw", db.sales, db.outbox, async () => {
        await db.sales.put({
          id_sales: localId,
          nama_sales: name,
          nomor_telepon: nomorTelepon.trim() ? nomorTelepon.trim() : null,
          status_aktif: statusAktif,
          dibuat_pada: now,
          diperbarui_pada: now,
          __local: true,
        });

        await db.outbox.add({
          table: "sales",
          op: "insert",
          pkField: "id_sales",
          localPk: localId,
          payload: {
            nama_sales: name,
            nomor_telepon: nomorTelepon.trim() ? nomorTelepon.trim() : null,
            status_aktif: statusAktif,
          },
          status: "pending",
          attempts: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      setNamaSales("");
      setNomorTelepon("");
      setStatusAktif(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full bg-white border-2 border-slate-200 shadow-sm lg:sticky lg:top-20">
      {/* Header */}
      <div className="px-5 py-4 border-b-2 border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Tambah Sales Baru</h3>
        <p className="mt-1 text-xs text-slate-500">Data akan disimpan secara optimistic</p>
      </div>

      {/* Form */}
      <form className="p-5 space-y-4" onSubmit={onSubmit}>
        {/* Nama Sales */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Nama Sales <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full h-10 px-3 border-2 border-slate-200 bg-slate-50 text-sm text-slate-900 
                     placeholder:text-slate-400 
                     focus:border-slate-900 focus:bg-white focus:outline-none
                     transition-all duration-150"
            value={namaSales}
            onChange={(e) => setNamaSales(e.target.value)}
            placeholder="Masukkan nama sales"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Nomor Telepon */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Nomor Telepon
          </label>
          <input
            className="w-full h-10 px-3 border-2 border-slate-200 bg-slate-50 text-sm text-slate-900 
                     placeholder:text-slate-400 
                     focus:border-slate-900 focus:bg-white focus:outline-none
                     transition-all duration-150"
            value={nomorTelepon}
            onChange={(e) => setNomorTelepon(e.target.value)}
            placeholder="Opsional"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between py-2">
          <span className="text-xs font-semibold text-slate-700">Status Aktif</span>
          <button
            type="button"
            onClick={() => setStatusAktif(!statusAktif)}
            className={[
              "relative w-11 h-6 transition-colors duration-200",
              statusAktif ? "bg-emerald-500" : "bg-slate-300",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-1 w-4 h-4 bg-white transition-transform duration-200",
                statusAktif ? "left-6" : "left-1",
              ].join(" ")}
            />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border-l-4 border-red-500">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-red-700">{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          className="w-full h-10 bg-slate-900 text-white font-semibold text-sm
                   hover:bg-slate-800 active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-150
                   flex items-center justify-center gap-2"
          type="submit"
          disabled={busy}
        >
          {busy ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Tambah Sales</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function makeLocalNegativeId(): number {
  return -Math.floor(Date.now() + Math.random() * 1000);
}
