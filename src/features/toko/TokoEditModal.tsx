import { useState, useEffect } from "react";
import { X, Save, Store, Users } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type TokoData = {
    id_toko: number;
    nama_toko: string;
    kecamatan: string;
    kabupaten: string;
    noTelepon: string | null;
    linkGmaps: string | null;
    idSales: number;
    statusToko: boolean;
};

type Props = {
    toko: TokoData;
    onClose: () => void;
    onSave: () => void;
};

export function TokoEditModal({ toko, onClose, onSave }: Props) {
    const [namaToko, setNamaToko] = useState(toko.nama_toko);
    const [kecamatan, setKecamatan] = useState(toko.kecamatan);
    const [kabupaten, setKabupaten] = useState(toko.kabupaten);
    const [noTelepon, setNoTelepon] = useState(toko.noTelepon ?? "");
    const [linkGmaps, setLinkGmaps] = useState(toko.linkGmaps ?? "");
    const [idSales, setIdSales] = useState<number>(toko.idSales);
    const [statusToko, setStatusToko] = useState(toko.statusToko);
    const [saving, setSaving] = useState(false);

    const sales = useLiveQuery(() => db.sales.filter((s) => s.status_aktif === true).toArray(), [], []);
    const salesOptions = (sales || []).sort((a, b) => (a.nama_sales || "").localeCompare(b.nama_sales || ""));

    const isValid = namaToko.trim() && kecamatan.trim() && kabupaten.trim() && idSales;

    const handleSave = async () => {
        if (!isValid) {
            alert("Lengkapi semua field wajib (Nama Toko, Kecamatan, Kabupaten, Sales)");
            return;
        }

        setSaving(true);
        try {
            await db.toko.update(toko.id_toko, {
                nama_toko: namaToko.trim(),
                kecamatan: kecamatan.trim(),
                kabupaten: kabupaten.trim(),
                no_telepon: noTelepon.trim() || null,
                link_gmaps: linkGmaps.trim() || null,
                id_sales: idSales,
                status_toko: statusToko,
                diperbarui_pada: new Date().toISOString(),
            });

            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save toko:", err);
            alert("Gagal menyimpan perubahan");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="w-full max-w-lg bg-white shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Store size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Edit Toko #{toko.id_toko}</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="space-y-4">
                        {/* Nama Toko */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Nama Toko <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={namaToko}
                                onChange={(e) => setNamaToko(e.target.value)}
                                className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                placeholder="Masukkan nama toko"
                            />
                        </div>

                        {/* Sales */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Sales Penanggung Jawab <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={idSales}
                                    onChange={(e) => setIdSales(Number(e.target.value))}
                                    className="w-full h-10 pl-9 pr-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none appearance-none bg-white"
                                >
                                    <option value="">-- Pilih Sales --</option>
                                    {salesOptions.map((s) => (
                                        <option key={s.id_sales} value={s.id_sales}>{s.nama_sales}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Kecamatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={kecamatan}
                                    onChange={(e) => setKecamatan(e.target.value)}
                                    className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                    placeholder="Nama kecamatan"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Kabupaten <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={kabupaten}
                                    onChange={(e) => setKabupaten(e.target.value)}
                                    className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                    placeholder="Nama kabupaten"
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                    No. Telepon
                                </label>
                                <input
                                    type="tel"
                                    value={noTelepon}
                                    onChange={(e) => setNoTelepon(e.target.value)}
                                    className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                    placeholder="081234567890"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                    Status
                                </label>
                                <select
                                    value={statusToko ? "aktif" : "nonaktif"}
                                    onChange={(e) => setStatusToko(e.target.value === "aktif")}
                                    className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none appearance-none bg-white"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>

                        {/* Link Maps */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                                Link Google Maps
                            </label>
                            <input
                                type="url"
                                value={linkGmaps}
                                onChange={(e) => setLinkGmaps(e.target.value)}
                                className="w-full h-10 px-3 border border-slate-300 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                                placeholder="https://maps.google.com/..."
                            />
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
