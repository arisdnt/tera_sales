import {
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Warehouse,
} from "lucide-react";

type KPIData = {
    totalBarangTerkirim: number;
    totalBarangTerjual: number;
    totalStokDiToko: number;
    totalPendapatan: number;
    estimasiAsetDiToko: number;
};

type Props = {
    data: KPIData;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export function KPICards({ data }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
            <KPICard
                title="Barang Terkirim"
                value={formatNumber(data.totalBarangTerkirim)}
                subtitle="Dalam periode ini"
                icon={Package}
                iconColor="text-blue-600"
            />
            <KPICard
                title="Barang Terjual"
                value={formatNumber(data.totalBarangTerjual)}
                subtitle="Dalam periode ini"
                icon={ShoppingCart}
                iconColor="text-green-600"
            />
            <KPICard
                title="Stok di Toko"
                value={formatNumber(data.totalStokDiToko)}
                subtitle="Saat ini (kumulatif)"
                icon={Warehouse}
                iconColor="text-orange-600"
            />
            <KPICard
                title="Total Pendapatan"
                value={formatCurrency(data.totalPendapatan)}
                subtitle="Dalam periode ini"
                icon={DollarSign}
                iconColor="text-green-600"
            />
            <KPICard
                title="Aset di Toko"
                value={formatCurrency(data.estimasiAsetDiToko)}
                subtitle="Estimasi nilai saat ini"
                icon={TrendingUp}
                iconColor="text-purple-600"
            />
        </div>
    );
}

function KPICard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    iconColor: string;
}) {
    return (
        <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{title}</span>
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
    );
}
