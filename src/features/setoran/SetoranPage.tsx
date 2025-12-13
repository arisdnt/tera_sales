import { useState, useCallback } from "react";
import { Plus, Search, Calendar, RefreshCw, Eye, Edit, Trash2 } from "lucide-react";
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

    const filteredEvents = events.filter((e) => {
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

    const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-auto p-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-white border border-slate-200">
                    <div className="flex items-center gap-2">
                        <Search size={14} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-48 px-3 border border-slate-300 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
                            className="h-8 px-3 border border-slate-300 text-sm"
                        >
                            {DATE_RANGE_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.key}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value as typeof eventFilter)}
                        className="h-8 px-3 border border-slate-300 text-sm"
                    >
                        <option value="all">Semua Transaksi</option>
                        <option value="CASH_IN">💰 Cash Masuk</option>
                        <option value="TRANSFER_IN">💳 Transfer Masuk</option>
                        <option value="SETORAN">📤 Setoran</option>
                    </select>
                    <button
                        onClick={handleRefresh}
                        className="h-8 px-3 border border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button
                        onClick={() => setShowTambahModal(true)}
                        className="flex items-center gap-2 h-8 px-4 bg-[#005461] text-white text-sm font-semibold hover:bg-teal-700"
                    >
                        <Plus size={14} />
                        Setoran Baru
                    </button>
                    <div className="ml-auto text-xs text-slate-500">{filteredEvents.length} transaksi</div>
                </div>

                <SetoranKPICards data={kpis} />

                {/* Data Table */}
                <div className="bg-white border border-slate-200">
                    {/* Header */}
                    <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                        <div className="w-[10%] px-2 py-2 border-r border-slate-200">ID & Jenis</div>
                        <div className="w-[22%] px-2 py-2 border-r border-slate-200">Jumlah & Deskripsi</div>
                        <div className="w-[18%] px-2 py-2 border-r border-slate-200">Penerima & Balance</div>
                        <div className="w-[14%] px-2 py-2 border-r border-slate-200">Waktu</div>
                        <div className="w-[12%] px-2 py-2 border-r border-slate-200">Status</div>
                        <div className="w-[14%] px-2 py-2 border-r border-slate-200">Area</div>
                        <div className="w-[10%] px-2 py-2">Aksi</div>
                    </div>
                    {/* Body */}
                    <div className="max-h-[400px] overflow-auto">
                        {filteredEvents.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">Tidak ada transaksi</div>
                        ) : (
                            filteredEvents.map((e) => <EventRow key={`${e.type}-${e.id}`} event={e} />)
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
            <div className="w-[14%] px-2 py-2 border-r border-slate-100 text-slate-600">{event.kecamatan}</div>

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
