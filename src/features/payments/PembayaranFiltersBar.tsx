import {
  Calendar,
  Download,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import type { DateRangeKey } from "./dateRange";

export type PembayaranFilters = {
  search: string;
  dateRange: DateRangeKey;
  sales: string;
  kabupaten: string;
  kecamatan: string;
};

export function PembayaranFiltersBar(props: {
  filters: PembayaranFilters;
  onChange: (next: PembayaranFilters) => void;
  salesOptions: string[];
  kabupatenOptions: string[];
  kecamatanOptions: string[];
  onExport: () => void;
  onAddPayment: () => void;
}) {
  const { filters, onChange, salesOptions, kabupatenOptions, kecamatanOptions, onExport, onAddPayment } = props;

  return (
    <div className="flex flex-col gap-2 border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3 text-xs text-slate-700 lg:flex-row lg:items-end lg:gap-2 lg:flex-nowrap">
      <div className="w-full lg:basis-[18%] lg:shrink-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400" size={16} />
          <input
            aria-label="Cari"
            className="h-9 w-full border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 transition-all focus:border-[#005461] focus:outline-none focus:ring-2 focus:ring-[#005461]/20"
            placeholder=""
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      <div className="w-full lg:basis-[12%] lg:shrink-0">
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400" size={16} />
          <select
            aria-label="Filter waktu"
            className="h-9 w-full appearance-none border border-slate-300 bg-white pl-10 pr-8 text-sm text-slate-900 transition-all focus:border-[#005461] focus:outline-none focus:ring-2 focus:ring-[#005461]/20"
            value={filters.dateRange}
            onChange={(e) => onChange({ ...filters, dateRange: e.target.value as DateRangeKey })}
          >
            <option value="all">Semua waktu</option>
            <option value="today">Hari ini</option>
            <option value="7days">7 hari terakhir</option>
            <option value="30days">30 hari terakhir</option>
            <option value="this_month">Bulan ini</option>
            <option value="last_month">Bulan lalu</option>
          </select>
        </div>
      </div>

      <div className="w-full lg:basis-[14%] lg:shrink-0">
        <div className="relative">
          <Users className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400" size={16} />
          <select
            aria-label="Filter sales"
            className="h-9 w-full appearance-none border border-slate-300 bg-white pl-10 pr-8 text-sm text-slate-900 transition-all focus:border-[#005461] focus:outline-none focus:ring-2 focus:ring-[#005461]/20"
            value={filters.sales}
            onChange={(e) => onChange({ ...filters, sales: e.target.value })}
          >
            <option value="">Semua sales</option>
            {salesOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full lg:basis-[14%] lg:shrink-0">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400" size={16} />
          <select
            aria-label="Filter kabupaten"
            className="h-9 w-full appearance-none border border-slate-300 bg-white pl-10 pr-8 text-sm text-slate-900 transition-all focus:border-[#005461] focus:outline-none focus:ring-2 focus:ring-[#005461]/20"
            value={filters.kabupaten}
            onChange={(e) => onChange({ ...filters, kabupaten: e.target.value, kecamatan: "" })}
          >
            <option value="">Semua kabupaten</option>
            {kabupatenOptions.map((kab) => (
              <option key={kab} value={kab}>
                {kab}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full lg:basis-[14%] lg:shrink-0">
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400" size={16} />
          <select
            aria-label="Filter kecamatan"
            className="h-9 w-full appearance-none border border-slate-300 bg-white pl-10 pr-8 text-sm text-slate-900 transition-all focus:border-[#005461] focus:outline-none focus:ring-2 focus:ring-[#005461]/20 disabled:bg-slate-100 disabled:text-slate-400"
            value={filters.kecamatan}
            onChange={(e) => onChange({ ...filters, kecamatan: e.target.value })}
            disabled={!filters.kabupaten}
          >
            <option value="">Semua kecamatan</option>
            {kecamatanOptions.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full lg:basis-[8%] lg:shrink-0">
        <button
          className="flex h-9 w-full items-center justify-center gap-1.5 border border-slate-400 bg-slate-200 px-3 font-semibold text-slate-700 transition-all hover:bg-slate-300"
          type="button"
          onClick={() => onChange({ search: "", dateRange: "all", sales: "", kabupaten: "", kecamatan: "" })}
        >
          <RotateCcw size={14} />
          <span className="hidden xl:inline">Reset</span>
        </button>
      </div>

      <div className="flex w-full items-end gap-2 lg:ml-auto lg:w-auto lg:shrink-0">
        <button
          className="flex h-9 flex-1 items-center gap-2 whitespace-nowrap border border-slate-500 bg-slate-600 px-3 font-semibold text-white transition-all hover:bg-slate-700 lg:flex-none"
          type="button"
          onClick={onExport}
        >
          <Download size={16} />
          Export Data
        </button>
        <button
          className="flex h-9 flex-1 items-center gap-2 whitespace-nowrap border border-emerald-600 bg-emerald-600 px-3 font-semibold text-white transition-all hover:bg-emerald-700 lg:flex-none"
          type="button"
          onClick={onAddPayment}
        >
          <Plus size={16} />
          Tambah Pembayaran
        </button>
      </div>
    </div>
  );
}

