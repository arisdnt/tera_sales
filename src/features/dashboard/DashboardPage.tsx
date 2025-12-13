import { useState } from "react";
import { Calendar, RotateCcw } from "lucide-react";
import { KPICards } from "./KPICards";
import { PerformanceCharts } from "./PerformanceCharts";
import { useDashboardData, type CustomDateRange, type DateRangeKey } from "./useDashboardData";

export function DashboardPage() {
    const [dateRange, setDateRange] = useState<DateRangeKey>("this_month");
    const [customRange, setCustomRange] = useState<CustomDateRange>({
        startDate: null,
        endDate: null,
    });

    const handleDateRangeChange = (value: DateRangeKey) => {
        setDateRange(value);
        setCustomRange({ startDate: null, endDate: null });
    };

    const handleCustomDateChange = (field: keyof CustomDateRange, value: string) => {
        setCustomRange((prev) => ({
            ...prev,
            [field]: value || null,
        }));
    };

    const handleResetFilters = () => {
        setDateRange("this_month");
        setCustomRange({ startDate: null, endDate: null });
    };

    const {
        kpis,
        salesPerformance,
        produkPerformance,
        tokoPerformance,
        regionalPerformance,
        salesOptions,
        kabupatenOptions,
        kecamatanOptions,
    } = useDashboardData(dateRange, customRange);

    return (
        <div className="flex h-full w-full flex-col bg-white">
            {/* Main Container - Fix alignment between filters and table */}
            <div className="min-w-[1000px] flex-1 flex flex-col overflow-hidden px-2">
                {/* Filters Section - Fixed at top */}
                <div className="flex justify-end border-l border-r border-slate-200 bg-white px-3 py-3">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Date Range */}
                        <div className="relative w-40">
                            <Calendar
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={dateRange}
                                onChange={(e) =>
                                    handleDateRangeChange(e.target.value as DateRangeKey)
                                }
                            >
                                <option value="all">Semua Waktu</option>
                                <option value="today">Hari Ini</option>
                                <option value="7days">7 Hari Terakhir</option>
                                <option value="30days">30 Hari Terakhir</option>
                                <option value="this_month">Bulan Ini</option>
                                <option value="last_month">Bulan Lalu</option>
                            </select>
                        </div>

                        {/* Custom Date Picker */}
                        <div className="flex items-end gap-3">
                            <div className="flex flex-col">
                                <label className="text-xs text-slate-500">Mulai</label>
                                <input
                                    type="date"
                                    className="h-9 border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                    value={customRange.startDate ?? ""}
                                    onChange={(e) =>
                                        handleCustomDateChange("startDate", e.target.value)
                                    }
                                    max={customRange.endDate ?? undefined}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs text-slate-500">Selesai</label>
                                <input
                                    type="date"
                                    className="h-9 border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                    value={customRange.endDate ?? ""}
                                    onChange={(e) =>
                                        handleCustomDateChange("endDate", e.target.value)
                                    }
                                    min={customRange.startDate ?? undefined}
                                />
                            </div>
                        </div>

                        {/* Reset */}
                        <button
                            className="flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50"
                            onClick={handleResetFilters}
                            title="Reset Filter"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="px-3 py-4">
                    <KPICards data={kpis} />
                </div>

                {/* Performance Charts */}
                <div className="px-3 pb-6">
                    <PerformanceCharts
                        salesData={salesPerformance}
                        produkData={produkPerformance}
                        tokoData={tokoPerformance}
                        regionalData={regionalPerformance}
                    />
                </div>
            </div>
        </div>
    );
}
