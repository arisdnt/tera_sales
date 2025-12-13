import { X, Store, Plus, Trash2 } from "lucide-react";
import type { StoreRow } from "./types";
import type { ProdukRow } from "../../db/supabaseTables";

type Props = {
    row: StoreRow;
    storeIndex: number;
    priorityProducts: ProdukRow[] | undefined;
    nonPriorityProducts: ProdukRow[] | undefined;
    onRemove: () => void;
    onUpdatePriorityQty: (produkId: number, qty: number) => void;
    onToggleNonPriority: (checked: boolean) => void;
    onAddNonPriorityItem: () => void;
    onUpdateNonPriorityItem: (
        itemIndex: number,
        field: "id_produk" | "jumlah_terjual",
        value: number
    ) => void;
    onRemoveNonPriorityItem: (itemIndex: number) => void;
    onUpdatePaymentField: (field: keyof StoreRow, value: any) => void;
};

export function StoreSection({
    row,
    storeIndex,
    priorityProducts,
    nonPriorityProducts,
    onRemove,
    onUpdatePriorityQty,
    onToggleNonPriority,
    onAddNonPriorityItem,
    onUpdateNonPriorityItem,
    onRemoveNonPriorityItem,
    onUpdatePaymentField,
}: Props) {
    return (
        <div className="mb-6 border border-slate-200 bg-white">
            {/* Store Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <Store size={16} className="text-purple-600" />
                    <span className="font-semibold text-slate-800">{row.nama_toko}</span>
                    <span className="text-xs text-slate-500">
                        - {row.kecamatan}, {row.kabupaten}
                    </span>
                </div>
                <button
                    onClick={onRemove}
                    className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1"
                >
                    <X size={12} />
                    Hapus Toko
                </button>
            </div>

            {/* 2-Column Layout: 70% products, 30% payment */}
            <div className="grid gap-4 p-4" style={{ gridTemplateColumns: "70% 30%" }}>
                {/* Left Column: Products */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-700 mb-2">Input Quantity Barang</h3>
                    <table className="w-full text-xs border border-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-2 py-2 text-left font-semibold border-r border-slate-200">
                                    Nama Barang
                                </th>
                                {priorityProducts?.map((p) => (
                                    <th
                                        key={p.id_produk}
                                        className="px-2 py-2 text-center font-semibold border-r border-slate-200"
                                        style={{ minWidth: 80 }}
                                    >
                                        <div>{p.nama_produk}</div>
                                        <div className="text-[10px] text-slate-500 font-normal">
                                            Rp {Number(p.harga_satuan).toLocaleString("id-ID")}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-2 py-2 border-r border-slate-200 text-slate-700 text-[10px]">
                                    Qty
                                </td>
                                {priorityProducts?.map((p) => (
                                    <td key={p.id_produk} className="px-1 py-1 border-r border-slate-200">
                                        <input
                                            type="number"
                                            min={0}
                                            value={row.priority_terjual[p.id_produk] ?? ""}
                                            onChange={(e) =>
                                                onUpdatePriorityQty(p.id_produk, Number(e.target.value) || 0)
                                            }
                                            placeholder="0"
                                            className="w-full h-7 text-center border border-slate-200 text-xs font-mono"
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    {/* Non-priority toggle */}
                    <div className="mt-3 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`np-${row.id_toko}`}
                            checked={row.has_non_priority}
                            onChange={(e) => onToggleNonPriority(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label htmlFor={`np-${row.id_toko}`} className="text-xs text-slate-700">
                            Tambah produk non-prioritas
                        </label>
                    </div>

                    {/* Non-priority items */}
                    {row.has_non_priority && (
                        <div className="mt-2 pl-6 space-y-2">
                            {row.non_priority_items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center gap-2">
                                    <select
                                        value={item.id_produk}
                                        onChange={(e) =>
                                            onUpdateNonPriorityItem(itemIndex, "id_produk", Number(e.target.value))
                                        }
                                        className="flex-1 h-7 px-2 border border-slate-300 text-xs"
                                    >
                                        <option value={0}>-- Pilih Produk --</option>
                                        {nonPriorityProducts?.map((p) => (
                                            <option key={p.id_produk} value={p.id_produk}>
                                                {p.nama_produk} - Rp {Number(p.harga_satuan).toLocaleString("id-ID")}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        min={0}
                                        value={item.jumlah_terjual || ""}
                                        onChange={(e) =>
                                            onUpdateNonPriorityItem(
                                                itemIndex,
                                                "jumlah_terjual",
                                                Number(e.target.value) || 0
                                            )
                                        }
                                        placeholder="Qty"
                                        className="w-20 h-7 text-center border border-slate-300 text-xs"
                                    />
                                    <button
                                        onClick={() => onRemoveNonPriorityItem(itemIndex)}
                                        className="p-1 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={onAddNonPriorityItem}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1"
                            >
                                <Plus size={12} />
                                Tambah Item
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Payment Details */}
                <div>
                    <h3 className="text-xs font-semibold text-slate-700 mb-2">Detail Pembayaran</h3>
                    <div className="space-y-3 p-3 bg-slate-50 border border-slate-200">
                        {/* Metode Bayar & Tanggal in one row */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] text-slate-500 mb-1">Metode Bayar</label>
                                <select
                                    value={row.metode_pembayaran}
                                    onChange={(e) => onUpdatePaymentField("metode_pembayaran", e.target.value)}
                                    className="w-full h-8 px-2 border border-slate-300 text-xs"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Transfer">Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    value={row.tanggal_pembayaran}
                                    onChange={(e) => onUpdatePaymentField("tanggal_pembayaran", e.target.value)}
                                    className="w-full h-8 px-2 border border-slate-300 text-xs"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 mb-1">Total Diterima</label>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    value={row.total_uang_diterima}
                                    onChange={(e) =>
                                        onUpdatePaymentField("total_uang_diterima", Number(e.target.value))
                                    }
                                    className="w-full h-8 pl-6 pr-2 border border-slate-300 text-xs font-mono"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id={`pot-${row.id_toko}`}
                                    checked={row.ada_potongan}
                                    onChange={(e) => onUpdatePaymentField("ada_potongan", e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor={`pot-${row.id_toko}`} className="text-xs text-slate-600">
                                    Ada Potongan
                                </label>
                            </div>
                            {row.ada_potongan && (
                                <input
                                    type="number"
                                    placeholder="Jumlah potongan"
                                    value={row.jumlah_potongan || ""}
                                    onChange={(e) =>
                                        onUpdatePaymentField("jumlah_potongan", Number(e.target.value) || 0)
                                    }
                                    className="w-full h-8 px-2 border border-slate-300 text-xs"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
