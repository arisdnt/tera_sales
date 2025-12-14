import { useMemo, useState, useRef, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { List } from "react-window";
import { db } from "../../db/schema";
import type { PengirimanDashboardRow } from "../../db/supabaseViewsExtras";
import { dateRangeToWindow, type DateRangeKey } from "./dateRange";
import { PengirimanDetailModal } from "./PengirimanDetailModal";
import { PengirimanEditModal } from "./PengirimanEditModal";
import { TambahPembayaranModal } from "./TambahPembayaranModal";
import { SimpleConfirmDeleteModal } from "../../components/SimpleConfirmDeleteModal";
import { deleteWithSync } from "../../utils/syncOperations";
import {
  Calendar,
  Download,
  Edit,
  Eye,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";

type PembayaranFilters = {
  search: string;
  dateRange: DateRangeKey;
  sales: string;
  kabupaten: string;
  kecamatan: string;
};

export function PembayaranPage() {
  const [filters, setFilters] = useState<PembayaranFilters>({
    search: "",
    dateRange: "all",
    sales: "",
    kabupaten: "",
    kecamatan: "",
  });

  // Modal state
  const [detailModalRow, setDetailModalRow] = useState<PengirimanDashboardRow | null>(null);
  const [editModalRow, setEditModalRow] = useState<PengirimanDashboardRow | null>(null);
  const [deleteModalRow, setDeleteModalRow] = useState<PengirimanDashboardRow | null>(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenDetail = useCallback((row: PengirimanDashboardRow) => {
    setDetailModalRow(row);
  }, []);

  const handleOpenEdit = useCallback((row: PengirimanDashboardRow) => {
    setEditModalRow(row);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDeleteClick = useCallback((row: PengirimanDashboardRow) => {
    setDeleteModalRow(row);
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteModalRow?.id_pengiriman) return;

    // Delete all detail_pengiriman first
    const details = await db.detail_pengiriman
      .where("id_pengiriman")
      .equals(deleteModalRow.id_pengiriman)
      .toArray();

    for (const detail of details) {
      await deleteWithSync("detail_pengiriman", "id_detail_kirim", detail.id_detail_kirim);
    }

    // Then delete the pengiriman
    await deleteWithSync("pengiriman", "id_pengiriman", deleteModalRow.id_pengiriman);
    setDeleteModalRow(null);
  };

  const rows =
    useLiveQuery(
      () =>
        db.v_pengiriman_dashboard
          .toArray()
          .then((list) =>
            list.sort((a, b) =>
              (b.tanggal_kirim ?? "")
                .toString()
                .localeCompare((a.tanggal_kirim ?? "").toString())
            )
          ),
      [],
      []
    ) ?? [];

  const salesOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      const name = (row.nama_sales ?? "").toString().trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const kabupatenOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      const v = (row.kabupaten ?? "").toString().trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const kecamatanOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      if (filters.kabupaten) {
        const kab = (row.kabupaten ?? "").toString().toLowerCase();
        if (kab !== filters.kabupaten.toLowerCase()) return;
      }
      const v = (row.kecamatan ?? "").toString().trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows, filters.kabupaten]);

  const filteredRows: PengirimanDashboardRow[] = useMemo(() => {
    const s = filters.search.trim().toLowerCase();
    const { start, end } = dateRangeToWindow(filters.dateRange);

    return rows.filter((row) => {
      if (
        start &&
        row.tanggal_kirim &&
        new Date(row.tanggal_kirim as unknown as string) < start
      )
        return false;
      if (
        end &&
        row.tanggal_kirim &&
        new Date(row.tanggal_kirim as unknown as string) > end
      )
        return false;

      if (
        filters.sales &&
        (row.nama_sales ?? "").toString().toLowerCase() !==
        filters.sales.toLowerCase()
      )
        return false;
      if (
        filters.kabupaten &&
        (row.kabupaten ?? "").toString().toLowerCase() !==
        filters.kabupaten.toLowerCase()
      )
        return false;
      if (
        filters.kecamatan &&
        (row.kecamatan ?? "").toString().toLowerCase() !==
        filters.kecamatan.toLowerCase()
      )
        return false;

      if (!s) return true;
      const haystack = [
        row.nama_toko,
        row.nama_sales,
        row.kecamatan,
        row.kabupaten,
        row.nomor_telepon_toko,
        row.nomor_telepon_sales,
      ]
        .map((v) => (v ?? "").toString().toLowerCase())
        .join(" ");
      return haystack.includes(s);
    });
  }, [filters, rows]);

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Main Container - Fix alignment between filters and table */}
      <div className="min-w-[1000px] flex-1 flex flex-col overflow-hidden px-2">
        {/* Filters Section - Fixed at top */}
        <div className="flex flex-col gap-3 border-l border-r border-b border-slate-200 bg-white px-3 py-3 lg:flex-row lg:items-end">
          <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:items-center">
            {/* Search */}
            <div className="relative col-span-2 lg:w-64">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="h-9 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="Cari data..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Date Range */}
            <div className="relative col-span-1 lg:w-40">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value as DateRangeKey })
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

            {/* Sales */}
            <div className="relative col-span-1 lg:w-40">
              <Users
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={filters.sales}
                onChange={(e) => setFilters({ ...filters, sales: e.target.value })}
              >
                <option value="">Semua Sales</option>
                {salesOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Kabupaten */}
            <div className="relative col-span-1 lg:w-40">
              <MapPin
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={filters.kabupaten}
                onChange={(e) =>
                  setFilters({ ...filters, kabupaten: e.target.value, kecamatan: "" })
                }
              >
                <option value="">Semua Kab</option>
                {kabupatenOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Kecamatan */}
            <div className="relative col-span-1 lg:w-40">
              <MapPin
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <select
                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                value={filters.kecamatan}
                onChange={(e) =>
                  setFilters({ ...filters, kecamatan: e.target.value })
                }
                disabled={!filters.kabupaten}
              >
                <option value="">Semua Kec</option>
                {kecamatanOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <button
              className="flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 lg:w-auto"
              onClick={() =>
                setFilters({
                  search: "",
                  dateRange: "all",
                  sales: "",
                  kabupaten: "",
                  kecamatan: "",
                })
              }
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
              <span className="whitespace-nowrap">Pembayaran</span>
            </button>
          </div>
        </div>

        {/* Table Section - Scrollable with HIDDEN SCROLLBAR */}
        {/* [&::-webkit-scrollbar]:hidden hides scrollbar in Webkit (Chrome/Safari/Edge) */}
        {/* [scrollbar-width:'none'] hides scrollbar in Firefox */}
        <div className="flex-1 overflow-auto border-l border-slate-200 bg-white pb-4 pt-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:'none']">
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                <tr>
                  <th className="w-[10%] border-r border-slate-200 bg-slate-100 py-3 pr-4 font-semibold text-slate-900 text-center">
                    Tanggal
                  </th>
                  <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">
                    ID Kirim
                  </th>
                  <th className="w-[15%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">
                    Toko
                  </th>
                  <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">
                    Wilayah
                  </th>
                  <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">
                    Sales
                  </th>
                  <th className="w-[8%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">
                    Qty
                  </th>
                  <th className="w-[20%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">
                    Detail Barang
                  </th>
                  <th className="w-[13%] border-r border-slate-200 bg-slate-100 pl-4 py-3 font-semibold text-slate-900 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
            </table>

            {/* Virtualized Table Body */}
            {filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
                <Search size={32} className="text-slate-300" />
                <p>Tidak ada data ditemukan</p>
              </div>
            ) : (
              <List
                defaultHeight={600}
                rowCount={filteredRows.length}
                rowHeight={80}
                rowComponent={({ index, style }) => {
                  const row = filteredRows[index];
                  return (
                    <div style={style} className="hover:bg-slate-50">
                      <div className="flex w-full border-b border-slate-100 text-sm">
                        <div className="w-[10%] border-r border-slate-200 py-3 pr-4 text-xs font-medium text-slate-600">
                          {row.tanggal_kirim ?? "-"}
                        </div>
                        <div className="w-[12%] border-r border-slate-200 px-2 py-3 font-mono text-xs text-slate-600">
                          {row.id_pengiriman ?? "-"}
                        </div>
                        <div className="w-[15%] border-r border-slate-200 px-2 py-3">
                          <div className="truncate font-medium text-slate-900">
                            {row.nama_toko ?? "-"}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {row.nomor_telepon_toko ?? "-"}
                          </div>
                        </div>
                        <div className="w-[10%] border-r border-slate-200 px-2 py-3">
                          <div className="truncate text-slate-900">
                            {row.kecamatan ?? "-"}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {row.kabupaten ?? "-"}
                          </div>
                        </div>
                        <div className="w-[12%] border-r border-slate-200 px-2 py-3">
                          <div className="truncate font-medium text-slate-900">
                            {row.nama_sales ?? "-"}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {row.nomor_telepon_sales ?? "-"}
                          </div>
                        </div>
                        <div className="w-[8%] border-r border-slate-200 px-2 py-3 text-right font-mono text-xs font-medium text-slate-900">
                          {row.total_quantity?.toLocaleString() ?? "-"}
                        </div>
                        <div className="w-[20%] border-r border-slate-200 px-2 py-3 text-xs leading-relaxed text-slate-600">
                          <div className="line-clamp-2">
                            {row.detail_pengiriman ?? "-"}
                          </div>
                        </div>
                        <div className="w-[13%] border-r border-slate-200 pl-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="flex size-7 items-center justify-center rounded-sm border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                              title="Detail"
                              onClick={() => handleOpenDetail(row)}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="flex size-7 items-center justify-center rounded-sm border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                              title="Edit"
                              onClick={() => handleOpenEdit(row)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="flex size-7 items-center justify-center rounded-sm border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors"
                              title="Hapus"
                              onClick={() => handleDeleteClick(row)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
                rowProps={{}}
              />
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModalRow && (
        <PengirimanDetailModal
          row={detailModalRow}
          onClose={() => setDetailModalRow(null)}
        />
      )}

      {/* Edit Modal */}
      {editModalRow && (
        <PengirimanEditModal
          row={editModalRow}
          onClose={() => setEditModalRow(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Tambah Pembayaran Modal */}
      {showTambahModal && (
        <TambahPembayaranModal
          onClose={() => setShowTambahModal(false)}
          onSave={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalRow && (
        <SimpleConfirmDeleteModal
          title="Hapus Pengiriman"
          message="Anda yakin ingin menghapus pengiriman ini? Semua detail barang terkait juga akan dihapus."
          itemName={`#${deleteModalRow.id_pengiriman} - ${deleteModalRow.nama_toko ?? 'Unknown'}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModalRow(null)}
        />
      )}
    </div>
  );
}
