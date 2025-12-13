import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";
import type { SetoranKPIData } from "./SetoranKPICards";

type DateRangeKey = "today" | "week" | "month" | "current_month" | "last_month" | "all";

type CashFlowEvent = {
    id: number;
    type: "CASH_IN" | "TRANSFER_IN" | "SETORAN";
    date: string;
    dateTime: string;
    amount: number;
    description: string;
    tokoName: string;
    salesName: string;
    kecamatan: string;
    penerimaSetoran?: string;
    cashOnHand: number;
    transactionCategory: string;
};

export function useSetoranData(dateRange: DateRangeKey) {
    const penagihan = useLiveQuery(() => db.penagihan.toArray(), [], []);
    const setoran = useLiveQuery(() => db.setoran.toArray(), [], []);
    const pengeluaran = useLiveQuery(() => db.pengeluaran_operasional.toArray(), [], []);
    const toko = useLiveQuery(() => db.toko.toArray(), [], []);
    const sales = useLiveQuery(() => db.sales.toArray(), [], []);

    // Calculate date range
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

    // Build all events with running balance calculation
    const allEvents = useMemo(() => {
        const items: Array<{ type: "CASH_IN" | "TRANSFER_IN" | "SETORAN"; date: string; dateTime: string; amount: number; tokoId?: number; setoranId?: number; penagihanId?: number; penerima?: string }> = [];

        // Add payments
        penagihan?.forEach((p) => {
            items.push({
                type: p.metode_pembayaran === "Transfer" ? "TRANSFER_IN" : "CASH_IN",
                date: p.dibuat_pada?.split("T")[0] || "",
                dateTime: p.dibuat_pada || "",
                amount: Number(p.total_uang_diterima || 0),
                tokoId: p.id_toko,
                penagihanId: p.id_penagihan,
            });
        });

        // Add setoran (cash out)
        setoran?.forEach((s) => {
            items.push({
                type: "SETORAN",
                date: s.dibuat_pada?.split("T")[0] || "",
                dateTime: s.dibuat_pada || "",
                amount: Number(s.total_setoran || 0),
                setoranId: s.id_setoran,
                penerima: s.penerima_setoran,
            });
        });

        // Sort by date ascending for running balance
        items.sort((a, b) => a.dateTime.localeCompare(b.dateTime));

        // Calculate running balance (cash only)
        let runningCash = 0;
        const pengeluaranTotal = pengeluaran?.reduce((sum, p) => sum + Number(p.jumlah || 0), 0) || 0;

        return items.map((item) => {
            if (item.type === "CASH_IN") runningCash += item.amount;
            else if (item.type === "SETORAN") runningCash -= item.amount;

            const tokoItem = item.tokoId ? toko?.find((t) => t.id_toko === item.tokoId) : null;
            const salesItem = tokoItem ? sales?.find((s) => s.id_sales === tokoItem.id_sales) : null;

            return { ...item, runningCash: runningCash - pengeluaranTotal, tokoItem, salesItem };
        });
    }, [penagihan, setoran, pengeluaran, toko, sales]);

    // Filter by date range and build final events
    const events = useMemo<CashFlowEvent[]>(() => {
        const { start, end } = dateWindow;

        return allEvents
            .filter((item) => {
                if (start && end && (item.date < start || item.date > end)) return false;
                return true;
            })
            .map((item) => ({
                id: item.setoranId || item.penagihanId || 0,
                type: item.type,
                date: item.date,
                dateTime: item.dateTime,
                amount: item.amount,
                description: item.type === "SETORAN"
                    ? `Setoran ke ${item.penerima}`
                    : `Pembayaran ${item.type === "TRANSFER_IN" ? "transfer" : "cash"} dari ${item.tokoItem?.nama_toko || "N/A"}`,
                tokoName: item.tokoItem?.nama_toko || (item.type === "SETORAN" ? "-" : "N/A"),
                salesName: item.salesItem?.nama_sales || "-",
                kecamatan: item.tokoItem?.kecamatan || "-",
                penerimaSetoran: item.penerima,
                cashOnHand: item.runningCash,
                transactionCategory: "Pembayaran",
            }))
            .sort((a, b) => b.dateTime.localeCompare(a.dateTime));
    }, [allEvents, dateWindow]);

    // Calculate KPIs
    const kpis = useMemo<SetoranKPIData>(() => {
        const cashEvents = events.filter((e) => e.type === "CASH_IN");
        const transferEvents = events.filter((e) => e.type === "TRANSFER_IN");
        const setoranEvents = events.filter((e) => e.type === "SETORAN");

        const totalCashIn = cashEvents.reduce((sum, e) => sum + e.amount, 0);
        const totalTransferIn = transferEvents.reduce((sum, e) => sum + e.amount, 0);
        const totalSetoran = setoranEvents.reduce((sum, e) => sum + e.amount, 0);

        const { start, end } = dateWindow;
        const filteredPengeluaran = pengeluaran?.filter((p) => {
            const date = p.tanggal_pengeluaran?.split("T")[0] || "";
            if (start && end && (date < start || date > end)) return false;
            return true;
        }) || [];
        const totalPengeluaran = filteredPengeluaran.reduce((sum, p) => sum + Number(p.jumlah || 0), 0);

        const sisaCash = totalCashIn - totalSetoran - totalPengeluaran;

        return {
            totalCashIn,
            totalTransferIn,
            totalSetoran,
            totalPengeluaran,
            sisaCash,
            countCash: cashEvents.length,
            countTransfer: transferEvents.length,
            countSetoran: setoranEvents.length,
        };
    }, [events, pengeluaran, dateWindow]);

    return { events, kpis };
}

export type { DateRangeKey, CashFlowEvent };
