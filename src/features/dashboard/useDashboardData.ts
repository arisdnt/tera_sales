import { useCallback, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import type { Transaction } from "./RecentTransactions";
import type {
    SalesPerformance,
    ProdukPerformance,
    TokoPerformance,
    RegionalPerformance,
} from "./PerformanceCharts";

export type DateRangeKey = "all" | "today" | "7days" | "30days" | "this_month" | "last_month";

export type CustomDateRange = {
    startDate: string | null;
    endDate: string | null;
};

function formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function dateRangeToWindow(dateRange: DateRangeKey): { startDate: string | null; endDate: string | null } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
        case "today": {
            const day = formatDateOnly(today);
            return { startDate: day, endDate: day };
        }
        case "7days": {
            const start = new Date(today);
            start.setDate(start.getDate() - 6);
            return { startDate: formatDateOnly(start), endDate: formatDateOnly(today) };
        }
        case "30days": {
            const start = new Date(today);
            start.setDate(start.getDate() - 29);
            return { startDate: formatDateOnly(start), endDate: formatDateOnly(today) };
        }
        case "this_month": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return { startDate: formatDateOnly(start), endDate: formatDateOnly(end) };
        }
        case "last_month": {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { startDate: formatDateOnly(start), endDate: formatDateOnly(end) };
        }
        case "all":
        default:
            return { startDate: null, endDate: null };
    }
}

export function useDashboardData(dateRange: DateRangeKey, customRange?: CustomDateRange) {
    const pengiriman = useLiveQuery(() => db.pengiriman.toArray(), [], []);
    const detailPengiriman = useLiveQuery(() => db.detail_pengiriman.toArray(), [], []);
    const penagihan = useLiveQuery(() => db.penagihan.toArray(), [], []);
    const detailPenagihan = useLiveQuery(() => db.detail_penagihan.toArray(), [], []);
    const produk = useLiveQuery(() => db.produk.toArray(), [], []);
    const toko = useLiveQuery(() => db.toko.toArray(), [], []);
    const sales = useLiveQuery(() => db.sales.toArray(), [], []);

    // Calculate date range from dateRangeKey and override with custom range if provided
    const presetRange = dateRangeToWindow(dateRange);
    const startDate = customRange?.startDate ?? presetRange.startDate;
    const endDate = customRange?.endDate ?? presetRange.endDate;

    const isWithinRange = useCallback((value?: string | null) => {
        if (!value) return false;
        const dateOnly = value.includes("T") ? value.split("T")[0] : value;
        if (startDate && dateOnly < startDate) return false;
        if (endDate && dateOnly > endDate) return false;
        return true;
    }, [startDate, endDate]);

    // Filter by date range
    const filteredPengiriman = useMemo(() => {
        if (!pengiriman) return [];
        return pengiriman.filter((p) => isWithinRange(p.tanggal_kirim));
    }, [pengiriman, isWithinRange]);

    const filteredPenagihan = useMemo(() => {
        if (!penagihan) return [];
        return penagihan.filter((p) => isWithinRange(p.dibuat_pada));
    }, [penagihan, isWithinRange]);

    // Get options for filters
    const salesOptions = useMemo(() => {
        const set = new Set<string>();
        sales?.forEach((s) => {
            if (s.nama_sales) set.add(s.nama_sales);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [sales]);

    const kabupatenOptions = useMemo(() => {
        const set = new Set<string>();
        toko?.forEach((t) => {
            if (t.kabupaten) set.add(t.kabupaten);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [toko]);

    const kecamatanOptions = useMemo(() => {
        const set = new Set<string>();
        toko?.forEach((t) => {
            if (t.kecamatan) set.add(t.kecamatan);
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [toko]);

    // KPIs
    const kpis = useMemo(() => {
        const pengirimanIds = new Set(filteredPengiriman.map((p) => p.id_pengiriman));
        const penagihanIds = new Set(filteredPenagihan.map((p) => p.id_penagihan));

        const totalBarangTerkirim =
            detailPengiriman?.filter((d) => pengirimanIds.has(d.id_pengiriman))
                .reduce((sum, d) => sum + (d.jumlah_kirim || 0), 0) || 0;

        const totalBarangTerjual =
            detailPenagihan?.filter((d) => penagihanIds.has(d.id_penagihan))
                .reduce((sum, d) => sum + (d.jumlah_terjual || 0), 0) || 0;

        const allTimeKirim = detailPengiriman?.reduce((sum, d) => sum + (d.jumlah_kirim || 0), 0) || 0;
        const allTimeTerjual = detailPenagihan?.reduce((sum, d) => sum + (d.jumlah_terjual || 0), 0) || 0;
        const allTimeKembali = detailPenagihan?.reduce((sum, d) => sum + (d.jumlah_kembali || 0), 0) || 0;
        const totalStokDiToko = Math.max(0, allTimeKirim - allTimeTerjual - allTimeKembali);

        const totalPendapatan = filteredPenagihan.reduce((sum, p) => sum + Number(p.total_uang_diterima || 0), 0);

        const avgPrice = produk && produk.length > 0
            ? produk.reduce((sum, p) => sum + Number(p.harga_satuan || 0), 0) / produk.length : 0;
        const estimasiAsetDiToko = Math.max(0, totalStokDiToko * avgPrice);

        return { totalBarangTerkirim, totalBarangTerjual, totalStokDiToko, totalPendapatan, estimasiAsetDiToko };
    }, [filteredPengiriman, filteredPenagihan, detailPengiriman, detailPenagihan, produk]);

    // Recent transactions
    const recentTransactions = useMemo<Transaction[]>(() => {
        const txs: Transaction[] = [];
        filteredPengiriman.forEach((p) => {
            const tokoItem = toko?.find((t) => t.id_toko === p.id_toko);
            const salesItem = tokoItem ? sales?.find((s) => s.id_sales === tokoItem.id_sales) : null;
            const total = detailPengiriman?.filter((d) => d.id_pengiriman === p.id_pengiriman)
                .reduce((sum, d) => sum + (d.jumlah_kirim || 0), 0) || 0;
            txs.push({
                type: "Pengiriman", id: p.id_pengiriman, date: p.tanggal_kirim || "",
                tokoName: tokoItem?.nama_toko || "-", salesName: salesItem?.nama_sales || "-", value: total
            });
        });
        filteredPenagihan.forEach((p) => {
            const tokoItem = toko?.find((t) => t.id_toko === p.id_toko);
            const salesItem = tokoItem ? sales?.find((s) => s.id_sales === tokoItem.id_sales) : null;
            txs.push({
                type: "Penagihan", id: p.id_penagihan, date: p.dibuat_pada?.split("T")[0] || "",
                tokoName: tokoItem?.nama_toko || "-", salesName: salesItem?.nama_sales || "-",
                value: Number(p.total_uang_diterima || 0)
            });
        });
        return txs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    }, [filteredPengiriman, filteredPenagihan, detailPengiriman, toko, sales]);

    // Performance data
    const salesPerformance = useMemo<SalesPerformance[]>(() => {
        const map = new Map<number, { nama: string; total: number }>();
        filteredPenagihan.forEach((p) => {
            const tokoItem = toko?.find((t) => t.id_toko === p.id_toko);
            const salesItem = tokoItem ? sales?.find((s) => s.id_sales === tokoItem.id_sales) : null;
            if (salesItem) {
                const curr = map.get(salesItem.id_sales) || { nama: salesItem.nama_sales, total: 0 };
                curr.total += Number(p.total_uang_diterima || 0);
                map.set(salesItem.id_sales, curr);
            }
        });
        return Array.from(map.values()).map((v) => ({ nama_sales: v.nama, total_pendapatan: v.total }))
            .sort((a, b) => b.total_pendapatan - a.total_pendapatan);
    }, [filteredPenagihan, toko, sales]);

    const produkPerformance = useMemo<ProdukPerformance[]>(() => {
        const penagihanIds = new Set(filteredPenagihan.map((p) => p.id_penagihan));
        const map = new Map<number, { nama: string; total: number }>();
        detailPenagihan?.filter((d) => penagihanIds.has(d.id_penagihan)).forEach((d) => {
            const p = produk?.find((pr) => pr.id_produk === d.id_produk);
            if (p) {
                const curr = map.get(p.id_produk) || { nama: p.nama_produk, total: 0 };
                curr.total += d.jumlah_terjual || 0;
                map.set(p.id_produk, curr);
            }
        });
        return Array.from(map.values()).map((v) => ({ nama_produk: v.nama, total_terjual: v.total }))
            .sort((a, b) => b.total_terjual - a.total_terjual);
    }, [filteredPenagihan, detailPenagihan, produk]);

    const tokoPerformance = useMemo<TokoPerformance[]>(() => {
        const map = new Map<number, { nama: string; total: number }>();
        filteredPenagihan.forEach((p) => {
            const tokoItem = toko?.find((t) => t.id_toko === p.id_toko);
            if (tokoItem) {
                const curr = map.get(tokoItem.id_toko) || { nama: tokoItem.nama_toko, total: 0 };
                curr.total += Number(p.total_uang_diterima || 0);
                map.set(tokoItem.id_toko, curr);
            }
        });
        return Array.from(map.values()).map((v) => ({ nama_toko: v.nama, total_pendapatan: v.total }))
            .sort((a, b) => b.total_pendapatan - a.total_pendapatan);
    }, [filteredPenagihan, toko]);

    const regionalPerformance = useMemo<RegionalPerformance[]>(() => {
        const map = new Map<string, number>();
        filteredPenagihan.forEach((p) => {
            const tokoItem = toko?.find((t) => t.id_toko === p.id_toko);
            if (tokoItem?.kabupaten) {
                map.set(tokoItem.kabupaten, (map.get(tokoItem.kabupaten) || 0) + Number(p.total_uang_diterima || 0));
            }
        });
        return Array.from(map.entries()).map(([kab, total]) => ({ kabupaten: kab, total_pendapatan: total }))
            .sort((a, b) => b.total_pendapatan - a.total_pendapatan);
    }, [filteredPenagihan, toko]);

    return { kpis, recentTransactions, salesPerformance, produkPerformance, tokoPerformance, regionalPerformance, salesOptions, kabupatenOptions, kecamatanOptions };
}
