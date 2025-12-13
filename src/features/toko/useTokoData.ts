import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type TokoEvent = {
    id: number;
    idSales: number;
    namaToko: string;
    linkGmaps: string | null;
    kabupaten: string;
    kecamatan: string;
    noTelepon: string | null;
    namaSales: string;
    statusToko: boolean;
    quantityShipped: number;
    quantitySold: number;
    remainingStock: number;
    totalRevenue: number;
};

export function useTokoData(statusFilter: string, salesFilter: string, kabupatenFilter: string, kecamatanFilter: string) {
    const toko = useLiveQuery(() => db.toko.toArray(), [], []);
    const sales = useLiveQuery(() => db.sales.toArray(), [], []);
    const pengiriman = useLiveQuery(() => db.pengiriman.toArray(), [], []);
    const detailPengiriman = useLiveQuery(() => db.detail_pengiriman.toArray(), [], []);
    const penagihan = useLiveQuery(() => db.penagihan.toArray(), [], []);
    const detailPenagihan = useLiveQuery(() => db.detail_penagihan.toArray(), [], []);
    const produk = useLiveQuery(() => db.produk.toArray(), [], []);

    const salesMap = useMemo(() => {
        const map = new Map<number, string>();
        (sales || []).forEach((s) => map.set(s.id_sales, s.nama_sales || ""));
        return map;
    }, [sales]);

    const produkHarga = useMemo(() => {
        const map = new Map<number, number>();
        (produk || []).forEach((p) => map.set(p.id_produk, Number(p.harga_satuan || 0)));
        return map;
    }, [produk]);

    const events = useMemo<TokoEvent[]>(() => {
        return (toko || [])
            .filter((t) => {
                if (statusFilter === "true" && !t.status_toko) return false;
                if (statusFilter === "false" && t.status_toko) return false;
                if (salesFilter && (salesMap.get(t.id_sales ?? 0) || "").toLowerCase() !== salesFilter.toLowerCase()) return false;
                if (kabupatenFilter && (t.kabupaten || "").toLowerCase() !== kabupatenFilter.toLowerCase()) return false;
                if (kecamatanFilter && (t.kecamatan || "").toLowerCase() !== kecamatanFilter.toLowerCase()) return false;
                return true;
            })
            .map((t) => {
                // Get pengiriman ids for this toko
                const pIds = (pengiriman || []).filter((p) => p.id_toko === t.id_toko).map((p) => p.id_pengiriman);
                const shipped = (detailPengiriman || [])
                    .filter((d) => pIds.includes(d.id_pengiriman))
                    .reduce((sum, d) => sum + (d.jumlah_kirim || 0), 0);

                // Get penagihan for this toko
                const nIds = (penagihan || []).filter((p) => p.id_toko === t.id_toko).map((p) => p.id_penagihan);
                const penagihanItems = (detailPenagihan || []).filter((d) => nIds.includes(d.id_penagihan));
                const sold = penagihanItems.reduce((sum, d) => sum + (d.jumlah_terjual || 0), 0);
                const returned = penagihanItems.reduce((sum, d) => sum + (d.jumlah_kembali || 0), 0);

                const remaining = shipped - sold - returned;
                const revenue = penagihanItems.reduce((sum, d) => {
                    const harga = produkHarga.get(d.id_produk) || 0;
                    return sum + (d.jumlah_terjual || 0) * harga;
                }, 0);

                return {
                    id: t.id_toko,
                    idSales: t.id_sales ?? 0,
                    namaToko: t.nama_toko || "",
                    linkGmaps: t.link_gmaps || null,
                    kabupaten: t.kabupaten || "",
                    kecamatan: t.kecamatan || "",
                    noTelepon: t.no_telepon || null,
                    namaSales: salesMap.get(t.id_sales ?? 0) || "-",
                    statusToko: t.status_toko ?? true,
                    quantityShipped: shipped,
                    quantitySold: sold,
                    remainingStock: remaining,
                    totalRevenue: revenue,
                };
            })
            .sort((a, b) => a.namaToko.localeCompare(b.namaToko));
    }, [toko, salesMap, produkHarga, pengiriman, detailPengiriman, penagihan, detailPenagihan, statusFilter, salesFilter, kabupatenFilter, kecamatanFilter]);

    // Get filter options
    const salesOptions = useMemo(() => {
        const set = new Set<string>();
        (toko || []).forEach((t) => {
            const name = salesMap.get(t.id_sales ?? 0);
            if (name) set.add(name);
        });
        return Array.from(set).sort();
    }, [toko, salesMap]);

    const kabupatenOptions = useMemo(() => {
        const set = new Set<string>();
        (toko || []).forEach((t) => { if (t.kabupaten) set.add(t.kabupaten); });
        return Array.from(set).sort();
    }, [toko]);

    const kecamatanOptions = useMemo(() => {
        const set = new Set<string>();
        (toko || []).forEach((t) => {
            if (kabupatenFilter && (t.kabupaten || "").toLowerCase() !== kabupatenFilter.toLowerCase()) return;
            if (t.kecamatan) set.add(t.kecamatan);
        });
        return Array.from(set).sort();
    }, [toko, kabupatenFilter]);

    return { events, salesOptions, kabupatenOptions, kecamatanOptions };
}

export type { TokoEvent };
