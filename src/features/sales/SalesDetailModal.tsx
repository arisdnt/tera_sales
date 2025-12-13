import { X, User, Phone, Store, Package, DollarSign, Truck, Warehouse } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type SalesData = {
    id: number;
    namaSales: string;
    nomorTelepon: string | null;
    statusAktif: boolean;
    totalStores: number;
    quantityShipped: number;
    quantitySold: number;
    remainingStock: number;
    totalRevenue: number;
};

type Props = {
    sales: SalesData;
    onClose: () => void;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function SalesDetailModal({ sales, onClose }: Props) {
    // Fetch toko list for this sales
    const tokoList = useLiveQuery(
        async () => {
            return db.toko.filter((t) => t.id_sales === sales.id).toArray();
        },
        [sales.id],
        []
    );

    // Fetch recent pengiriman
    const recentPengiriman = useLiveQuery(
        async () => {
            const tokoIds = tokoList.map((t) => t.id_toko);
            if (tokoIds.length === 0) return [];

            const pengiriman = await db.pengiriman
                .filter((p) => tokoIds.includes(p.id_toko ?? 0))
                .reverse()
                .limit(10)
                .toArray();

            const tokoMap = new Map(tokoList.map((t) => [t.id_toko, t.nama_toko]));

            const result = [];
            for (const p of pengiriman) {
                const details = await db.detail_pengiriman
                    .where("id_pengiriman")
                    .equals(p.id_pengiriman)
                    .toArray();
                const totalQty = details.reduce((sum, d) => sum + d.jumlah_kirim, 0);
                result.push({
                    ...p,
                    nama_toko: tokoMap.get(p.id_toko ?? 0) ?? "-",
                    totalQty,
                });
            }
            return result;
        },
        [tokoList],
        []
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-2xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <User size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Detail Sales</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Info Table */}
                    <div className="mb-5 border border-slate-200 bg-slate-50 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium w-28">Nama Sales</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold">{sales.namaSales}</td>
                                    <td className="px-3 py-2 text-slate-500 font-medium w-20">ID</td>
                                    <td className="px-3 py-2 text-slate-900 font-mono">#{sales.id}</td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium">Telepon</td>
                                    <td className="px-3 py-2 text-slate-900">
                                        {sales.nomorTelepon ? (
                                            <a href={`tel:${sales.nomorTelepon}`} className="text-blue-600 hover:underline inline-flex items-center gap-1">
                                                <Phone size={12} className="text-green-600" /> {sales.nomorTelepon}
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 font-medium">Status</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${sales.statusAktif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {sales.statusAktif ? "Aktif" : "Non-Aktif"}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Warehouse size={16} />
                            Statistik Sales
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                            <div className="border border-blue-200 bg-blue-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Store size={14} className="text-blue-500" />
                                    <span className="text-xs text-blue-700">Toko</span>
                                </div>
                                <div className="text-lg font-bold text-blue-800">{formatNumber(sales.totalStores)}</div>
                            </div>
                            <div className="border border-indigo-200 bg-indigo-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Truck size={14} className="text-indigo-500" />
                                    <span className="text-xs text-indigo-700">Dikirim</span>
                                </div>
                                <div className="text-lg font-bold text-indigo-800">{formatNumber(sales.quantityShipped)}</div>
                            </div>
                            <div className="border border-green-200 bg-green-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <DollarSign size={14} className="text-green-500" />
                                    <span className="text-xs text-green-700">Terjual</span>
                                </div>
                                <div className="text-lg font-bold text-green-800">{formatNumber(sales.quantitySold)}</div>
                            </div>
                            <div className="border border-amber-200 bg-amber-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Package size={14} className="text-amber-500" />
                                    <span className="text-xs text-amber-700">Stok</span>
                                </div>
                                <div className={`text-lg font-bold ${sales.remainingStock < 0 ? "text-red-600" : "text-amber-800"}`}>{formatNumber(sales.remainingStock)}</div>
                            </div>
                            <div className="border border-purple-200 bg-purple-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <span className="text-xs text-purple-700">Revenue</span>
                                </div>
                                <div className="text-sm font-bold text-purple-800">{formatCurrency(sales.totalRevenue)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Toko List */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Store size={16} />
                            Daftar Toko ({tokoList.length})
                        </h3>
                        <div className="border border-slate-200 max-h-40 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 sticky top-0">
                                    <tr>
                                        <th className="text-left px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">Nama Toko</th>
                                        <th className="text-left px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">Wilayah</th>
                                        <th className="text-center px-4 py-2 font-semibold text-slate-700 border-b border-slate-200">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokoList.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-4 text-center text-slate-500">
                                                Belum ada toko
                                            </td>
                                        </tr>
                                    ) : (
                                        tokoList.map((t, idx) => (
                                            <tr key={t.id_toko} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                <td className="px-4 py-2 text-slate-900">{t.nama_toko}</td>
                                                <td className="px-4 py-2 text-slate-600">{t.kecamatan}, {t.kabupaten}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${t.status_toko ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                        {t.status_toko ? "Aktif" : "Non-Aktif"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Pengiriman */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Truck size={16} />
                            Pengiriman Terakhir (10)
                        </h3>
                        <div className="border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">ID</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Toko</th>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Tanggal</th>
                                        <th className="text-right px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPengiriman.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                Belum ada riwayat pengiriman
                                            </td>
                                        </tr>
                                    ) : (
                                        recentPengiriman.map((p, idx) => (
                                            <tr key={p.id_pengiriman} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                <td className="px-4 py-2.5 font-mono text-slate-600">#{p.id_pengiriman}</td>
                                                <td className="px-4 py-2.5 text-slate-900">{p.nama_toko}</td>
                                                <td className="px-4 py-2.5 text-slate-600">{p.tanggal_kirim}</td>
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
