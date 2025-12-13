import { Clock, Package, CreditCard } from "lucide-react";

type Transaction = {
    type: "Pengiriman" | "Penagihan";
    id: number;
    date: string;
    tokoName: string;
    salesName: string;
    value: number;
};

type Props = {
    transactions: Transaction[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function RecentTransactions({ transactions }: Props) {
    return (
        <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#005461]" />
                <h2 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h2>
            </div>
            {transactions.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada transaksi dalam periode yang dipilih</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div
                            key={`${tx.type}-${tx.id}`}
                            className="flex items-center justify-between p-3 border border-slate-100 hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                {tx.type === "Pengiriman" ? (
                                    <Package className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={`text-xs px-2 py-0.5 ${tx.type === "Pengiriman"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {tx.type}
                                        </span>
                                        <span className="font-medium text-sm">{tx.tokoName}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {tx.salesName} • {tx.date}
                                    </div>
                                </div>
                            </div>
                            <div className="font-semibold">
                                {tx.type === "Pengiriman"
                                    ? `${formatNumber(tx.value)} pcs`
                                    : formatCurrency(tx.value)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export type { Transaction };
