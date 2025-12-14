import { useState } from "react";
import { X, Save, Package } from "lucide-react";
import { insertWithSync } from "../../utils/syncOperations";

type Props = {
    onClose: () => void;
    onSave: () => void;
};

export function TambahProdukModal({ onClose, onSave }: Props) {
    const [namaProduk, setNamaProduk] = useState("");
    const [hargaSatuan, setHargaSatuan] = useState("");
    const [statusProduk, setStatusProduk] = useState(true);
    const [isPriority, setIsPriority] = useState(false);
    const [priorityOrder, setPriorityOrder] = useState("");
    const [saving, setSaving] = useState(false);

    const isValid = namaProduk.trim() && hargaSatuan && Number(hargaSatuan) > 0;

    const handleSave = async () => {
        if (!isValid) {
            alert("Lengkapi semua field wajib (Nama Produk dan Harga Satuan)");
            return;
        }

        setSaving(true);
        try {
            await insertWithSync("produk", "id_produk", {
                nama_produk: namaProduk.trim(),
                harga_satuan: Number(hargaSatuan),
                status_produk: statusProduk,
                is_priority: isPriority,
                priority_order: isPriority && priorityOrder ? Number(priorityOrder) : null,
            });

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save produk:", err);
            alert("Gagal menyimpan produk");
        } finally {
            setSaving(false);
        }
    };

    const formatCurrencyInput = (value: string) => {
        // Remove non-digit characters
        const numericValue = value.replace(/\D/g, "");
        return numericValue;
    };

    const displayCurrency = (value: string) => {
        if (!value) return "";
        return new Intl.NumberFormat("id-ID").format(Number(value));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-lg bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Package size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Tambah Produk Baru</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="space-y-4">
                        {/* Nama Produk */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Nama Produk <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={namaProduk}
                                onChange={(e) => setNamaProduk(e.target.value)}
                                className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="Masukkan nama produk"
                                autoFocus
                            />
                        </div>

                        {/* Harga Satuan */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Harga Satuan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                                <input
                                    type="text"
                                    value={displayCurrency(hargaSatuan)}
                                    onChange={(e) => setHargaSatuan(formatCurrencyInput(e.target.value))}
                                    className="w-full h-10 pl-10 pr-3 border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            {hargaSatuan && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(hargaSatuan))}
                                </p>
                            )}
                        </div>

                        {/* Status Produk */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Status Produk
                            </label>
                            <select
                                value={statusProduk ? "aktif" : "nonaktif"}
                                onChange={(e) => setStatusProduk(e.target.value === "aktif")}
                                className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none bg-white"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Tidak Aktif</option>
                            </select>
                        </div>

                        {/* Priority Section */}
                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    id="isPriority"
                                    checked={isPriority}
                                    onChange={(e) => {
                                        setIsPriority(e.target.checked);
                                        if (!e.target.checked) setPriorityOrder("");
                                    }}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isPriority" className="text-sm font-medium text-slate-700">
                                    Jadikan produk prioritas
                                </label>
                            </div>

                            {isPriority && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                        Urutan Prioritas
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={priorityOrder}
                                        onChange={(e) => setPriorityOrder(e.target.value)}
                                        className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        placeholder="Contoh: 1, 2, 3..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Produk dengan urutan lebih kecil akan muncul lebih dulu
                                    </p>
                                </div>
                            )}
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
                        disabled={saving || !isValid}
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
