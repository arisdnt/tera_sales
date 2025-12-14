import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Trash2, X, ShieldAlert, Calculator, CheckCircle, XCircle } from "lucide-react";

type Props = {
    title: string;
    message: string;
    itemName: string;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
};

function generateCaptcha(): { num1: number; num2: number; answer: number } {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
    return { num1, num2, answer: num1 + num2 };
}

export function ConfirmDeleteModal({ title, message, itemName, onConfirm, onCancel }: Props) {
    const [deleting, setDeleting] = useState(false);
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState(false);
    const [captcha, setCaptcha] = useState(() => generateCaptcha());

    // Reset captcha on mount
    useEffect(() => {
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
        setCaptchaError(false);
    }, []);

    const isCaptchaCorrect = useMemo(() => {
        const userAnswer = parseInt(captchaInput, 10);
        return !isNaN(userAnswer) && userAnswer === captcha.answer;
    }, [captchaInput, captcha.answer]);

    const handleConfirm = async () => {
        // Strict validation: captcha must be correct
        if (!isCaptchaCorrect) {
            setCaptchaError(true);
            return;
        }

        setDeleting(true);
        try {
            await onConfirm();
        } catch (err) {
            console.error("Delete failed:", err);
            // Generate new captcha on error
            setCaptcha(generateCaptcha());
            setCaptchaInput("");
            setCaptchaError(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleCaptchaChange = (value: string) => {
        // Only allow numbers
        const numericValue = value.replace(/\D/g, "");
        setCaptchaInput(numericValue);
        setCaptchaError(false);
    };

    const handleRefreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setCaptchaInput("");
        setCaptchaError(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md bg-white shadow-2xl border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-red-600 bg-red-600 px-4 h-10">
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
                    {/* Warning Message */}
                    <div className="flex items-start gap-4 mb-5">
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

                    {/* Security Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert size={16} className="text-amber-600" />
                            <span className="text-xs font-semibold text-amber-800 uppercase">Konfirmasi Keamanan</span>
                        </div>
                        <p className="text-xs text-amber-700">
                            Data yang dihapus <strong>tidak dapat dikembalikan</strong>. Selesaikan perhitungan di bawah untuk konfirmasi.
                        </p>
                    </div>

                    {/* Captcha */}
                    <div className={`border rounded-lg p-4 ${captchaError ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Calculator size={16} className="text-slate-600" />
                            <span className="text-xs font-semibold text-slate-700 uppercase">Verifikasi Manusia</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Captcha Question */}
                            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded px-3 py-2">
                                <span className="text-lg font-mono font-bold text-slate-800">{captcha.num1}</span>
                                <span className="text-lg font-mono text-slate-600">+</span>
                                <span className="text-lg font-mono font-bold text-slate-800">{captcha.num2}</span>
                                <span className="text-lg font-mono text-slate-600">=</span>
                            </div>

                            {/* Answer Input */}
                            <input
                                type="text"
                                value={captchaInput}
                                onChange={(e) => handleCaptchaChange(e.target.value)}
                                placeholder="?"
                                maxLength={2}
                                className={`w-14 h-10 text-center text-lg font-mono font-bold border rounded outline-none transition-colors ${captchaError
                                        ? "border-red-400 bg-red-50 text-red-600 focus:border-red-500"
                                        : isCaptchaCorrect && captchaInput
                                            ? "border-green-400 bg-green-50 text-green-600"
                                            : "border-slate-300 focus:border-blue-500"
                                    }`}
                                disabled={deleting}
                                autoFocus
                            />

                            {/* Status Icon */}
                            {captchaInput && (
                                isCaptchaCorrect ? (
                                    <CheckCircle size={20} className="text-green-500" />
                                ) : (
                                    <XCircle size={20} className="text-red-400" />
                                )
                            )}

                            {/* Refresh Button */}
                            <button
                                type="button"
                                onClick={handleRefreshCaptcha}
                                className="text-xs text-slate-500 hover:text-slate-700 underline"
                                disabled={deleting}
                            >
                                Ganti
                            </button>
                        </div>

                        {/* Error Message */}
                        {captchaError && (
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <XCircle size={12} />
                                Jawaban salah. Silakan coba lagi.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                        {isCaptchaCorrect ? (
                            <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} />
                                Verifikasi berhasil
                            </span>
                        ) : (
                            <span>Selesaikan captcha untuk melanjutkan</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-1.5 text-sm border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors rounded"
                            disabled={deleting}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={deleting || !isCaptchaCorrect}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                        >
                            <Trash2 size={14} />
                            {deleting ? "Menghapus..." : "Hapus Permanen"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
