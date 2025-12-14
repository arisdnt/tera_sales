import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

type Props = {
    title: string;
    message: string;
    itemName: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
};

/**
 * SimpleConfirmDeleteModal - Modal konfirmasi hapus TANPA captcha
 * Digunakan untuk data non-kritikal seperti: pengeluaran, pembayaran, dll.
 * 
 * Untuk data kritikal (produk, sales, toko) gunakan ConfirmDeleteModal
 * yang memiliki captcha matematika.
 */
export function SimpleConfirmDeleteModal({ title, message, itemName, onConfirm, onCancel }: Props) {
    const [deleting, setDeleting] = useState(false);

    const handleConfirm = async () => {
        setDeleting(true);
        try {
            await onConfirm();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Gagal menghapus data");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-sm bg-white shadow-2xl border border-slate-200 rounded">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-red-600 bg-red-600 px-4 h-10 rounded-t">
                    <div className="flex items-center gap-2">
                        <Trash2 size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">{title}</h2>
                    </div>
                    <button onClick={onCancel} className="text-white/70 hover:text-white" disabled={deleting}>
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-700 mb-2">{message}</p>
                            <p className="text-sm font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                "{itemName}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-end gap-2 rounded-b">
                    <button
                        onClick={onCancel}
                        className="px-4 py-1.5 text-sm border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors rounded"
                        disabled={deleting}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={deleting}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 rounded"
                    >
                        <Trash2 size={14} />
                        {deleting ? "Menghapus..." : "Hapus"}
                    </button>
                </div>
            </div>
        </div>
    );
}
