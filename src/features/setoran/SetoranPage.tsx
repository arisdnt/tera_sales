import { useState, useCallback, useMemo } from "react";
import { List } from "react-window";
import { Plus, Search, Calendar, RotateCcw, Download, Eye, Edit, Trash2, Filter, Banknote } from "lucide-react";
import { SetoranKPICards } from "./SetoranKPICards";
import { TambahSetoranModal } from "./TambahSetoranModal";
import { useSetoranData, type DateRangeKey, type CashFlowEvent } from "./useSetoranData";

const DATE_RANGE_OPTIONS: { key: DateRangeKey; label: string }[] = [
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "7 Hari Terakhir" },
    { key: "month", label: "30 Hari Terakhir" },
    { key: "current_month", label: "Bulan Ini" },
    { key: "last_month", label: "Bulan Lalu" },
    { key: "all", label: "Semua Data" },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

export function SetoranPage() {
    const [dateRange, setDateRange] = useState<DateRangeKey>("current_month");
    const [search, setSearch] = useState("");
    const [eventFilter, setEventFilter] = useState<"all" | "CASH_IN" | "TRANSFER_IN" | "SETORAN">("all");
    const [showTambahModal, setShowTambahModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const { events, kpis } = useSetoranData(dateRange);

    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            if (eventFilter !== "all" && e.type !== eventFilter) return false;
            if (search) {
                const s = search.toLowerCase();
                if (
                    !e.description.toLowerCase().includes(s) &&
                    !e.tokoName.toLowerCase().includes(s) &&
                    !e.salesName.toLowerCase().includes(s) &&
                    !(e.penerimaSetoran || "").toLowerCase().includes(s)
                )
                    return false;
            }
            return true;
        });
    }, [events, eventFilter, search]);

    const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    const resetFilters = () => {
        setDateRange("current_month");
        setSearch("");
        setEventFilter("all");
    };

    return (
        <div className="flex h-full w-full flex-col bg-white">
            <div className="min-w-[1000px] flex-1 flex flex-col overflow-hidden px-2">
                {/* Filters Section */}
                <div className="flex flex-col gap-3 border-l border-r border-b border-slate-200 bg-white px-3 py-3 lg:flex-row lg:items-end">
                    <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:items-center">
                        {/* Search */}
                        <div className="relative col-span-2 lg:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                className="h-9 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                placeholder="Cari transaksi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Date Range */}
                        <div className="relative col-span-1 lg:w-40">
                            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
                            >
                                {DATE_RANGE_OPTIONS.map((opt) => (
                                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Event Type Filter */}
                        <div className="relative col-span-1 lg:w-44">
                            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={eventFilter}
                                onChange={(e) => setEventFilter(e.target.value as typeof eventFilter)}
                            >
                                <option value="all">Semua Transaksi</option>
                                <option value="CASH_IN">💰 Cash Masuk</option>
                                <option value="TRANSFER_IN">💳 Transfer Masuk</option>
                                <option value="SETORAN">📤 Setoran</option>
                            </select>
                        </div>

                        {/* Reset */}
                        <button
                            className="flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 lg:w-auto"
                            onClick={resetFilters}
                            title="Reset Filter"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    <div className="mt-2 flex w-full gap-2 lg:ml-auto lg:mt-0 lg:w-auto">
                        <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
                            {filteredEvents.length} transaksi
                        </div>
                        <button className="flex h-9 flex-1 items-center justify-center gap-2 bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-900 lg:flex-none">
                            <Download size={16} />
                            <span className="whitespace-nowrap">Export</span>
                        </button>
                        <button
                            className="flex h-9 flex-1 items-center justify-center gap-2 bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 lg:flex-none"
                            onClick={() => setShowTambahModal(true)}
                        >
                            <Plus size={16} />
                            <span className="whitespace-nowrap">Setoran</span>
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="border-l border-r border-slate-200 bg-white px-3 py-3">
                    <SetoranKPICards data={kpis} />
                </div>

                {/* Table Section */}
                <div className="flex-1 flex flex-col overflow-hidden border-l border-slate-200 bg-white">
                    {/* Table Header - Fixed, div-based to match body */}
                    <div className="flex bg-slate-100 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)] text-sm font-semibold text-slate-900">
                        <div className="w-[10%] px-2 py-3 border-r border-slate-200 text-center">ID & Jenis</div>
                        <div className="w-[22%] px-2 py-3 border-r border-slate-200 text-center">Jumlah & Deskripsi</div>
                        <div className="w-[18%] px-2 py-3 border-r border-slate-200 text-center">Penerima & Balance</div>
                        <div className="w-[14%] px-2 py-3 border-r border-slate-200 text-center">Waktu</div>
                        <div className="w-[12%] px-2 py-3 border-r border-slate-200 text-center">Status</div>
                        <div className="w-[14%] px-2 py-3 border-r border-slate-200 text-center">Area</div>
                        <div className="w-[10%] px-2 py-3 text-center">Aksi</div>
                    </div>
                    {/* Body - Virtualized */}
                    <div className="flex-1 overflow-hidden [&_*]:[-webkit-scrollbar]:hidden [&_*]:[scrollbar-width:none]">
                        {filteredEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
                                <Search size={32} className="text-slate-300" />
                                <p>Tidak ada transaksi</p>
                            </div>
                        ) : (
                            <List
                                defaultHeight={600}
                                rowCount={filteredEvents.length}
                                rowHeight={80}
                                rowProps={{}}
                                rowComponent={({ index, style }) => {
                                    const e = filteredEvents[index];
                                    return (
                                        <div style={style}>
                                            <EventRow key={`${e.type}-${e.id}`} event={e} />
                                        </div>
                                    );
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {showTambahModal && (
                <TambahSetoranModal onClose={() => setShowTambahModal(false)} onSave={handleRefresh} />
            )}
        </div>
    );
}

function EventRow({ event }: { event: CashFlowEvent }) {
    const getTypeDisplay = (type: string) => {
        switch (type) {
            case "CASH_IN":
                return { icon: "💰", text: "Cash Masuk", color: "text-green-600" };
            case "TRANSFER_IN":
                return { icon: "💳", text: "Transfer Masuk", color: "text-blue-600" };
            case "SETORAN":
                return { icon: "📤", text: "Setoran", color: "text-purple-600" };
            default:
                return { icon: "📊", text: "Transaksi", color: "text-gray-600" };
        }
    };
    const typeDisplay = getTypeDisplay(event.type);
    const date = new Date(event.dateTime);
    const cashHigh = event.cashOnHand > 1000000;
    const cashNeg = event.cashOnHand < 0;

    const amountColor =
        event.type === "SETORAN"
            ? "text-purple-900"
            : event.type === "TRANSFER_IN"
                ? "text-blue-900"
                : "text-green-900";

    const statusBg =
        event.type === "CASH_IN"
            ? "bg-green-100 text-green-800"
            : event.type === "TRANSFER_IN"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800";

    const statusLabel =
        event.type === "CASH_IN" ? "Cash In" : event.type === "TRANSFER_IN" ? "Transfer In" : "Cash Out";

    const balanceColor = cashHigh ? "text-orange-600" : cashNeg ? "text-red-600" : "text-green-600";
    const balanceStatus = cashHigh ? "⚠️ Tinggi" : cashNeg ? "❌ Negatif" : "✅ Normal";

    return (
        <div className="flex border-b border-slate-100 hover:bg-slate-50 text-xs">
            {/* ID & Jenis */}
            <div className="w-[10%] px-2 py-2 border-r border-slate-100">
                <div className="font-mono font-medium text-slate-900">#{event.id}</div>
                <div className="text-slate-500">{event.date}</div>
                <div className={`font-medium mt-1 ${typeDisplay.color}`}>
                    {typeDisplay.icon} {typeDisplay.text}
                </div>
            </div>

            {/* Jumlah & Deskripsi */}
            <div className="w-[22%] px-2 py-2 border-r border-slate-100">
                <div className={`font-semibold ${amountColor}`}>{formatCurrency(event.amount)}</div>
                <div className="text-slate-600 mt-1 truncate" title={event.description}>
                    {event.description}
                </div>
                {event.tokoName && event.tokoName !== "-" && (
                    <div className="text-slate-500 mt-1 truncate">{event.tokoName}</div>
                )}
                {event.salesName && event.salesName !== "-" && (
                    <div className="text-slate-400 truncate">{event.salesName}</div>
                )}
            </div>

            {/* Penerima & Balance */}
            <div className="w-[18%] px-2 py-2 border-r border-slate-100">
                <div className="font-medium text-slate-900 truncate">{event.penerimaSetoran || "Sistem"}</div>
                <div className={`font-medium ${balanceColor}`}>
                    Cash: {formatCurrency(Math.abs(event.cashOnHand))}
                </div>
                <div className={balanceColor}>{balanceStatus}</div>
            </div>

            {/* Waktu */}
            <div className="w-[14%] px-2 py-2 border-r border-slate-100">
                <div className="font-medium text-slate-900">
                    {date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
                <div className="text-slate-500">
                    {date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                </div>
            </div>

            {/* Status */}
            <div className="w-[12%] px-2 py-2 border-r border-slate-100">
                <span className={`inline-flex items-center px-2 py-0.5 font-medium rounded-full ${statusBg}`}>
                    {statusLabel}
                </span>
                <div className="text-slate-500 mt-1">{event.transactionCategory}</div>
            </div>

            {/* Area */}
            <div className="w-[14%] px-2 py-2 border-r border-slate-100 text-slate-600 truncate">{event.kecamatan}</div>

            {/* Aksi */}
            <div className="w-[10%] px-2 py-2 flex items-start gap-1">
                {event.type === "SETORAN" && (
                    <>
                        <button className="p-1 hover:bg-blue-50 text-blue-600" title="Detail">
                            <Eye size={14} />
                        </button>
                        <button className="p-1 hover:bg-amber-50 text-amber-600" title="Edit">
                            <Edit size={14} />
                        </button>
                        <button className="p-1 hover:bg-red-50 text-red-600" title="Hapus">
                            <Trash2 size={14} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
