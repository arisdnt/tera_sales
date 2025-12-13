import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Users, Store, Package, MapPin } from "lucide-react";

type SalesPerformance = { nama_sales: string; total_pendapatan: number };
type ProdukPerformance = { nama_produk: string; total_terjual: number };
type TokoPerformance = { nama_toko: string; total_pendapatan: number };
type RegionalPerformance = { kabupaten: string; total_pendapatan: number };

type Props = {
    salesData: SalesPerformance[];
    produkData: ProdukPerformance[];
    tokoData: TokoPerformance[];
    regionalData: RegionalPerformance[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

export function PerformanceCharts({
    salesData,
    produkData,
    tokoData,
    regionalData,
}: Props) {
    return (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 mb-6">
            {/* Sales Performance */}
            <ChartCard title="Performa Sales" icon={Users}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nama_sales" angle={-45} textAnchor="end" height={60} fontSize={10} />
                        <YAxis tickFormatter={formatCurrency} fontSize={10} />
                        <Tooltip formatter={(v: number) => [formatCurrency(v), "Pendapatan"]} />
                        <Bar dataKey="total_pendapatan" fill="#0088FE" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Top Products */}
            <ChartCard title="Top 10 Produk" icon={Package}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={produkData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nama_produk" angle={-45} textAnchor="end" height={60} fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip formatter={(v: number) => [v.toLocaleString("id-ID"), "Qty Terjual"]} />
                        <Bar dataKey="total_terjual" fill="#FFBB28" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Top Stores */}
            <ChartCard title="Top 10 Toko" icon={Store}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tokoData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nama_toko" angle={-45} textAnchor="end" height={60} fontSize={10} />
                        <YAxis tickFormatter={formatCurrency} fontSize={10} />
                        <Tooltip formatter={(v: number) => [formatCurrency(v), "Pendapatan"]} />
                        <Bar dataKey="total_pendapatan" fill="#00C49F" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Regional Performance */}
            <ChartCard title="Performa Regional" icon={MapPin}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="kabupaten" angle={-45} textAnchor="end" height={60} fontSize={10} />
                        <YAxis tickFormatter={formatCurrency} fontSize={10} />
                        <Tooltip formatter={(v: number) => [formatCurrency(v), "Pendapatan"]} />
                        <Bar dataKey="total_pendapatan" fill="#FF8042" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
}

function ChartCard({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-[#005461]" />
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="h-[250px]">{children}</div>
        </div>
    );
}

export type { SalesPerformance, ProdukPerformance, TokoPerformance, RegionalPerformance };
