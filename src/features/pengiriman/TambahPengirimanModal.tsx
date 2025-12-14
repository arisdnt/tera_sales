import { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Save, Package, Store, Calendar } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { insertWithSync } from "../../utils/syncOperations";

type Props = {
    onClose: () => void;
    onSave: () => void;
};

type DetailRow = {
    id: string; // temp ID for React key
    id_produk: number;
    jumlah_kirim: number;
};

export function TambahPengirimanModal({ onClose, onSave }: Props) {
    const [tanggalKirim, setTanggalKirim] = useState(new Date().toISOString().split("T")[0]);
    const [selectedTokoId, setSelectedTokoId] = useState<number | null>(null);
    const [details, setDetails] = useState<DetailRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [searchToko, setSearchToko] = useState("");

    // Fetch toko options
    const tokoList = useLiveQuery(
        () => db.toko.filter(t => t.status_toko === true).toArray(),
        [],
        []
    );

    // Fetch produk options
    const produkOptions = useLiveQuery(
        () => db.produk.filter(p => p.status_produk === true).toArray(),
        [],
        []
    );

    // Filter toko by search
    const filteredToko = useMemo(() => {
        if (!searchToko) return tokoList?.slice(0, 20) || [];
        const s = searchToko.toLowerCase();
        return (tokoList || []).filter(t =>
            t.nama_toko?.toLowerCase().includes(s) ||
            t.kecamatan?.toLowerCase().includes(s) ||
            t.kabupaten?.toLowerCase().includes(s)
        ).slice(0, 20);
    }, [tokoList, searchToko]);

    // Selected toko info
    const selectedToko = useMemo(() => {
        return tokoList?.find(t => t.id_toko === selectedTokoId) || null;
    }, [tokoList, selectedTokoId]);

    // Add product row
    const handleAddRow = () => {
        if (!produkOptions || produkOptions.length === 0) return;
        setDetails([
            ...details,
            {
                id: `new-${Date.now()}`,
                id_produk: produkOptions[0].id_produk,
                jumlah_kirim: 1,
            },
        ]);
    };

    // Remove product row
    const handleRemoveRow = (id: string) => {
        setDetails(details.filter(d => d.id !== id));
    };

    // Update product row
    const handleDetailChange = (id: string, field: "id_produk" | "jumlah_kirim", value: number) => {
        setDetails(details.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    // Get produk name
    const getProdukName = (id: number) => {
        return produkOptions?.find(p => p.id_produk === id)?.nama_produk ?? "-";
    };

    // Validate form
    const validateForm = (): string | null => {
        if (!selectedTokoId) return "Pilih toko terlebih dahulu";
        if (!tanggalKirim) return "Tanggal pengiriman harus diisi";
        if (details.length === 0) return "Tambahkan minimal 1 produk";
        if (details.some(d => d.jumlah_kirim <= 0)) return "Jumlah produk harus lebih dari 0";
        return null;
    };

    // Submit form
    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }

        setSaving(true);
        try {
            // Insert pengiriman
            const pengirimanId = await insertWithSync("pengiriman", "id_pengiriman", {
                id_toko: selectedTokoId,
                tanggal_kirim: tanggalKirim,
                is_autorestock: false,
                dibuat_pada: new Date().toISOString(),
                diperbarui_pada: new Date().toISOString(),
            });

            // Insert detail_pengiriman
            for (const detail of details) {
                await insertWithSync("detail_pengiriman", "id_detail_kirim", {
                    id_pengiriman: pengirimanId,
                    id_produk: detail.id_produk,
                    jumlah_kirim: detail.jumlah_kirim,
                    dibuat_pada: new Date().toISOString(),
                    diperbarui_pada: new Date().toISOString(),
                });
            }

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save pengiriman:", err);
            alert("Gagal menyimpan pengiriman");
        } finally {
            setSaving(false);
        }
    };

    // Total qty
    const totalQty = details.reduce((sum, d) => sum + d.jumlah_kirim, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white shadow-2xl border border-slate-200 flex flex-col" style={{ width: "80%", maxWidth: "900px", height: "80vh" }}>
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Package size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Tambah Pengiriman Baru</h2>
                    <button onClick={onClose} className="ml-auto text-white/70 hover:text-white" disabled={saving}>
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left: Toko Selection */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Store size={16} className="text-teal-600" />
                                Pilih Toko
                            </h3>

                            {/* Search Toko */}
                            <input
                                type="text"
                                placeholder="Cari toko..."
                                value={searchToko}
                                onChange={(e) => setSearchToko(e.target.value)}
                                className="w-full h-9 px-3 border border-slate-300 text-sm mb-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                            />

                            {/* Toko List */}
                            <div className="border border-slate-200 rounded max-h-48 overflow-y-auto">
                                {filteredToko.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-sm">Tidak ada toko</div>
                                ) : (
                                    filteredToko.map((toko) => (
                                        <div
                                            key={toko.id_toko}
                                            className={`p-2 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${selectedTokoId === toko.id_toko ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
                                                }`}
                                            onClick={() => setSelectedTokoId(toko.id_toko)}
                                        >
                                            <div className="font-medium text-sm text-slate-900">{toko.nama_toko}</div>
                                            <div className="text-xs text-slate-500">{toko.kecamatan}, {toko.kabupaten}</div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Selected Toko Info */}
                            {selectedToko && (
                                <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded">
                                    <div className="text-sm font-semibold text-teal-900">{selectedToko.nama_toko}</div>
                                    <div className="text-xs text-teal-700">{selectedToko.kecamatan}, {selectedToko.kabupaten}</div>
                                </div>
                            )}

                            {/* Tanggal */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    <Calendar size={14} className="inline mr-1" />
                                    Tanggal Pengiriman
                                </label>
                                <input
                                    type="date"
                                    value={tanggalKirim}
                                    onChange={(e) => setTanggalKirim(e.target.value)}
                                    className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Right: Product Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Package size={16} className="text-blue-600" />
                                    Detail Barang
                                </h3>
                                <button
                                    onClick={handleAddRow}
                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    <Plus size={12} />
                                    Tambah
                                </button>
                            </div>

                            {/* Product Rows */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {details.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-sm border border-dashed border-slate-300 rounded">
                                        Belum ada produk. Klik "Tambah" untuk menambahkan.
                                    </div>
                                ) : (
                                    details.map((detail) => (
                                        <div key={detail.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                                            <select
                                                value={detail.id_produk}
                                                onChange={(e) => handleDetailChange(detail.id, "id_produk", Number(e.target.value))}
                                                className="flex-1 h-8 px-2 border border-slate-300 text-sm"
                                            >
                                                {produkOptions?.map((p) => (
                                                    <option key={p.id_produk} value={p.id_produk}>{p.nama_produk}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min={1}
                                                value={detail.jumlah_kirim}
                                                onChange={(e) => handleDetailChange(detail.id, "jumlah_kirim", Number(e.target.value) || 1)}
                                                className="w-16 h-8 px-2 border border-slate-300 text-sm text-center"
                                            />
                                            <button
                                                onClick={() => handleRemoveRow(detail.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Summary */}
                            {details.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-700">Total Item:</span>
                                        <span className="font-bold text-blue-900">{details.length} produk</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-blue-700">Total Qty:</span>
                                        <span className="font-bold text-blue-900">{totalQty} unit</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 rounded"
                        disabled={saving}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !selectedTokoId || details.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-[#005461] text-white font-semibold hover:bg-teal-700 disabled:opacity-50 rounded"
                    >
                        <Save size={14} />
                        {saving ? "Menyimpan..." : "Simpan Pengiriman"}
                    </button>
                </div>
            </div>
        </div>
    );
}
