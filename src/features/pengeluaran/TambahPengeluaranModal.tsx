import { X, Save, Receipt } from "lucide-react";
import { useState } from "react";
import { db } from "../../db/schema";
import { insertWithSync } from "../../utils/syncOperations";

type Props = {
    onClose: () => void;
    onSave: () => void;
};

export function TambahPengeluaranModal({ onClose, onSave }: Props) {
    const [jumlah, setJumlah] = useState<number>(0);
    const [keterangan, setKeterangan] = useState<string>("");
    const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (jumlah <= 0) {
            alert("Jumlah harus lebih dari 0");
            return;
        }
        if (!keterangan.trim()) {
            alert("Keterangan harus diisi");
            return;
        }

        setSaving(true);
        try {
            // insertWithSync will generate negative local ID automatically
            await insertWithSync("pengeluaran_operasional", "id_pengeluaran", {
                jumlah: jumlah,
                keterangan: keterangan.trim(),
                url_bukti_foto: null,
                tanggal_pengeluaran: tanggal + "T00:00:00Z",
            });

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save pengeluaran:", err);
            alert("Gagal menyimpan pengeluaran");
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
                        <Receipt size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">Tambah Pengeluaran Baru</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-4 space-y-4">
                    {/* Tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tanggal Pengeluaran <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="w-full h-10 px-3 border border-slate-300 text-sm"
                        />
                    </div>

                    {/* Jumlah */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Jumlah (Rp) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rp</span>
                            <input
                                type="number"
                                min={0}
                                value={jumlah || ""}
                                onChange={(e) => setJumlah(Number(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full h-10 pl-10 pr-3 border border-slate-300 text-sm"
                            />
                        </div>
                    </div>

                    {/* Keterangan */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Keterangan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder="Deskripsi pengeluaran..."
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 text-sm resize-none"
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4">
                        <h3 className="text-sm font-semibold text-red-900 mb-2">Ringkasan Pengeluaran</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-red-700 text-xs">Jumlah</p>
                                <p className="font-bold text-red-900">Rp {jumlah.toLocaleString("id-ID")}</p>
                            </div>
                            <div>
                                <p className="text-red-700 text-xs">Tanggal</p>
                                <p className="font-semibold text-red-900">{tanggal || "-"}</p>
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
                        disabled={saving || jumlah <= 0 || !keterangan.trim()}
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
