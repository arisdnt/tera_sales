import { useState, useMemo, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import { Search, X, Plus, Save, Package, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import type { StoreRow } from "./types";
import { StoreSection } from "./StoreSection";
import { savePenagihan } from "./penagihanService";

type Props = {
    onClose: () => void;
    onSave: () => void;
};

export function TambahPembayaranModal({ onClose, onSave }: Props) {
    const [selectedSalesId, setSelectedSalesId] = useState<number | null>(null);
    const [tokoSearch, setTokoSearch] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [storeRows, setStoreRows] = useState<StoreRow[]>([]);
    const [autoRestock, setAutoRestock] = useState(true);
    const [saving, setSaving] = useState(false);

    const salesOptions = useLiveQuery(() => db.sales.filter((s) => s.status_aktif === true).toArray(), [], []);
    const priorityProducts = useLiveQuery(() => db.produk.filter((p) => p.status_produk === true && p.is_priority === true).sortBy("priority_order"), [], []);
    const nonPriorityProducts = useLiveQuery(() => db.produk.filter((p) => p.status_produk === true && p.is_priority !== true).toArray(), [], []);
    const tokoOptions = useLiveQuery(() => {
        if (!selectedSalesId) return [];
        return db.toko.filter((t) => t.status_toko === true && t.id_sales === selectedSalesId).toArray();
    }, [selectedSalesId], []);

    const filteredTokos = useMemo(() => {
        if (!tokoOptions || !tokoSearch.trim()) return [];
        const search = tokoSearch.toLowerCase().trim();
        const selectedIds = new Set(storeRows.map((r) => r.id_toko));
        return tokoOptions.filter((t) => !selectedIds.has(t.id_toko) && (t.nama_toko.toLowerCase().includes(search) || (t.kecamatan ?? "").toLowerCase().includes(search) || (t.kabupaten ?? "").toLowerCase().includes(search)));
    }, [tokoOptions, tokoSearch, storeRows]);

    const calculateStoreTotal = useCallback((row: StoreRow) => {
        let total = 0;
        Object.entries(row.priority_terjual).forEach(([produkId, qty]) => {
            const product = priorityProducts?.find((p) => p.id_produk === Number(produkId));
            if (product && qty > 0) total += qty * Number(product.harga_satuan);
        });
        row.non_priority_items.forEach((item) => {
            const product = nonPriorityProducts?.find((p) => p.id_produk === item.id_produk);
            if (product && item.jumlah_terjual > 0) total += item.jumlah_terjual * Number(product.harga_satuan);
        });
        return total;
    }, [priorityProducts, nonPriorityProducts]);

    const addStore = useCallback((toko: (typeof tokoOptions)[0]) => {
        if (!toko) return;
        const newRow: StoreRow = {
            id_toko: toko.id_toko,
            nama_toko: toko.nama_toko,
            kecamatan: toko.kecamatan ?? "",
            kabupaten: toko.kabupaten ?? "",
            priority_terjual: {},
            has_non_priority: false,
            non_priority_items: [],
            metode_pembayaran: "Cash",
            tanggal_pembayaran: new Date().toISOString().split("T")[0],
            total_uang_diterima: 0,
            ada_potongan: false,
            jumlah_potongan: 0,
            alasan_potongan: "",
        };
        setStoreRows((prev) => [newRow, ...prev]);
        setTokoSearch("");
        setShowSuggestions(false);
    }, []);

    const removeStore = useCallback((index: number) => setStoreRows((prev) => prev.filter((_, i) => i !== index)), []);

    const updatePriorityQty = useCallback((storeIndex: number, produkId: number, qty: number) => {
        setStoreRows((prev) => {
            const newRows = [...prev];
            const row = { ...newRows[storeIndex] };
            row.priority_terjual = { ...row.priority_terjual, [produkId]: Math.max(0, qty) };
            const calculatedTotal = calculateStoreTotal(row);
            row.total_uang_diterima = Math.max(0, calculatedTotal - (row.ada_potongan ? row.jumlah_potongan : 0));
            newRows[storeIndex] = row;
            return newRows;
        });
    }, [calculateStoreTotal]);

    const toggleNonPriority = useCallback((storeIndex: number, checked: boolean) => {
        setStoreRows((prev) => {
            const newRows = [...prev];
            newRows[storeIndex] = { ...newRows[storeIndex], has_non_priority: checked, non_priority_items: checked ? newRows[storeIndex].non_priority_items : [] };
            return newRows;
        });
    }, []);

    const addNonPriorityItem = useCallback((storeIndex: number) => {
        setStoreRows((prev) => {
            const newRows = [...prev];
            newRows[storeIndex] = { ...newRows[storeIndex], non_priority_items: [...newRows[storeIndex].non_priority_items, { id_produk: 0, jumlah_terjual: 0 }] };
            return newRows;
        });
    }, []);

    const updateNonPriorityItem = useCallback((storeIndex: number, itemIndex: number, field: "id_produk" | "jumlah_terjual", value: number) => {
        setStoreRows((prev) => {
            const newRows = [...prev];
            const row = { ...newRows[storeIndex] };
            const items = [...row.non_priority_items];
            items[itemIndex] = { ...items[itemIndex], [field]: value };
            row.non_priority_items = items;
            const calculatedTotal = calculateStoreTotal(row);
            row.total_uang_diterima = Math.max(0, calculatedTotal - (row.ada_potongan ? row.jumlah_potongan : 0));
            newRows[storeIndex] = row;
            return newRows;
        });
    }, [calculateStoreTotal]);

    const removeNonPriorityItem = useCallback((storeIndex: number, itemIndex: number) => {
        setStoreRows((prev) => {
            const newRows = [...prev];
            const row = { ...newRows[storeIndex] };
            row.non_priority_items = row.non_priority_items.filter((_, i) => i !== itemIndex);
            const calculatedTotal = calculateStoreTotal(row);
            row.total_uang_diterima = Math.max(0, calculatedTotal - (row.ada_potongan ? row.jumlah_potongan : 0));
            newRows[storeIndex] = row;
            return newRows;
        });
    }, [calculateStoreTotal]);

    const updatePaymentField = useCallback((storeIndex: number, field: keyof StoreRow, value: any) => {
        setStoreRows((prev) => {
            const newRows = [...prev];
            const row = { ...newRows[storeIndex], [field]: value };
            if (field === "ada_potongan" || field === "jumlah_potongan") {
                const calculatedTotal = calculateStoreTotal(row);
                row.total_uang_diterima = Math.max(0, calculatedTotal - (row.ada_potongan ? row.jumlah_potongan : 0));
            }
            newRows[storeIndex] = row;
            return newRows;
        });
    }, [calculateStoreTotal]);

    const validateForm = (): string | null => {
        if (!selectedSalesId) return "Pilih sales terlebih dahulu";
        if (storeRows.length === 0) return "Tambahkan minimal satu toko";
        for (const row of storeRows) {
            const hasPriority = Object.values(row.priority_terjual).some((q) => q > 0);
            const hasNonPriority = row.non_priority_items.some((i) => i.id_produk > 0 && i.jumlah_terjual > 0);
            if (!hasPriority && !hasNonPriority) return `Toko ${row.nama_toko} harus memiliki minimal satu item`;
        }
        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }
        setSaving(true);
        try {
            await savePenagihan(storeRows, autoRestock);
            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to save:", err);
            alert("Gagal menyimpan pembayaran");
        } finally {
            setSaving(false);
        }
    };

    const summary = useMemo(() => {
        let totalNominal = 0;
        let totalItems = 0;
        storeRows.forEach((row) => {
            totalNominal += row.total_uang_diterima;
            Object.values(row.priority_terjual).forEach((q) => (totalItems += q));
            row.non_priority_items.forEach((i) => (totalItems += i.jumlah_terjual));
        });
        return { totalNominal, totalItems, storeCount: storeRows.length };
    }, [storeRows]);

    const isValid = storeRows.length > 0 && summary.totalItems > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white shadow-2xl border border-slate-200 flex flex-col" style={{ width: "80%", height: "80vh" }}>
                <div className="flex items-center border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <Package size={16} className="text-white mr-2" />
                    <h2 className="text-sm font-bold text-white">Form Pembayaran</h2>
                    <span className="ml-2 text-xs text-white/70">Buat penagihan untuk toko-toko yang sudah dikirim barang</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {/* Sales, Toko Search, Total Nominal, N Toko in One Row */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Pilih Sales:</label>
                            <select value={selectedSalesId ?? ""} onChange={(e) => { setSelectedSalesId(Number(e.target.value) || null); setStoreRows([]); }} className="w-40 h-9 px-3 border border-slate-300 text-sm">
                                <option value="">-- Pilih Sales --</option>
                                {salesOptions?.map((s) => (<option key={s.id_sales} value={s.id_sales}>{s.nama_sales}</option>))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Pilih Toko:</label>
                            <div className="flex-1 relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Cari toko: nama, kecamatan, atau kabupaten..." value={tokoSearch} onChange={(e) => setTokoSearch(e.target.value)} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} disabled={!selectedSalesId} className="w-full h-9 pl-9 pr-3 border border-slate-300 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" />
                                {showSuggestions && tokoSearch && filteredTokos.length > 0 && (
                                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-lg max-h-48 overflow-y-auto">
                                        {filteredTokos.slice(0, 10).map((t) => (<button key={t.id_toko} type="button" onClick={() => addStore(t)} className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 border-b border-slate-100 last:border-b-0"><div className="font-medium">{t.nama_toko}</div><div className="text-xs text-slate-500">{t.kecamatan}, {t.kabupaten}</div></button>))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Total Nominal - Large Font */}
                        <div className="flex items-center h-9 px-3 bg-[#005461]/10 border border-[#005461]/20">
                            <span className="text-base font-bold text-[#005461]">Rp {summary.totalNominal.toLocaleString("id-ID")}</span>
                        </div>
                        {/* N Toko Counter */}
                        <div className="flex items-center gap-1 h-9 px-3 bg-green-50 border border-green-200">
                            <span className="text-base font-bold text-green-700">{summary.storeCount}</span>
                            <span className="text-xs text-green-600">Toko</span>
                        </div>
                    </div>
                    {storeRows.map((row, storeIndex) => (
                        <StoreSection key={row.id_toko} row={row} storeIndex={storeIndex} priorityProducts={priorityProducts} nonPriorityProducts={nonPriorityProducts} onRemove={() => removeStore(storeIndex)} onUpdatePriorityQty={(produkId, qty) => updatePriorityQty(storeIndex, produkId, qty)} onToggleNonPriority={(checked) => toggleNonPriority(storeIndex, checked)} onAddNonPriorityItem={() => addNonPriorityItem(storeIndex)} onUpdateNonPriorityItem={(itemIndex, field, value) => updateNonPriorityItem(storeIndex, itemIndex, field, value)} onRemoveNonPriorityItem={(itemIndex) => removeNonPriorityItem(storeIndex, itemIndex)} onUpdatePaymentField={(field, value) => updatePaymentField(storeIndex, field, value)} />
                    ))}

                    {storeRows.length > 0 && (
                        <div className="mt-4 p-3 bg-slate-50 border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                <input type="checkbox" id="autoRestock" checked={autoRestock} onChange={(e) => setAutoRestock(e.target.checked)} className="w-4 h-4" />
                                <label htmlFor="autoRestock" className="text-xs text-slate-700"><RefreshCw size={12} className="inline mr-1" />Aktifkan auto-restock (otomatis kirim ulang barang yang terjual)</label>
                            </div>
                            <div className="flex items-center gap-6 text-xs">
                                <span className="text-slate-500">Toko siap ditagih: <strong className="text-slate-800">{summary.storeCount}</strong></span>
                                <span className="text-slate-500">Total item: <strong className="text-slate-800">{summary.totalItems}</strong></span>
                                <span className="text-slate-500">Total nominal: <strong className="text-[#005461]">Rp {summary.totalNominal.toLocaleString("id-ID")}</strong></span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 px-4 bg-slate-50 flex justify-between items-center h-10">
                    <div className="flex items-center gap-3 text-xs">
                        {isValid ? (<span className="flex items-center gap-1 text-green-600"><CheckCircle size={12} />✓ Perhitungan sesuai</span>) : (<span className="flex items-center gap-1 text-amber-600"><AlertCircle size={12} />Pilih toko & isi qty</span>)}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-3 py-1 text-sm border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100" disabled={saving}>Batal</button>
                        <button onClick={handleSubmit} disabled={saving || !isValid} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-[#005461] text-white font-semibold hover:bg-teal-700 disabled:opacity-50"><Save size={14} />{saving ? "Menyimpan..." : "Simpan"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
