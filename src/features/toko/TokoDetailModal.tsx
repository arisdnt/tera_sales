import { X, Store, MapPin, Phone, User, ExternalLink, Truck, DollarSign, Warehouse } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type TokoData = {
    id_toko: number;
    nama_toko: string;
    kecamatan: string;
    kabupaten: string;
    noTelepon: string | null;
    linkGmaps: string | null;
    namaSales: string;
    statusToko: boolean;
    quantityShipped: number;
    quantitySold: number;
    remainingStock: number;
    totalRevenue: number;
};

type Props = {
    toko: TokoData;
    onClose: () => void;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function TokoDetailModal({ toko, onClose }: Props) {
    // Fetch pengiriman history for this toko
    const pengirimanHistory = useLiveQuery(
        async () => {
            const pengiriman = await db.pengiriman
                .where("id_toko")
                .equals(toko.id_toko)
                .reverse()
                .limit(10)
                .toArray();

            // Get details for each pengiriman
            const result = [];
            for (const p of pengiriman) {
                const details = await db.detail_pengiriman
                    .where("id_pengiriman")
                    .equals(p.id_pengiriman)
                    .toArray();
                const totalQty = details.reduce((sum, d) => sum + d.jumlah_kirim, 0);
                result.push({
                    ...p,
                    totalQty,
                    itemCount: details.length,
                });
            }
            return result;
        },
        [toko.id_toko],
        []
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-2xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Store size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Detail Toko</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Info Table */}
                    <div className="mb-5 border border-slate-200 bg-slate-50 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium w-28">Nama Toko</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold" colSpan={3}>{toko.nama_toko}</td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium">Wilayah</td>
                                    <td className="px-3 py-2 text-slate-900">
                                        {toko.kecamatan}, <span className="text-slate-500">{toko.kabupaten}</span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 font-medium w-20">Status</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${toko.statusToko ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {toko.statusToko ? "Aktif" : "Non-Aktif"}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium">Sales</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold">{toko.namaSales}</td>
                                    <td className="px-3 py-2 text-slate-500 font-medium">Telepon</td>
                                    <td className="px-3 py-2 text-slate-900">
                                        {toko.noTelepon ? (
                                            <a href={`tel:${toko.noTelepon}`} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                                <Phone size={12} className="text-green-600" /> {toko.noTelepon}
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic">-</span>
                                        )}
                                    </td>
                                </tr>
                                {toko.linkGmaps && (
                                    <tr className="border-b border-slate-200">
                                        <td className="px-3 py-2 text-slate-500 font-medium">Maps</td>
                                        <td className="px-3 py-2" colSpan={3}>
                                            <a href={toko.linkGmaps} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                                <ExternalLink size={12} /> Buka di Google Maps
                                            </a>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Warehouse size={16} />
                            Statistik Toko
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="border border-blue-200 bg-blue-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Truck size={14} className="text-blue-500" />
                                    <span className="text-xs text-blue-700">Dikirim</span>
                                </div>
                                <div className="text-lg font-bold text-blue-800">{formatNumber(toko.quantityShipped)}</div>
                            </div>
                            <div className="border border-green-200 bg-green-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <DollarSign size={14} className="text-green-500" />
                                    <span className="text-xs text-green-700">Terjual</span>
                                </div>
                                <div className="text-lg font-bold text-green-800">{formatNumber(toko.quantitySold)}</div>
                            </div>
                            <div className="border border-amber-200 bg-amber-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Warehouse size={14} className="text-amber-500" />
                                    <span className="text-xs text-amber-700">Stok</span>
                                </div>
                                <div className={`text-lg font-bold ${toko.remainingStock < 0 ? "text-red-600" : "text-amber-800"}`}>{formatNumber(toko.remainingStock)}</div>
                            </div>
                            <div className="border border-purple-200 bg-purple-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <span className="text-xs text-purple-700">Revenue</span>
                                </div>
                                <div className="text-sm font-bold text-purple-800">{formatCurrency(toko.totalRevenue)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Pengiriman History */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Truck size={16} />
                            Riwayat Pengiriman (10 Terakhir)
                        </h3>
                        <div className="border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">ID</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Tanggal</th>
                                        <th className="text-right px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Jenis</th>
                                        <th className="text-right px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pengirimanHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                Belum ada riwayat pengiriman
                                            </td>
                                        </tr>
                                    ) : (
                                        pengirimanHistory.map((p, idx) => (
                                            <tr key={p.id_pengiriman} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                <td className="px-4 py-2.5 font-mono text-slate-600">#{p.id_pengiriman}</td>
                                                <td className="px-4 py-2.5 text-slate-900">{p.tanggal_kirim}</td>
                                                <td className="px-4 py-2.5 text-right text-slate-600">{p.itemCount} produk</td>
                                                <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">{p.totalQty}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
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
