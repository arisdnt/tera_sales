import { X, Package, Star, TrendingUp, TrendingDown, Activity, DollarSign, Warehouse } from "lucide-react";

type ProdukData = {
    id: number;
    namaProduk: string;
    hargaSatuan: number;
    statusProduk: boolean;
    isPriority: boolean;
    priorityOrder: number | null;
    totalDikirim: number;
    totalTerjual: number;
    totalDikembalikan: number;
    stokDiToko: number;
    totalDibayar: number;
};

type Props = {
    produk: ProdukData;
    onClose: () => void;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function DetailProdukModal({ produk, onClose }: Props) {
    const stokColor = produk.stokDiToko < 0 ? "text-red-600" : produk.stokDiToko === 0 ? "text-yellow-600" : "text-green-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-2xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Package size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Detail Produk</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Info Table */}
                    <div className="mb-5 border border-slate-200 bg-slate-50 text-sm">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium w-32">ID Produk</td>
                                    <td className="px-3 py-2 text-slate-900 font-mono">#{produk.id}</td>
                                    <td className="px-3 py-2 text-slate-500 font-medium w-28">Status</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${produk.statusProduk ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {produk.statusProduk ? "Aktif" : "Tidak Aktif"}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium">Nama Produk</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold" colSpan={3}>
                                        <div className="flex items-center gap-2">
                                            {produk.isPriority && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                            {produk.namaProduk}
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-slate-200">
                                    <td className="px-3 py-2 text-slate-500 font-medium">Harga Satuan</td>
                                    <td className="px-3 py-2 text-slate-900 font-semibold">{formatCurrency(produk.hargaSatuan)}</td>
                                    <td className="px-3 py-2 text-slate-500 font-medium">Prioritas</td>
                                    <td className="px-3 py-2">
                                        {produk.isPriority ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                <Star size={12} className="fill-yellow-600" />
                                                Priority {produk.priorityOrder ? `#${produk.priorityOrder}` : ""}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Non-Priority</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics */}
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Warehouse size={16} />
                            Statistik Produk
                        </h3>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="border border-blue-200 bg-blue-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Package size={14} className="text-blue-500" />
                                    <span className="text-xs text-blue-700">Dikirim</span>
                                </div>
                                <div className="text-lg font-bold text-blue-800">{formatNumber(produk.totalDikirim)}</div>
                            </div>
                            <div className="border border-green-200 bg-green-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <TrendingUp size={14} className="text-green-500" />
                                    <span className="text-xs text-green-700">Terjual</span>
                                </div>
                                <div className="text-lg font-bold text-green-800">{formatNumber(produk.totalTerjual)}</div>
                            </div>
                            <div className="border border-orange-200 bg-orange-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <TrendingDown size={14} className="text-orange-500" />
                                    <span className="text-xs text-orange-700">Dikembalikan</span>
                                </div>
                                <div className="text-lg font-bold text-orange-800">{formatNumber(produk.totalDikembalikan)}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`border p-3 text-center ${produk.stokDiToko < 0 ? "border-red-200 bg-red-50" : produk.stokDiToko === 0 ? "border-yellow-200 bg-yellow-50" : "border-green-200 bg-green-50"}`}>
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Activity size={14} className={stokColor} />
                                    <span className={`text-xs ${stokColor.replace("text-", "text-")}`}>Stok di Toko</span>
                                </div>
                                <div className={`text-2xl font-bold ${stokColor}`}>{formatNumber(produk.stokDiToko)}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    {produk.stokDiToko < 0 && "⚠️ Stok kurang!"}
                                    {produk.stokDiToko === 0 && "⚠️ Stok habis"}
                                    {produk.stokDiToko > 0 && "✓ Stok tersedia"}
                                </div>
                            </div>
                            <div className="border border-purple-200 bg-purple-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <DollarSign size={14} className="text-purple-500" />
                                    <span className="text-xs text-purple-700">Total Dibayar</span>
                                </div>
                                <div className="text-lg font-bold text-purple-800">{formatCurrency(produk.totalDibayar)}</div>
                                <div className="text-xs text-slate-500 mt-1">Revenue dari produk ini</div>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="p-3 bg-blue-50 border border-blue-200 text-sm">
                        <p className="text-blue-800">
                            <strong>Perhitungan Stok:</strong> Stok = Dikirim - Terjual - Dikembalikan
                        </p>
                        <p className="text-blue-700 text-xs mt-1">
                            {produk.totalDikirim} - {produk.totalTerjual} - {produk.totalDikembalikan} = {produk.stokDiToko}
                        </p>
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
