import { useState } from "react";
import { X, Save, Receipt } from "lucide-react";
import { updateWithSync } from "../../utils/syncOperations";

type PengeluaranData = {
    id: number;
    tanggal: string;
    keterangan: string;
    jumlah: number;
    urlBuktiFoto: string | null;
};

type Props = {
    pengeluaran: PengeluaranData;
    onClose: () => void;
    onSave: () => void;
};

export function EditPengeluaranModal({ pengeluaran, onClose, onSave }: Props) {
    const [jumlah, setJumlah] = useState<number>(pengeluaran.jumlah);
    const [keterangan, setKeterangan] = useState<string>(pengeluaran.keterangan);
    const [tanggal, setTanggal] = useState<string>(pengeluaran.tanggal);
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
            await updateWithSync("pengeluaran_operasional", "id_pengeluaran", pengeluaran.id, {
                jumlah: jumlah,
                keterangan: keterangan.trim(),
                tanggal_pengeluaran: tanggal + "T00:00:00Z",
            });

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to update pengeluaran:", err);
            alert("Gagal menyimpan perubahan");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white shadow-2xl border border-slate-200 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-600 bg-amber-500 px-4 h-10">
                    <div className="flex items-center gap-2">
                        <Receipt size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">Edit Pengeluaran #{pengeluaran.id}</h2>
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
                            className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
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
                                className="w-full h-10 pl-10 pr-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
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
                            className="w-full px-3 py-2 border border-slate-300 text-sm resize-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded">
                        <h3 className="text-sm font-semibold text-amber-900 mb-2">Ringkasan Perubahan</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-amber-700 text-xs">Jumlah</p>
                                <p className="font-bold text-amber-900">Rp {jumlah.toLocaleString("id-ID")}</p>
                            </div>
                            <div>
                                <p className="text-amber-700 text-xs">Tanggal</p>
                                <p className="font-semibold text-amber-900">{tanggal || "-"}</p>
                            </div>
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
                        disabled={saving || jumlah <= 0 || !keterangan.trim()}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 rounded"
                    >
                        <Save size={14} />
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
