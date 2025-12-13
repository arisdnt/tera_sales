import { useState } from "react";
import { X, Save, User, Phone } from "lucide-react";
import { db } from "../../db/schema";
import { insertWithSync } from "../../utils/syncOperations";

type Props = {
    onClose: () => void;
    onSave: () => void;
};

export function TambahSalesModal({ onClose, onSave }: Props) {
    const [namaSales, setNamaSales] = useState("");
    const [nomorTelepon, setNomorTelepon] = useState("");
    const [statusAktif, setStatusAktif] = useState(true);
    const [saving, setSaving] = useState(false);

    const isValid = namaSales.trim().length > 0;

    const handleSave = async () => {
        if (!isValid) {
            alert("Nama sales wajib diisi");
            return;
        }

        setSaving(true);
        try {
            // insertWithSync will generate negative local ID automatically
            await insertWithSync("sales", "id_sales", {
                nama_sales: namaSales.trim(),
                nomor_telepon: nomorTelepon.trim() || null,
                status_aktif: statusAktif,
            });

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save sales:", err);
            alert("Gagal menyimpan sales");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-md bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">Tambah Sales Baru</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="space-y-4">
                        {/* Nama Sales */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Nama Sales <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={namaSales}
                                    onChange={(e) => setNamaSales(e.target.value)}
                                    className="w-full h-10 pl-9 pr-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                    placeholder="Masukkan nama sales"
                                />
                            </div>
                        </div>

                        {/* Nomor Telepon */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="tel"
                                    value={nomorTelepon}
                                    onChange={(e) => setNomorTelepon(e.target.value)}
                                    className="w-full h-10 pl-9 pr-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                    placeholder="081234567890"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Status
                            </label>
                            <select
                                value={statusAktif ? "aktif" : "nonaktif"}
                                onChange={(e) => setStatusAktif(e.target.value === "aktif")}
                                className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none appearance-none bg-white"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Tidak Aktif</option>
                            </select>
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
