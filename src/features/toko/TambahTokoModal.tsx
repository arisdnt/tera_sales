import { X, Save, Store, Users, Plus, Trash2 } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { db } from "../../db/schema";
import { useLiveQuery } from "dexie-react-hooks";

type Props = {
    onClose: () => void;
    onSave: () => void;
};

type TokoRow = {
    id: string;
    namaToko: string;
    kecamatan: string;
    kabupaten: string;
    noTelepon: string;
    linkGmaps: string;
    statusToko: boolean;
    isValid: boolean;
};

const initialRow = (): TokoRow => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    namaToko: "",
    kecamatan: "",
    kabupaten: "",
    noTelepon: "",
    linkGmaps: "",
    statusToko: true,
    isValid: false,
});

export function TambahTokoModal({ onClose, onSave }: Props) {
    const [selectedSalesId, setSelectedSalesId] = useState<number | null>(null);
    const [tokoRows, setTokoRows] = useState<TokoRow[]>([]);
    const [saving, setSaving] = useState(false);

    const sales = useLiveQuery(() => db.sales.filter((s) => s.status_aktif === true).toArray(), [], []);
    const salesOptions = useMemo(() => (sales || []).sort((a, b) => (a.nama_sales || "").localeCompare(b.nama_sales || "")), [sales]);

    const addTokoRow = useCallback(() => {
        setTokoRows((prev) => [...prev, initialRow()]);
    }, []);

    const removeTokoRow = useCallback((id: string) => {
        setTokoRows((prev) => prev.filter((row) => row.id !== id));
    }, []);

    const updateTokoRow = useCallback((id: string, field: keyof TokoRow, value: string | boolean) => {
        setTokoRows((prev) =>
            prev.map((row) => {
                if (row.id !== id) return row;
                const updated = { ...row, [field]: value };
                updated.isValid = !!(updated.namaToko.trim() && updated.kecamatan.trim() && updated.kabupaten.trim());
                return updated;
            })
        );
    }, []);

    const handleSalesChange = useCallback((salesId: number | null) => {
        setSelectedSalesId(salesId);
        if (salesId && tokoRows.length === 0) {
            addTokoRow();
        }
    }, [tokoRows.length, addTokoRow]);

    const validRows = tokoRows.filter((row) => row.isValid);
    const isValid = selectedSalesId && validRows.length > 0;

    const handleSubmit = async () => {
        if (!isValid) {
            alert("Lengkapi semua field wajib (Nama Toko, Kecamatan, Kabupaten) dan pilih Sales");
            return;
        }

        setSaving(true);
        try {
            const now = new Date().toISOString();
            const maxToko = await db.toko.orderBy("id_toko").last();
            let nextId = (maxToko?.id_toko ?? 0) + 1;

            for (const row of validRows) {
                await db.toko.add({
                    id_toko: nextId++,
                    nama_toko: row.namaToko.trim(),
                    kecamatan: row.kecamatan.trim(),
                    kabupaten: row.kabupaten.trim(),
                    no_telepon: row.noTelepon.trim() || null,
                    link_gmaps: row.linkGmaps.trim() || null,
                    id_sales: selectedSalesId,
                    status_toko: row.statusToko,
                    dibuat_pada: now,
                    diperbarui_pada: now,
                });
            }

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save toko:", err);
            alert("Gagal menyimpan toko");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white shadow-2xl border border-slate-200 flex flex-col" style={{ width: "80%", height: "80vh" }}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <div className="flex items-center gap-2">
                        <Store size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">Tambah Toko Baru (Bulk)</h2>
                        <span className="ml-2 text-xs text-white/70">Tambahkan banyak toko sekaligus untuk satu sales</span>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Sales Selection */}
                    <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-slate-500" />
                            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Pilih Sales:</label>
                            <select
                                value={selectedSalesId ?? ""}
                                onChange={(e) => handleSalesChange(Number(e.target.value) || null)}
                                className="h-9 px-3 border border-slate-300 text-sm min-w-[200px]"
                            >
                                <option value="">-- Pilih Sales --</option>
                                {salesOptions.map((s) => (
                                    <option key={s.id_sales} value={s.id_sales}>{s.nama_sales}</option>
                                ))}
                            </select>
                        </div>
                        {tokoRows.length > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-500">Total: <strong className="text-slate-800">{tokoRows.length}</strong> toko</span>
                                <span className="text-green-600">Valid: <strong>{validRows.length}</strong></span>
                            </div>
                        )}
                        {selectedSalesId && (
                            <button
                                onClick={addTokoRow}
                                className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white font-medium hover:bg-emerald-700"
                            >
                                <Plus size={14} />
                                Tambah Toko
                            </button>
                        )}
                    </div>

                    {/* Table Header */}
                    {tokoRows.length > 0 && (
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_100px_40px] gap-2 px-2 py-2 bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-1">
                            <div>Nama Toko *</div>
                            <div>Kecamatan *</div>
                            <div>Kabupaten *</div>
                            <div>No. Telepon</div>
                            <div>Link Google Maps</div>
                            <div>Status</div>
                            <div></div>
                        </div>
                    )}

                    {/* Toko Rows - Each row is one toko with 3-column grid */}
                    {tokoRows.map((row, index) => (
                        <div
                            key={row.id}
                            className={`grid grid-cols-[1fr_1fr_1fr_1fr_1fr_100px_40px] gap-2 px-2 py-2 border-l border-r border-b border-slate-200 ${row.isValid ? "bg-green-50" : "bg-white"}`}
                        >
                            <input
                                type="text"
                                placeholder="Nama Toko"
                                value={row.namaToko}
                                onChange={(e) => updateTokoRow(row.id, "namaToko", e.target.value)}
                                className="h-8 px-2 border border-slate-300 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Kecamatan"
                                value={row.kecamatan}
                                onChange={(e) => updateTokoRow(row.id, "kecamatan", e.target.value)}
                                className="h-8 px-2 border border-slate-300 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Kabupaten"
                                value={row.kabupaten}
                                onChange={(e) => updateTokoRow(row.id, "kabupaten", e.target.value)}
                                className="h-8 px-2 border border-slate-300 text-sm"
                            />
                            <input
                                type="tel"
                                placeholder="081234567890"
                                value={row.noTelepon}
                                onChange={(e) => updateTokoRow(row.id, "noTelepon", e.target.value)}
                                className="h-8 px-2 border border-slate-300 text-sm"
                            />
                            <input
                                type="url"
                                placeholder="https://maps.google.com/..."
                                value={row.linkGmaps}
                                onChange={(e) => updateTokoRow(row.id, "linkGmaps", e.target.value)}
                                className="h-8 px-2 border border-slate-300 text-sm"
                            />
                            <select
                                value={row.statusToko ? "aktif" : "nonaktif"}
                                onChange={(e) => updateTokoRow(row.id, "statusToko", e.target.value === "aktif")}
                                className="h-8 px-2 border border-slate-300 text-sm bg-white"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Non-Aktif</option>
                            </select>
                            <button
                                onClick={() => removeTokoRow(row.id)}
                                className="h-8 flex items-center justify-center text-red-500 hover:bg-red-50 border border-slate-300"
                                title="Hapus"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Empty State */}
                    {selectedSalesId && tokoRows.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Store size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Klik "Tambah Toko" untuk menambahkan toko baru</p>
                        </div>
                    )}

                    {!selectedSalesId && (
                        <div className="text-center py-12 text-slate-400">
                            <Users size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Pilih sales terlebih dahulu untuk menambahkan toko</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 bg-slate-50 flex justify-between items-center h-10">
                    <div className="text-xs text-slate-500">
                        {validRows.length > 0 ? (
                            <span className="text-green-600">✓ {validRows.length} toko siap disimpan</span>
                        ) : (
                            <span className="text-amber-600">Lengkapi minimal satu toko (Nama, Kecamatan, Kabupaten)</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-3 py-1 text-sm border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100" disabled={saving}>
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving || !isValid}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-[#005461] text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
                        >
                            <Save size={14} />
                            {saving ? "Menyimpan..." : `Simpan ${validRows.length} Toko`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
