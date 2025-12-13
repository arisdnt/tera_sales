import { Wallet, CreditCard, ArrowUpCircle, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

type SetoranKPIData = {
    totalCashIn: number;
    totalTransferIn: number;
    totalSetoran: number;
    totalPengeluaran: number;
    sisaCash: number;
    countCash: number;
    countTransfer: number;
    countSetoran: number;
};

type Props = {
    data: SetoranKPIData;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

export function SetoranKPICards({ data }: Props) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {/* Cash In */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-green-700">Total Cash Masuk</p>
                        <p className="text-lg font-bold text-green-900">{formatCurrency(data.totalCashIn)}</p>
                        <p className="text-[10px] text-green-600">{data.countCash} transaksi</p>
                    </div>
                    <div className="p-2 bg-green-200 rounded-full">
                        <Wallet className="w-5 h-5 text-green-700" />
                    </div>
                </div>
            </div>

            {/* Transfer In */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-blue-700">Total Transfer Masuk</p>
                        <p className="text-lg font-bold text-blue-900">{formatCurrency(data.totalTransferIn)}</p>
                        <p className="text-[10px] text-blue-600">{data.countTransfer} transaksi</p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-full">
                        <CreditCard className="w-5 h-5 text-blue-700" />
                    </div>
                </div>
            </div>

            {/* Setoran */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-purple-700">Total Setoran</p>
                        <p className="text-lg font-bold text-purple-900">{formatCurrency(data.totalSetoran)}</p>
                        <p className="text-[10px] text-purple-600">{data.countSetoran} setoran</p>
                    </div>
                    <div className="p-2 bg-purple-200 rounded-full">
                        <ArrowUpCircle className="w-5 h-5 text-purple-700" />
                    </div>
                </div>
            </div>

            {/* Pengeluaran */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-red-700">Total Pengeluaran</p>
                        <p className="text-lg font-bold text-red-900">{formatCurrency(data.totalPengeluaran)}</p>
                        <p className="text-[10px] text-red-600">Operasional</p>
                    </div>
                    <div className="p-2 bg-red-200 rounded-full">
                        <TrendingDown className="w-5 h-5 text-red-700" />
                    </div>
                </div>
            </div>

            {/* Sisa Cash */}
            <div className={`bg-gradient-to-br p-3 ${data.sisaCash > 0
                    ? "from-orange-50 to-orange-100 border border-orange-200"
                    : data.sisaCash < 0
                        ? "from-gray-50 to-gray-100 border border-gray-300"
                        : "from-yellow-50 to-yellow-100 border border-yellow-200"
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-xs font-medium ${data.sisaCash > 0 ? "text-orange-700" :
                                data.sisaCash < 0 ? "text-gray-700" : "text-yellow-700"
                            }`}>Sisa Cash di Sales</p>
                        <p className={`text-lg font-bold ${data.sisaCash > 0 ? "text-orange-900" :
                                data.sisaCash < 0 ? "text-gray-900" : "text-yellow-900"
                            }`}>{formatCurrency(Math.abs(data.sisaCash))}</p>
                        <p className={`text-[10px] ${data.sisaCash > 0 ? "text-orange-600" :
                                data.sisaCash < 0 ? "text-red-600" : "text-yellow-600"
                            }`}>
                            {data.sisaCash > 0 ? "Sisa positif" : data.sisaCash < 0 ? "Defisit" : "Seimbang"}
                        </p>
                    </div>
                    <div className={`p-2 rounded-full ${data.sisaCash > 0 ? "bg-orange-200" :
                            data.sisaCash < 0 ? "bg-gray-200" : "bg-yellow-200"
                        }`}>
                        {data.sisaCash > 0 ? (
                            <Wallet className="w-5 h-5 text-orange-700" />
                        ) : data.sisaCash < 0 ? (
                            <AlertCircle className="w-5 h-5 text-gray-700" />
                        ) : (
                            <CheckCircle className="w-5 h-5 text-yellow-700" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { SetoranKPIData };
