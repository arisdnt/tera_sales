import { X, Receipt, Calendar, DollarSign, FileText, ImageIcon, ExternalLink } from "lucide-react";

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
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

export function DetailPengeluaranModal({ pengeluaran, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white shadow-2xl border border-slate-200 w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-teal-700 bg-[#005461] px-4 h-10">
                    <div className="flex items-center gap-2">
                        <Receipt size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">Detail Pengeluaran</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Info Grid */}
                    <div className="space-y-4">
                        {/* ID & Tanggal */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">ID Pengeluaran</span>
                                </div>
                                <p className="text-lg font-mono font-bold text-slate-900">#{pengeluaran.id}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar size={12} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 uppercase">Tanggal</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-900">{formatDate(pengeluaran.tanggal)}</p>
                            </div>
                        </div>

                        {/* Jumlah */}
                        <div className="bg-red-50 border border-red-200 p-4 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={14} className="text-red-600" />
                                <span className="text-xs font-semibold text-red-700 uppercase">Jumlah Pengeluaran</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">{formatCurrency(pengeluaran.jumlah)}</p>
                        </div>

                        {/* Keterangan */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText size={14} className="text-slate-600" />
                                <span className="text-xs font-semibold text-slate-500 uppercase">Keterangan</span>
                            </div>
                            <p className="text-sm text-slate-900 whitespace-pre-wrap">{pengeluaran.keterangan}</p>
                        </div>

                        {/* Bukti Foto */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <ImageIcon size={14} className="text-slate-600" />
                                <span className="text-xs font-semibold text-slate-500 uppercase">Bukti Foto</span>
                            </div>
                            {pengeluaran.urlBuktiFoto ? (
                                <div className="space-y-2">
                                    <img
                                        src={pengeluaran.urlBuktiFoto}
                                        alt="Bukti pengeluaran"
                                        className="max-h-48 rounded border border-slate-300"
                                    />
                                    <a
                                        href={pengeluaran.urlBuktiFoto}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        <ExternalLink size={12} />
                                        Buka di tab baru
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Tidak ada bukti foto</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm bg-slate-800 text-white font-semibold hover:bg-slate-900 rounded"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
