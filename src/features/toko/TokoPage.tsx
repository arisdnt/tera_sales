import { useState, useMemo, useCallback } from "react";
import { List } from "react-window";
import { Plus, Search, RotateCcw, Download, Eye, Edit, Trash2, Users, MapPin, ExternalLink, Phone, Truck, DollarSign, Warehouse } from "lucide-react";
import { useTokoData, type TokoEvent } from "./useTokoData";
import { TambahTokoModal } from "./TambahTokoModal";
import { TokoDetailModal } from "./TokoDetailModal";
import { TokoEditModal } from "./TokoEditModal";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
import { ValidationModal } from "../../components/ValidationModal";
import { deleteWithSync } from "../../utils/syncOperations";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function TokoPage() {
    const [filters, setFilters] = useState({
        search: "",
        statusToko: "all",
        sales: "",
        kabupaten: "",
        kecamatan: "",
    });
    const [showTambahModal, setShowTambahModal] = useState(false);
    const [detailToko, setDetailToko] = useState<TokoEvent | null>(null);
    const [editToko, setEditToko] = useState<TokoEvent | null>(null);
    const [deleteToko, setDeleteToko] = useState<TokoEvent | null>(null);
    const [validationError, setValidationError] = useState<{ title: string; message: string; details: string[]; suggestion: string } | null>(null);

    const { events, salesOptions, kabupatenOptions, kecamatanOptions } = useTokoData(
        filters.statusToko, filters.sales, filters.kabupaten, filters.kecamatan
    );

    const filteredRows = useMemo(() => {
        if (!filters.search) return events;
        const s = filters.search.toLowerCase();
        return events.filter((e) =>
            e.namaToko.toLowerCase().includes(s) ||
            e.namaSales.toLowerCase().includes(s) ||
            e.kecamatan.toLowerCase().includes(s) ||
            e.kabupaten.toLowerCase().includes(s) ||
            (e.noTelepon || "").toLowerCase().includes(s)
        );
    }, [events, filters.search]);

    const handleDetail = useCallback((row: TokoEvent) => setDetailToko(row), []);
    const handleEdit = useCallback((row: TokoEvent) => setEditToko(row), []);

    // Handler untuk validasi sebelum menampilkan modal delete
    const handleDelete = useCallback((toko: TokoEvent) => {
        // Validasi: Block delete jika toko memiliki riwayat transaksi
        if (toko.quantityShipped > 0 || toko.quantitySold > 0) {
            setValidationError({
                title: "Tidak Dapat Menghapus",
                message: `Toko "${toko.namaToko}" sudah memiliki riwayat transaksi.`,
                details: [
                    `Total dikirim: ${toko.quantityShipped}`,
                    `Total terjual: ${toko.quantitySold}`,
                ],
                suggestion: "Non-aktifkan toko ini sebagai alternatif jika tidak ingin digunakan lagi.",
            });
            return;
        }
        // Jika validasi lolos, tampilkan modal confirm dengan captcha
        setDeleteToko(toko);
    }, []);

    const handleConfirmDelete = async () => {
        if (!deleteToko) return;
        await deleteWithSync("toko", "id_toko", deleteToko.id);
        setDeleteToko(null);
    };

    return (
        <div className="flex h-full w-full flex-col bg-white">
            <div className="min-w-[1200px] flex-1 flex flex-col overflow-hidden px-2">
                {/* Filters Section */}
                <div className="flex flex-col gap-3 border-l border-r border-b border-slate-200 bg-white px-3 py-3 lg:flex-row lg:items-end">
                    <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:items-center">
                        {/* Search */}
                        <div className="relative col-span-2 lg:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                className="h-9 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                placeholder="Cari toko, sales, lokasi..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>

                        {/* Sales */}
                        <div className="relative col-span-1 lg:w-36">
                            <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={filters.sales}
                                onChange={(e) => setFilters({ ...filters, sales: e.target.value })}
                            >
                                <option value="">Semua Sales</option>
                                {salesOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                            </select>
                        </div>

                        {/* Kabupaten */}
                        <div className="relative col-span-1 lg:w-36">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={filters.kabupaten}
                                onChange={(e) => setFilters({ ...filters, kabupaten: e.target.value, kecamatan: "" })}
                            >
                                <option value="">Semua Kab</option>
                                {kabupatenOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                            </select>
                        </div>

                        {/* Kecamatan */}
                        <div className="relative col-span-1 lg:w-36">
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={filters.kecamatan}
                                onChange={(e) => setFilters({ ...filters, kecamatan: e.target.value })}
                                disabled={!filters.kabupaten}
                            >
                                <option value="">Semua Kec</option>
                                {kecamatanOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                            </select>
                        </div>

                        {/* Status */}
                        <div className="relative col-span-1 lg:w-32">
                            <select
                                className="h-9 w-full appearance-none border border-slate-300 bg-white pl-3 pr-8 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                value={filters.statusToko}
                                onChange={(e) => setFilters({ ...filters, statusToko: e.target.value })}
                            >
                                <option value="all">Semua Status</option>
                                <option value="true">Aktif</option>
                                <option value="false">Tidak Aktif</option>
                            </select>
                        </div>

                        {/* Reset */}
                        <button
                            className="flex h-9 items-center justify-center border border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 lg:w-auto"
                            onClick={() => setFilters({ search: "", statusToko: "all", sales: "", kabupaten: "", kecamatan: "" })}
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
                            <span className="whitespace-nowrap">Toko</span>
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 flex flex-col overflow-hidden border-l border-slate-200 bg-white">
                    {/* Table Header - Fixed */}
                    <table className="w-full table-fixed border-collapse text-left text-sm">
                        <thead className="bg-slate-100 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                            <tr>
                                <th className="w-[15%] border-r border-slate-200 bg-slate-100 py-3 px-2 font-semibold text-slate-900 text-center">Nama Toko</th>
                                <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Wilayah</th>
                                <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Telepon</th>
                                <th className="w-[12%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Sales</th>
                                <th className="w-[8%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Status</th>
                                <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Dikirim</th>
                                <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Terjual</th>
                                <th className="w-[8%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Stok</th>
                                <th className="w-[10%] border-r border-slate-200 bg-slate-100 px-2 py-3 font-semibold text-slate-900 text-center">Revenue</th>
                                <th className="w-[7%] border-r border-slate-200 bg-slate-100 pl-2 py-3 font-semibold text-slate-900 text-center">Aksi</th>
                            </tr>
                        </thead>
                    </table>

                    {/* Virtualized Table Body - Scrollable */}
                    <div className="flex-1 overflow-hidden">
                        {filteredRows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
                                <Search size={32} className="text-slate-300" />
                                <p>Tidak ada data toko</p>
                            </div>
                        ) : (
                            <List
                                defaultHeight={600}
                                rowCount={filteredRows.length}
                                rowHeight={56}
                                rowProps={{}}
                                rowComponent={({ index, style }) => {
                                    const row = filteredRows[index];
                                    const stockColor = row.remainingStock < 0 ? "text-red-600" : row.remainingStock === 0 ? "text-yellow-600" : "text-green-600";
                                    return (
                                        <div style={style} className="hover:bg-slate-50">
                                            <div className="flex w-full border-b border-slate-100 text-sm">
                                                {/* Nama Toko */}
                                                <div className="w-[15%] border-r border-slate-200 px-2 py-2">
                                                    <div className="text-sm font-medium text-slate-900 truncate">{row.namaToko}</div>
                                                    {row.linkGmaps && (
                                                        <a href={row.linkGmaps} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                                                            <ExternalLink size={10} />Maps
                                                        </a>
                                                    )}
                                                </div>
                                                {/* Wilayah */}
                                                <div className="w-[10%] border-r border-slate-200 px-2 py-2 text-center">
                                                    <div className="text-xs text-slate-600 truncate">{row.kecamatan}</div>
                                                    <div className="text-xs text-slate-400 truncate">{row.kabupaten}</div>
                                                </div>
                                                {/* Telepon */}
                                                <div className="w-[10%] border-r border-slate-200 px-2 py-2 text-center">
                                                    {row.noTelepon ? (
                                                        <a href={`tel:${row.noTelepon}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                                            <Phone size={12} className="text-green-600" />{row.noTelepon}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">-</span>
                                                    )}
                                                </div>
                                                {/* Sales */}
                                                <div className="w-[12%] border-r border-slate-200 px-2 py-2 text-center">
                                                    <span className="text-sm text-slate-900 truncate">{row.namaSales}</span>
                                                </div>
                                                {/* Status */}
                                                <div className="w-[8%] border-r border-slate-200 px-2 py-2 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${row.statusToko ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                        {row.statusToko ? "Aktif" : "Non-Aktif"}
                                                    </span>
                                                </div>
                                                {/* Dikirim */}
                                                <div className="w-[10%] border-r border-slate-200 px-2 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Truck size={14} className="text-blue-500" />
                                                        <span className="text-sm font-medium text-blue-600">{formatNumber(row.quantityShipped)}</span>
                                                    </div>
                                                </div>
                                                {/* Terjual */}
                                                <div className="w-[10%] border-r border-slate-200 px-2 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <DollarSign size={14} className="text-green-500" />
                                                        <span className="text-sm font-medium text-green-600">{formatNumber(row.quantitySold)}</span>
                                                    </div>
                                                </div>
                                                {/* Stok */}
                                                <div className="w-[8%] border-r border-slate-200 px-2 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Warehouse size={14} className={stockColor} />
                                                        <span className={`text-sm font-medium ${stockColor}`}>{formatNumber(row.remainingStock)}</span>
                                                    </div>
                                                </div>
                                                {/* Revenue */}
                                                <div className="w-[10%] border-r border-slate-200 px-2 py-2 text-center">
                                                    <span className="text-sm font-medium text-purple-600">{formatCurrency(row.totalRevenue)}</span>
                                                </div>
                                                {/* Aksi */}
                                                <div className="w-[7%] border-r border-slate-200 pl-2 py-2">
                                                    <div className="flex items-center gap-0.5">
                                                        <button onClick={() => handleDetail(row)} className="p-1 hover:bg-blue-50 text-blue-600" title="Detail"><Eye size={14} /></button>
                                                        <button onClick={() => handleEdit(row)} className="p-1 hover:bg-amber-50 text-amber-600" title="Edit"><Edit size={14} /></button>
                                                        <button onClick={() => handleDelete(row)} className="p-1 hover:bg-red-50 text-red-600" title="Hapus"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showTambahModal && (
                <TambahTokoModal onClose={() => setShowTambahModal(false)} onSave={() => { }} />
            )}
            {detailToko && (
                <TokoDetailModal
                    toko={{
                        id_toko: detailToko.id,
                        nama_toko: detailToko.namaToko,
                        kecamatan: detailToko.kecamatan,
                        kabupaten: detailToko.kabupaten,
                        noTelepon: detailToko.noTelepon,
                        linkGmaps: detailToko.linkGmaps,
                        namaSales: detailToko.namaSales,
                        statusToko: detailToko.statusToko,
                        quantityShipped: detailToko.quantityShipped,
                        quantitySold: detailToko.quantitySold,
                        remainingStock: detailToko.remainingStock,
                        totalRevenue: detailToko.totalRevenue,
                    }}
                    onClose={() => setDetailToko(null)}
                />
            )}
            {editToko && (
                <TokoEditModal
                    toko={{
                        id_toko: editToko.id,
                        nama_toko: editToko.namaToko,
                        kecamatan: editToko.kecamatan,
                        kabupaten: editToko.kabupaten,
                        noTelepon: editToko.noTelepon,
                        linkGmaps: editToko.linkGmaps,
                        idSales: editToko.idSales,
                        statusToko: editToko.statusToko,
                    }}
                    onClose={() => setEditToko(null)}
                    onSave={() => { }}
                />
            )}
            {deleteToko && (
                <ConfirmDeleteModal
                    title="Hapus Toko"
                    message="Anda yakin ingin menghapus toko ini?"
                    itemName={deleteToko.namaToko}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteToko(null)}
                />
            )}
            {validationError && (
                <ValidationModal
                    type="warning"
                    title={validationError.title}
                    message={validationError.message}
                    details={validationError.details}
                    suggestion={validationError.suggestion}
                    onClose={() => setValidationError(null)}
                />
            )}
        </div>
    );
}
