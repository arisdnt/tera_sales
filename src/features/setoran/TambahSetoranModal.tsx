import { X, Save, Banknote } from "lucide-react";
import { useState } from "react";
import { db } from "../../db/schema";
import { insertWithSync } from "../../utils/syncOperations";

type Props = {
    onClose: () => void;
    onSave: () => void;
};

export function TambahSetoranModal({ onClose, onSave }: Props) {
    const [totalSetoran, setTotalSetoran] = useState<number>(0);
    const [penerimaSetoran, setPenerimaSetoran] = useState<string>("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (totalSetoran <= 0) {
            alert("Total setoran harus lebih dari 0");
            return;
        }
        if (!penerimaSetoran.trim()) {
            alert("Penerima setoran harus diisi");
            return;
        }

        setSaving(true);
        try {
            // insertWithSync will generate negative local ID automatically
            await insertWithSync("setoran", "id_setoran", {
                total_setoran: totalSetoran,
                penerima_setoran: penerimaSetoran.trim(),
            });

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save setoran:", err);
            alert("Gagal menyimpan setoran");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white shadow-2xl border border-slate-200 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">Form Setoran Baru</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-4 space-y-4">
                    {/* Total Setoran */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Total Setoran <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                            <input
                                type="number"
                                min={0}
                                value={totalSetoran || ""}
                                onChange={(e) => setTotalSetoran(Number(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full h-10 pl-10 pr-3 border border-slate-300 text-sm"
                            />
                        </div>
                    </div>

                    {/* Penerima Setoran */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Penerima Setoran <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={penerimaSetoran}
                            onChange={(e) => setPenerimaSetoran(e.target.value)}
                            placeholder="Nama penerima setoran"
                            maxLength={100}
                            className="w-full h-10 px-3 border border-slate-300 text-sm"
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
                        <h3 className="text-sm font-semibold text-green-900 mb-2">Ringkasan Setoran</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-green-700 text-xs">Total Setoran</p>
                                <p className="font-bold text-green-900">
                                    Rp {totalSetoran.toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div>
                                <p className="text-green-700 text-xs">Penerima</p>
                                <p className="font-semibold text-green-900">{penerimaSetoran || "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
                        disabled={saving}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || totalSetoran <= 0 || !penerimaSetoran.trim()}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-[#005461] text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
                    >
                        <Save size={14} />
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
