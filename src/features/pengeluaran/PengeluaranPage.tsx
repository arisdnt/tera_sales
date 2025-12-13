import { useState, useCallback } from "react";
import { Plus, Search, Calendar, RotateCcw, Download, Eye, Edit, Trash2, ImageIcon } from "lucide-react";
import { TambahPengeluaranModal } from "./TambahPengeluaranModal";
import { usePengeluaranData, type DateRangeKey, type PengeluaranEvent } from "./usePengeluaranData";

const DATE_RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
    { key: "all", label: "Semua Waktu" },
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "7 Hari Terakhir" },
    { key: "month", label: "30 Hari Terakhir" },
    { key: "current_month", label: "Bulan Ini" },
    { key: "last_month", label: "Bulan Lalu" },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

export function PengeluaranPage() {
    const [filters, setFilters] = useState({ search: "", dateRange: "all" as DateRangeKey });
    const [showTambahModal, setShowTambahModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { events, totalPengeluaran } = usePengeluaranData(filters.dateRange);

    const filteredRows = events.filter((e) => {
        if (filters.search) {
            const s = filters.search.toLowerCase();
            if (!e.keterangan.toLowerCase().includes(s)) return false;
        }
        return true;
    });

    const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    return (
        <div className="flex h-full w-full flex-col bg-white">
            <div className="min-w-[900px] flex-1 flex flex-col overflow-hidden px-2">
                {/* Filters Section */}
                <div className="flex flex-col gap-3 border-l border-r border-b border-slate-200 bg-white px-3 py-3 lg:flex-row lg:items-end">
                    <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:items-center">
                        {/* Search */}
                        <div className="relative col-span-2 lg:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                className="h-9 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                placeholder="Cari keterangan..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        {/* Date Range */}
                        <div className="relative col-span-1 lg:w-40">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={filters.dateRange}
                                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as DateRangeKey })}
                            >
                                {DATE_RANGE_OPTIONS.map((opt) => (
                                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Reset */}
                        <button
                            className="flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 lg:w-auto"
                            onClick={() => setFilters({ search: "", dateRange: "all" })}
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
                        <button
                            className="flex h-9 flex-1 items-center justify-center gap-2 bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 lg:flex-none"
                            onClick={() => setShowTambahModal(true)}
                        >
                            <Plus size={16} />
                            <span className="whitespace-nowrap">Pengeluaran</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 overflow-auto border-l border-slate-200 bg-white pb-4 pt-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    <div className="w-full">
                        <table className="w-full table-fixed border-collapse text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                                <tr>
                                    <th className="w-[12%] border-r border-slate-200 bg-slate-100 py-3 font-semibold text-slate-900 text-center">Tanggal</th>
                                    <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">ID</th>
                                    <th className="w-[35%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Keterangan</th>
                                    <th className="w-[15%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Jumlah</th>
                                    <th className="w-[13%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Bukti</th>
                                    <th className="w-[15%] border-r border-slate-200 bg-slate-100 pl-4 py-3 font-semibold text-slate-900 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            Tidak ada data pengeluaran
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

            {showTambahModal && (
                <TambahPengeluaranModal onClose={() => setShowTambahModal(false)} onSave={handleRefresh} />
            )}
        </div>
    );
}

function EventRow({ row }: { row: PengeluaranEvent }) {
    const date = new Date(row.tanggal);

    return (
        <tr className="border-b border-slate-200 hover:bg-slate-50">
            {/* Tanggal */}
            <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
                <span className="text-sm font-medium text-slate-900">
                    {date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </span>
            </td>
            {/* ID */}
            <td className="w-[10%] border-r border-slate-200 px-2 py-3 text-center">
                <span className="font-mono text-sm font-medium text-slate-900">#{row.id}</span>
            </td>
            {/* Keterangan */}
            <td className="w-[35%] border-r border-slate-200 px-2 py-3">
                <div className="text-sm font-medium text-slate-900 truncate">{row.keterangan}</div>
            </td>
            {/* Jumlah */}
            <td className="w-[15%] border-r border-slate-200 px-2 py-3 text-center">
                <span className="text-sm font-semibold text-red-600">{formatCurrency(row.jumlah)}</span>
            </td>
            {/* Bukti */}
            <td className="w-[13%] border-r border-slate-200 px-2 py-3 text-center">
                {row.urlBuktiFoto ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <ImageIcon size={10} /> Ada
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">Tidak ada</span>
                )}
            </td>
            {/* Aksi */}
            <td className="w-[15%] border-r border-slate-200 pl-4 py-3">
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-blue-50 text-blue-600" title="Detail">
                        <Eye size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-amber-50 text-amber-600" title="Edit">
                        <Edit size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 text-red-600" title="Hapus">
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}
