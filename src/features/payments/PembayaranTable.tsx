import { useEffect, useMemo, useRef } from "react";
import { Edit, Eye, Search, Trash2 } from "lucide-react";
import type { PengirimanDashboardRow } from "../../db/supabaseViewsExtras";

type Column = { key: string; title: string; widthClass: string; align?: "left" | "right" };

const COLUMNS: Column[] = [
  { key: "tanggal_kirim", title: "Tanggal Kirim", widthClass: "w-[10%]" },
  { key: "id_pengiriman", title: "ID Pengiriman", widthClass: "w-[10%]" },
  { key: "toko", title: "Toko", widthClass: "w-[12%]" },
  { key: "tel_toko", title: "Telepon Toko", widthClass: "w-[9%]" },
  { key: "wilayah", title: "Wilayah", widthClass: "w-[10%]" },
  { key: "sales", title: "Sales", widthClass: "w-[11%]" },
  { key: "tel_sales", title: "Telepon Sales", widthClass: "w-[9%]" },
  { key: "qty", title: "Qty", widthClass: "w-[6%]", align: "right" },
  { key: "detail", title: "Detail Barang", widthClass: "w-[13%]" },
  { key: "aksi", title: "Aksi", widthClass: "w-[10%]" },
];

export function PembayaranTable(props: { rows: PengirimanDashboardRow[] }) {
  const { rows } = props;
  const headerRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      if (headerRef.current) headerRef.current.scrollLeft = el.scrollLeft;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const colGroup = useMemo(
    () => (
      <colgroup>
        {COLUMNS.map((c) => (
          <col key={c.key} className={c.widthClass} />
        ))}
      </colgroup>
    ),
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="overflow-hidden border-b-2 border-slate-200 bg-gradient-to-r from-slate-700 to-slate-800 pr-2"
        ref={headerRef}
      >
        <table className="w-full table-fixed border-collapse">
          {colGroup}
          <thead>
            <tr className="text-xs font-bold uppercase tracking-wide text-white">
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className={`border-r border-slate-600 px-3 py-3 ${c.align === "right" ? "text-right" : "text-left"} last:border-r-0`}
                >
                  {c.title}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <div className="min-h-0 flex-1 overflow-auto table-scrollbar" ref={bodyRef}>
        <table className="w-full table-fixed border-collapse">
          {colGroup}
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="border-t border-slate-200 px-3 py-12 text-center text-sm text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="text-slate-300" size={48} />
                    <span>Tidak ada data untuk filter saat ini.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={`${row.id_pengiriman ?? "null"}-${idx}`}
                  className={`transition-colors hover:bg-[#005461]/5 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                >
                  <td className="border border-slate-200 px-3 py-2.5 font-mono text-xs">{row.tanggal_kirim ?? "-"}</td>
                  <td className="border border-slate-200 px-3 py-2.5 font-mono text-xs font-semibold text-[#005461]">
                    {row.id_pengiriman ?? "-"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5">
                    <div className="truncate font-semibold text-slate-900">{row.nama_toko ?? "-"}</div>
                    <div className="truncate text-[11px] text-slate-500">ID Toko: {row.id_toko ?? "-"}</div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5 font-mono text-xs">{row.nomor_telepon_toko ?? "-"}</td>
                  <td className="border border-slate-200 px-3 py-2.5">
                    <div className="truncate font-medium text-slate-800">{row.kecamatan ?? "-"}</div>
                    <div className="truncate text-[11px] text-slate-500">{row.kabupaten ?? "-"}</div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5">
                    <div className="truncate font-semibold text-slate-900">{row.nama_sales ?? "-"}</div>
                    <div className="truncate text-[11px] text-slate-500">ID Sales: {row.id_sales ?? "-"}</div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5 font-mono text-xs">{row.nomor_telepon_sales ?? "-"}</td>
                  <td className="border border-slate-200 px-3 py-2.5 text-right font-mono text-xs font-bold text-[#005461]">
                    {row.total_quantity?.toLocaleString() ?? "-"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5 text-[11px] text-slate-600">
                    <div className="truncate">{row.detail_pengiriman ?? "-"}</div>
                  </td>
                  <td className="border border-slate-200 px-3 py-2.5">
                    <div className="flex gap-1.5 text-[11px]">
                      <button className="flex items-center gap-1 border border-blue-500 bg-blue-50 px-2 py-1.5 font-semibold text-blue-700 transition-colors hover:bg-blue-100">
                        <Eye size={13} />
                        <span className="hidden xl:inline">Detail</span>
                      </button>
                      <button className="flex items-center gap-1 border border-amber-500 bg-amber-50 px-2 py-1.5 font-semibold text-amber-700 transition-colors hover:bg-amber-100">
                        <Edit size={13} />
                        <span className="hidden xl:inline">Edit</span>
                      </button>
                      <button className="flex items-center gap-1 border border-red-500 bg-red-50 px-2 py-1.5 font-semibold text-red-700 transition-colors hover:bg-red-100">
                        <Trash2 size={13} />
                        <span className="hidden xl:inline">Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
