import { X, MapPin, Phone, User, Package, Calendar, Hash } from "lucide-react";
import type { PengirimanDashboardRow } from "../../db/supabaseViewsExtras";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type Props = {
    row: PengirimanDashboardRow;
    onClose: () => void;
};

export function PengirimanDetailModal({ row, onClose }: Props) {
    // Fetch detail pengiriman items
    const details = useLiveQuery(
        async () => {
            if (!row.id_pengiriman) return [];
            const items = await db.detail_pengiriman
                .where("id_pengiriman")
                .equals(row.id_pengiriman)
                .toArray();

            // Get product names
            const produkIds = items.map((i) => i.id_produk);
            const produkList = await db.produk
                .where("id_produk")
                .anyOf(produkIds)
                .toArray();

            const produkMap = new Map(produkList.map((p) => [p.id_produk, p]));

            return items.map((item) => ({
                ...item,
                nama_produk: produkMap.get(item.id_produk)?.nama_produk ?? "-",
                harga_satuan: produkMap.get(item.id_produk)?.harga_satuan ?? 0,
            }));
        },
        [row.id_pengiriman],
        []
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-2xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Package size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Detail Pengiriman #{row.id_pengiriman ?? "-"}</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Compact Info Table */}
                    <div className="mb-5 border border-slate-200 bg-slate-50 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium w-28">Tanggal</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold">{row.tanggal_kirim ?? "-"}</td>
                                    <td className="px-3 py-2 text-slate-500 font-medium w-20">Qty</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold font-mono">{row.total_quantity?.toLocaleString() ?? "-"}</td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium">Toko</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold">
                                        {row.nama_toko ?? "-"}
                                        <span className="ml-2 text-slate-500 font-normal text-xs">{row.nomor_telepon_toko ?? ""}</span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 font-medium">Wilayah</td>
                                    <td className="px-3 py-2 text-slate-900">
                                        {row.kecamatan ?? "-"}, <span className="text-slate-500">{row.kabupaten ?? "-"}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2 text-slate-500 font-medium">Sales</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold" colSpan={3}>
                                        {row.nama_sales ?? "-"}
                                        <span className="ml-2 text-slate-500 font-normal text-xs">{row.nomor_telepon_sales ?? ""}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Detail Barang */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Package size={16} />
                            Detail Barang
                        </h3>
                        <div className="border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Produk</th>
                                        <th className="text-right px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Qty</th>
                                        <th className="text-right px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Harga</th>
                                        <th className="text-right px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                Memuat data...
                                            </td>
                                        </tr>
                                    ) : (
                                        details.map((item, idx) => (
                                            <tr key={item.id_detail_kirim} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                <td className="px-4 py-2.5 text-slate-900">{item.nama_produk}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-700">{item.jumlah_kirim}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                                                    {Number(item.harga_satuan).toLocaleString("id-ID")}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">
                                                    {(item.jumlah_kirim * Number(item.harga_satuan)).toLocaleString("id-ID")}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {details.length > 0 && (
                                    <tfoot className="bg-slate-100 border-t border-slate-200">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-2.5 text-right font-bold text-slate-700">Total</td>
                                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                                                {details
                                                    .reduce((sum, item) => sum + item.jumlah_kirim * Number(item.harga_satuan), 0)
                                                    .toLocaleString("id-ID")}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 bg-slate-50 flex justify-end items-center h-10">
                    <button
                        onClick={onClose}
                        className="px-4 py-1 text-sm bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
