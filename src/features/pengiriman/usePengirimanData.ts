import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type DateRangeKey = "today" | "week" | "month" | "current_month" | "last_month" | "all";

type PengirimanEvent = {
    id: number;
    tanggalKirim: string;
    namaToko: string;
    namaSales: string;
    kabupaten: string;
    kecamatan: string;
    totalQty: number;
    detailPengiriman: string;
    isAutorestock: boolean;
    linkGmaps: string | null;
};

export function usePengirimanData(dateRange: DateRangeKey, salesFilter: string, kabupatenFilter: string, kecamatanFilter: string) {
    const pengirimanDashboard = useLiveQuery(() => db.v_pengiriman_dashboard.toArray(), [], []);

    const dateWindow = useMemo(() => {
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        switch (dateRange) {
            case "today":
                return { start: today, end: today };
            case "week": {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 6);
                return { start: weekAgo.toISOString().split("T")[0], end: today };
            }
            case "month": {
                const monthAgo = new Date(now);
                monthAgo.setDate(monthAgo.getDate() - 29);
                return { start: monthAgo.toISOString().split("T")[0], end: today };
            }
            case "current_month": {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                return { start: firstDay.toISOString().split("T")[0], end: today };
            }
            case "last_month": {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                return { start: lastMonth.toISOString().split("T")[0], end: lastDayOfLastMonth.toISOString().split("T")[0] };
            }
            default:
                return { start: "", end: "" };
        }
    }, [dateRange]);

    const events = useMemo<PengirimanEvent[]>(() => {
        const { start, end } = dateWindow;
        return (pengirimanDashboard || [])
            .filter((p) => {
                const date = (p.tanggal_kirim || "").toString().split("T")[0];
                if (start && end && (date < start || date > end)) return false;
                if (salesFilter && (p.nama_sales || "").toLowerCase() !== salesFilter.toLowerCase()) return false;
                if (kabupatenFilter && (p.kabupaten || "").toLowerCase() !== kabupatenFilter.toLowerCase()) return false;
                if (kecamatanFilter && (p.kecamatan || "").toLowerCase() !== kecamatanFilter.toLowerCase()) return false;
                return true;
            })
            .map((p) => ({
                id: p.id_pengiriman || 0,
                tanggalKirim: (p.tanggal_kirim || "").toString().split("T")[0],
                namaToko: p.nama_toko || "",
                namaSales: p.nama_sales || "",
                kabupaten: p.kabupaten || "",
                kecamatan: p.kecamatan || "",
                totalQty: Number(p.total_quantity || 0),
                detailPengiriman: p.detail_pengiriman || "",
                isAutorestock: false,
                linkGmaps: p.link_gmaps || null,
            }))
            .sort((a, b) => b.tanggalKirim.localeCompare(a.tanggalKirim));
    }, [pengirimanDashboard, dateWindow, salesFilter, kabupatenFilter, kecamatanFilter]);

    // Get filter options
    const salesOptions = useMemo(() => {
        const set = new Set<string>();
        (pengirimanDashboard || []).forEach((p) => {
            if (p.nama_sales) set.add(p.nama_sales);
        });
        return Array.from(set).sort();
    }, [pengirimanDashboard]);

    const kabupatenOptions = useMemo(() => {
        const set = new Set<string>();
        (pengirimanDashboard || []).forEach((p) => {
            if (p.kabupaten) set.add(p.kabupaten);
        });
        return Array.from(set).sort();
    }, [pengirimanDashboard]);

    const kecamatanOptions = useMemo(() => {
        const set = new Set<string>();
        (pengirimanDashboard || []).forEach((p) => {
            if (kabupatenFilter && (p.kabupaten || "").toLowerCase() !== kabupatenFilter.toLowerCase()) return;
            if (p.kecamatan) set.add(p.kecamatan);
        });
        return Array.from(set).sort();
    }, [pengirimanDashboard, kabupatenFilter]);

    const totalQty = useMemo(() => events.reduce((sum, e) => sum + e.totalQty, 0), [events]);

    return { events, totalQty, salesOptions, kabupatenOptions, kecamatanOptions };
}

export type { DateRangeKey, PengirimanEvent };
