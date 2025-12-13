import { useState } from "react";
import { Plus, Search, RotateCcw, Download, Eye, Edit, Trash2, Phone, Store, Package, DollarSign } from "lucide-react";
import { useSalesData, type SalesEvent } from "./useSalesData";
import { SalesDetailModal } from "./SalesDetailModal";
import { SalesEditModal } from "./SalesEditModal";
import { TambahSalesModal } from "./TambahSalesModal";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
import { db } from "../../db/schema";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function SalesPage() {
  const [filters, setFilters] = useState({
    search: "",
    statusAktif: "all",
    teleponExists: "all",
  });
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [detailSales, setDetailSales] = useState<SalesEvent | null>(null);
  const [editSales, setEditSales] = useState<SalesEvent | null>(null);
  const [deleteSales, setDeleteSales] = useState<SalesEvent | null>(null);

  const { events } = useSalesData(filters.statusAktif, filters.teleponExists);

  const filteredRows = events.filter((e) => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!e.namaSales.toLowerCase().includes(s) && !(e.nomorTelepon || "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!deleteSales) return;
    await db.sales.delete(deleteSales.id);
    setDeleteSales(null);
  };

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
                placeholder="Cari sales, telepon..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="relative col-span-1 lg:w-36">
              <select
                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={filters.statusAktif}
                onChange={(e) => setFilters({ ...filters, statusAktif: e.target.value })}
              >
                <option value="all">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Tidak Aktif</option>
              </select>
            </div>

            {/* Telepon */}
            <div className="relative col-span-1 lg:w-36">
              <select
                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={filters.teleponExists}
                onChange={(e) => setFilters({ ...filters, teleponExists: e.target.value })}
              >
                <option value="all">Semua</option>
                <option value="true">Ada Telepon</option>
                <option value="false">Tanpa Telepon</option>
              </select>
            </div>

            {/* Reset */}
            <button
              className="flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 lg:w-auto"
              onClick={() => setFilters({ search: "", statusAktif: "all", teleponExists: "all" })}
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
              onClick={() => setShowTambahModal(true)}
              className="flex h-9 flex-1 items-center justify-center gap-2 bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 lg:flex-none"
            >
              <Plus size={16} />
              <span className="whitespace-nowrap">Sales</span>
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-auto border-l border-slate-200 bg-white pb-4 pt-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                <tr>
                  <th className="w-[18%] border-r border-slate-200 bg-slate-100 py-3 px-2 font-semibold text-slate-900 text-center">Sales</th>
                  <th className="w-[14%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Telepon</th>
                  <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Status</th>
                  <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Toko</th>
                  <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Dikirim</th>
                  <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Terjual</th>
                  <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Stok</th>
                  <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Revenue</th>
                  <th className="w-[8%] border-r border-slate-200 bg-slate-100 pl-2 py-3 font-semibold text-slate-900 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Tidak ada data sales
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <EventRow
                      key={row.id}
                      row={row}
                      onDetail={() => setDetailSales(row)}
                      onEdit={() => setEditSales(row)}
                      onDelete={() => setDeleteSales(row)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTambahModal && (
        <TambahSalesModal onClose={() => setShowTambahModal(false)} onSave={() => { }} />
      )}
      {detailSales && (
        <SalesDetailModal
          sales={detailSales}
          onClose={() => setDetailSales(null)}
        />
      )}
      {editSales && (
        <SalesEditModal
          sales={{
            id: editSales.id,
            namaSales: editSales.namaSales,
            nomorTelepon: editSales.nomorTelepon,
            statusAktif: editSales.statusAktif,
          }}
          onClose={() => setEditSales(null)}
          onSave={() => { }}
        />
      )}
      {deleteSales && (
        <ConfirmDeleteModal
          title="Hapus Sales"
          message="Anda yakin ingin menghapus sales ini?"
          itemName={deleteSales.namaSales}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteSales(null)}
        />
      )}
    </div>
  );
}

function EventRow({ row, onDetail, onEdit, onDelete }: { row: SalesEvent; onDetail: () => void; onEdit: () => void; onDelete: () => void }) {
  const stockColor = row.remainingStock < 0 ? "text-red-600" : row.remainingStock === 0 ? "text-yellow-600" : "text-orange-600";

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50">
      {/* Sales */}
      <td className="w-[18%] border-r border-slate-200 px-2 py-3">
        <div className="text-sm font-medium text-slate-900 truncate">{row.namaSales}</div>
        <div className="text-xs text-slate-500 font-mono">#{row.id}</div>
      </td>
      {/* Telepon */}
      <td className="w-[14%] border-r border-slate-200 px-2 py-3 text-center">
        {row.nomorTelepon ? (
          <a href={`tel:${row.nomorTelepon}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
            <Phone size={12} className="text-green-600" /> {row.nomorTelepon}
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">-</span>
        )}
      </td>
      {/* Status */}
      <td className="w-[10%] border-r border-slate-200 px-2 py-3 text-center">
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${row.statusAktif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {row.statusAktif ? "Aktif" : "Non-Aktif"}
        </span>
      </td>
      {/* Toko */}
      <td className="w-[10%] border-r border-slate-200 px-2 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <Store size={14} className="text-blue-500" />
          <span className="text-sm font-medium text-blue-600">{formatNumber(row.totalStores)}</span>
        </div>
      </td>
      {/* Dikirim */}
      <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <Package size={14} className="text-blue-500" />
          <span className="text-sm font-medium text-blue-600">{formatNumber(row.quantityShipped)}</span>
        </div>
      </td>
      {/* Terjual */}
      <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <Package size={14} className="text-green-500" />
          <span className="text-sm font-medium text-green-600">{formatNumber(row.quantitySold)}</span>
        </div>
      </td>
      {/* Stok */}
      <td className="w-[10%] border-r border-slate-200 px-2 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <Package size={14} className={stockColor} />
          <span className={`text-sm font-medium ${stockColor}`}>{formatNumber(row.remainingStock)}</span>
        </div>
      </td>
      {/* Revenue */}
      <td className="w-[12%] border-r border-slate-200 px-2 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <DollarSign size={14} className="text-purple-500" />
          <span className="text-sm font-medium text-purple-600">{formatCurrency(row.totalRevenue)}</span>
        </div>
      </td>
      {/* Aksi */}
      <td className="w-[8%] border-r border-slate-200 pl-2 py-3">
        <div className="flex items-center gap-0.5">
          <button onClick={onDetail} className="p-1 hover:bg-blue-50 text-blue-600" title="Detail"><Eye size={14} /></button>
          <button onClick={onEdit} className="p-1 hover:bg-amber-50 text-amber-600" title="Edit"><Edit size={14} /></button>
          <button onClick={onDelete} className="p-1 hover:bg-red-50 text-red-600" title="Hapus"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}
