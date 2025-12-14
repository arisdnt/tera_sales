import { AlertTriangle, X, Info, CheckCircle, XCircle } from "lucide-react";

type ModalType = "warning" | "error" | "info" | "success";

type Props = {
    type?: ModalType;
    title: string;
    message: string;
    details?: string[];
    suggestion?: string;
    onClose: () => void;
};

const typeConfig: Record<ModalType, { icon: typeof AlertTriangle; bgHeader: string; bgIcon: string; textIcon: string }> = {
    warning: {
        icon: AlertTriangle,
        bgHeader: "bg-amber-500 border-amber-600",
        bgIcon: "bg-amber-100",
        textIcon: "text-amber-600",
    },
    error: {
        icon: XCircle,
        bgHeader: "bg-red-600 border-red-700",
        bgIcon: "bg-red-100",
        textIcon: "text-red-600",
    },
    info: {
        icon: Info,
        bgHeader: "bg-blue-600 border-blue-700",
        bgIcon: "bg-blue-100",
        textIcon: "text-blue-600",
    },
    success: {
        icon: CheckCircle,
        bgHeader: "bg-green-600 border-green-700",
        bgIcon: "bg-green-100",
        textIcon: "text-green-600",
    },
};

export function ValidationModal({ type = "warning", title, message, details, suggestion, onClose }: Props) {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${config.bgHeader} px-4 h-10`}>
                    <div className="flex items-center gap-2">
                        <Icon size={16} className="text-white" />
                        <h2 className="text-sm font-bold text-white">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgIcon} flex items-center justify-center`}>
                            <Icon size={24} className={config.textIcon} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 mb-3">{message}</p>

                            {/* Details List */}
                            {details && details.length > 0 && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                                    <ul className="space-y-1">
                                        {details.map((detail, index) => (
                                            <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Suggestion */}
                            {suggestion && (
                                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-800">{suggestion}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors rounded"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
}
