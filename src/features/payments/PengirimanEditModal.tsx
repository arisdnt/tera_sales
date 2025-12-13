import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Package } from "lucide-react";
import type { PengirimanDashboardRow } from "../../db/supabaseViewsExtras";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { insertWithSync, updateWithSync, deleteWithSync } from "../../utils/syncOperations";
import type { DetailPengirimanRow } from "../../db/supabaseTables";

type Props = {
    row: PengirimanDashboardRow;
    onClose: () => void;
    onSave: () => void;
};

type EditableDetail = {
    id_detail_kirim?: number;
    id_produk: number;
    jumlah_kirim: number;
    isNew?: boolean;
};

export function PengirimanEditModal({ row, onClose, onSave }: Props) {
    const [tanggalKirim, setTanggalKirim] = useState(row.tanggal_kirim?.toString() ?? "");
    const [selectedTokoId, setSelectedTokoId] = useState<number | null>(row.id_toko ?? null);
    const [details, setDetails] = useState<EditableDetail[]>([]);
    const [saving, setSaving] = useState(false);

    // Fetch toko options
    const tokoOptions = useLiveQuery(
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

    // Load existing details
    useEffect(() => {
        if (!row.id_pengiriman) return;
        db.detail_pengiriman
            .where("id_pengiriman")
            .equals(row.id_pengiriman)
            .toArray()
            .then((items) => {
                setDetails(
                    items.map((item) => ({
                        id_detail_kirim: item.id_detail_kirim,
                        id_produk: item.id_produk,
                        jumlah_kirim: item.jumlah_kirim,
                    }))
                );
            });
    }, [row.id_pengiriman]);

    const handleAddRow = () => {
        if (!produkOptions || produkOptions.length === 0) return;
        setDetails([
            ...details,
            {
                id_produk: produkOptions[0].id_produk,
                jumlah_kirim: 1,
                isNew: true,
            },
        ]);
    };

    const handleRemoveRow = (index: number) => {
        setDetails(details.filter((_, i) => i !== index));
    };

    const handleDetailChange = (index: number, field: "id_produk" | "jumlah_kirim", value: number) => {
        setDetails(
            details.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSave = async () => {
        if (!row.id_pengiriman || !selectedTokoId) return;

        setSaving(true);
        try {
            // Update pengiriman
            await db.pengiriman.update(row.id_pengiriman, {
                tanggal_kirim: tanggalKirim,
                id_toko: selectedTokoId,
                diperbarui_pada: new Date().toISOString(),
            });

            // Get existing details
            const existingDetails = await db.detail_pengiriman
                .where("id_pengiriman")
                .equals(row.id_pengiriman)
                .toArray();

            // Delete removed details
            const keepIds = details.filter((d) => d.id_detail_kirim).map((d) => d.id_detail_kirim!);
            const toDelete = existingDetails.filter((d) => !keepIds.includes(d.id_detail_kirim));
            for (const item of toDelete) {
                await deleteWithSync("detail_pengiriman", "id_detail_kirim", item.id_detail_kirim);
            }

            // Update existing and add new
            for (const detail of details) {
                if (detail.id_detail_kirim) {
                    // Update existing
                    await updateWithSync("detail_pengiriman", "id_detail_kirim", detail.id_detail_kirim, {
                        id_produk: detail.id_produk,
                        jumlah_kirim: detail.jumlah_kirim,
                    });
                } else {
                    // Add new
                    const maxId = await db.detail_pengiriman.orderBy("id_detail_kirim").last();
                    const newId = (maxId?.id_detail_kirim ?? 0) + 1;
                    await insertWithSync("detail_pengiriman", "id_detail_kirim", {
                        id_detail_kirim: newId,
                        id_pengiriman: row.id_pengiriman,
                        id_produk: detail.id_produk,
                        jumlah_kirim: detail.jumlah_kirim,
                        dibuat_pada: new Date().toISOString(),
                        diperbarui_pada: new Date().toISOString(),
                    });
                }
            }

            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Gagal menyimpan perubahan");
        } finally {
            setSaving(false);
        }
    };

    const getProdukName = (id: number) => {
        return produkOptions?.find((p) => p.id_produk === id)?.nama_produk ?? "-";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-2xl bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Package size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Edit Pengiriman #{row.id_pengiriman ?? "-"}</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {/* Tanggal */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Tanggal Kirim
                            </label>
                            <input
                                type="date"
                                value={tanggalKirim}
                                onChange={(e) => setTanggalKirim(e.target.value)}
                                className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                        </div>

                        {/* Toko */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Toko
                            </label>
                            <select
                                value={selectedTokoId ?? ""}
                                onChange={(e) => setSelectedTokoId(Number(e.target.value))}
                                className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                            >
                                <option value="">Pilih Toko</option>
                                {tokoOptions?.map((toko) => (
                                    <option key={toko.id_toko} value={toko.id_toko}>
                                        {toko.nama_toko}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Detail Barang */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Package size={16} />
                                Detail Barang
                            </h3>
                            <button
                                onClick={handleAddRow}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                            >
                                <Plus size={14} />
                                Tambah
                            </button>
                        </div>

                        <div className="border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Produk</th>
                                        <th className="text-center px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200 w-32">Qty</th>
                                        <th className="text-center px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200 w-16">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                                Belum ada item. Klik "Tambah" untuk menambahkan.
                                            </td>
                                        </tr>
                                    ) : (
                                        details.map((item, idx) => (
                                            <tr key={item.id_detail_kirim ?? `new-${idx}`} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                <td className="px-4 py-2">
                                                    <select
                                                        value={item.id_produk}
                                                        onChange={(e) => handleDetailChange(idx, "id_produk", Number(e.target.value))}
                                                        className="w-full h-9 px-2 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                                    >
                                                        {produkOptions?.map((produk) => (
                                                            <option key={produk.id_produk} value={produk.id_produk}>
                                                                {produk.nama_produk}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.jumlah_kirim}
                                                        onChange={(e) => handleDetailChange(idx, "jumlah_kirim", Number(e.target.value))}
                                                        className="w-full h-9 px-2 border border-slate-300 text-sm text-center font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <button
                                                        onClick={() => handleRemoveRow(idx)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 bg-slate-50 flex justify-end gap-2 items-center h-10">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-sm border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                        disabled={saving}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedTokoId || details.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1 text-sm bg-[#005461] text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={14} />
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
