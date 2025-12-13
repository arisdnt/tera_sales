import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type DateRangeKey = "today" | "week" | "month" | "current_month" | "last_month" | "all";

type PengeluaranEvent = {
    id: number;
    tanggal: string;
    keterangan: string;
    jumlah: number;
    urlBuktiFoto: string | null;
};

export function usePengeluaranData(dateRange: DateRangeKey) {
    const pengeluaran = useLiveQuery(() => db.pengeluaran_operasional.toArray(), [], []);

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

    const events = useMemo<PengeluaranEvent[]>(() => {
        const { start, end } = dateWindow;
        return (pengeluaran || [])
            .filter((p) => {
                const date = p.tanggal_pengeluaran?.split("T")[0] || "";
                if (start && end && (date < start || date > end)) return false;
                return true;
            })
            .map((p) => ({
                id: p.id_pengeluaran,
                tanggal: p.tanggal_pengeluaran?.split("T")[0] || "",
                keterangan: p.keterangan || "",
                jumlah: Number(p.jumlah || 0),
                urlBuktiFoto: p.url_bukti_foto || null,
            }))
            .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    }, [pengeluaran, dateWindow]);

    const totalPengeluaran = useMemo(() => events.reduce((sum, e) => sum + e.jumlah, 0), [events]);

    return { events, totalPengeluaran };
}

export type { DateRangeKey, PengeluaranEvent };
