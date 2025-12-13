import { useState, useCallback } from "react";
import { Plus, Search, RotateCcw, Download, Eye, Edit, Trash2, Star, Package, TrendingUp, Activity, DollarSign } from "lucide-react";
import { useProdukData, type ProdukEvent } from "./useProdukData";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function ProdukPage() {
    const [filters, setFilters] = useState({
        search: "",
        statusProduk: "all",
        isPriority: "all",
    });

    const { events } = useProdukData(filters.statusProduk, filters.isPriority);

    const filteredRows = events.filter((e) => {
        if (filters.search) {
            const s = filters.search.toLowerCase();
            if (!e.namaProduk.toLowerCase().includes(s)) return false;
        }
        return true;
    });

    return (
        <div className="flex h-full w-full flex-col bg-white">
            <div className="min-w-[1100px] flex-1 flex flex-col overflow-hidden px-2">
                {/* Filters Section */}
                <div className="flex flex-col gap-3 border-l border-r border-b border-slate-200 bg-white px-3 py-3 lg:flex-row lg:items-end">
                    <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:items-center">
                        {/* Search */}
                        <div className="relative col-span-2 lg:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                className="h-9 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                placeholder="Cari produk..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        {/* Status */}
                        <div className="relative col-span-1 lg:w-36">
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={filters.statusProduk}
                                onChange={(e) => setFilters({ ...filters, statusProduk: e.target.value })}
                            >
                                <option value="all">Semua Status</option>
                                <option value="true">Aktif</option>
                                <option value="false">Tidak Aktif</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="relative col-span-1 lg:w-36">
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={filters.isPriority}
                                onChange={(e) => setFilters({ ...filters, isPriority: e.target.value })}
                            >
                                <option value="all">Semua</option>
                                <option value="true">Priority</option>
                                <option value="false">Non-Priority</option>
                            </select>
                        </div>

                        {/* Reset */}
                        <button
                            className="flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 lg:w-auto"
                            onClick={() => setFilters({ search: "", statusProduk: "all", isPriority: "all" })}
                            title="Reset Filter"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    <div className="mt-2 flex w-full gap-2 lg:ml-auto lg:mt-0 lg:w-auto">
                        <button className="flex h-9 flex-1 items-center justify-center gap-2 bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-900 lg:flex-none">
                            <Download size={16} />
                            <span className="whitespace-nowrap">Export</span>
                        </button>
                        <button className="flex h-9 flex-1 items-center justify-center gap-2 bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 lg:flex-none">
                            <Plus size={16} />
                            <span className="whitespace-nowrap">Produk</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 overflow-auto border-l border-slate-200 bg-white pb-4 pt-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    <div className="w-full">
                        <table className="w-full table-fixed border-collapse text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <th className="w-[20%] border-r border-slate-200 bg-slate-100 py-3 px-2 font-semibold text-slate-900 text-center">Nama Produk</th>
                                    <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Harga</th>
                                    <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Status</th>
                                    <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Dikirim</th>
                                    <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Terjual</th>
                                    <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Stok</th>
                                    <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Dibayar</th>
                                    <th className="w-[12%] border-r border-slate-200 bg-slate-100 pl-4 py-3 font-semibold text-slate-900 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-400">
                                            Tidak ada data produk
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRows.map((row) => <EventRow key={row.id} row={row} />)
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EventRow({ row }: { row: ProdukEvent }) {
    const stokColor = row.stokDiToko < 0 ? "text-red-600" : row.stokDiToko === 0 ? "text-yellow-600" : "text-green-600";

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            {/* Nama Produk */}
            <td className="w-[20%] border-r border-slate-200 px-2 py-3">
                <div className="flex items-center gap-2">
                    {row.isPriority && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                    <div className="text-sm font-medium text-slate-900 truncate">{row.namaProduk}</div>
                </div>
                <div className="text-xs text-slate-500">ID: {row.id}</div>
            </td>
            {/* Harga */}
            <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
                <span className="text-sm font-medium text-slate-900">{formatCurrency(row.hargaSatuan)}</span>
            </td>
            {/* Status */}
            <td className="w-[10%] border-r border-slate-200 px-2 py-3 text-center">
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${row.statusProduk ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {row.statusProduk ? "Aktif" : "Tidak Aktif"}
                </span>
            </td>
            {/* Dikirim */}
            <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <Package size={14} className="text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">{formatNumber(row.totalDikirim)}</span>
                </div>
            </td>
            {/* Terjual */}
            <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-sm font-medium text-green-600">{formatNumber(row.totalTerjual)}</span>
                </div>
            </td>
            {/* Stok */}
            <td className="w-[10%] border-r border-slate-200 px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <Activity size={14} className={stokColor} />
                    <span className={`text-sm font-medium ${stokColor}`}>{formatNumber(row.stokDiToko)}</span>
                </div>
                <div className="text-xs text-slate-400">Return: {formatNumber(row.totalDikembalikan)}</div>
            </td>
            {/* Dibayar */}
            <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                    <DollarSign size={14} className="text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">{formatCurrency(row.totalDibayar)}</span>
                </div>
            </td>
            {/* Aksi */}
            <td className="w-[12%] border-r border-slate-200 pl-4 py-3">
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-blue-50 text-blue-600" title="Detail"><Eye size={16} /></button>
                    <button className="p-1.5 hover:bg-amber-50 text-amber-600" title="Edit"><Edit size={16} /></button>
                    <button className="p-1.5 hover:bg-red-50 text-red-600" title="Hapus"><Trash2 size={16} /></button>
                </div>
            </td>
        </tr>
    );
}
