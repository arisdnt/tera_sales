import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type SalesEvent = {
    id: number;
    namaSales: string;
    nomorTelepon: string | null;
    statusAktif: boolean;
    totalStores: number;
    quantityShipped: number;
    quantitySold: number;
    remainingStock: number;
    totalRevenue: number;
};

export function useSalesData(statusFilter: string, teleponFilter: string) {
    const sales = useLiveQuery(() => db.sales.toArray(), [], []);
    const toko = useLiveQuery(() => db.toko.toArray(), [], []);
    const pengiriman = useLiveQuery(() => db.pengiriman.toArray(), [], []);
    const detailPengiriman = useLiveQuery(() => db.detail_pengiriman.toArray(), [], []);
    const penagihan = useLiveQuery(() => db.penagihan.toArray(), [], []);
    const detailPenagihan = useLiveQuery(() => db.detail_penagihan.toArray(), [], []);
    const produk = useLiveQuery(() => db.produk.toArray(), [], []);

    const produkHarga = useMemo(() => {
        const map = new Map<number, number>();
        (produk || []).forEach((p) => map.set(p.id_produk, Number(p.harga_satuan || 0)));
        return map;
    }, [produk]);

    // Map toko to sales
    const tokoSalesMap = useMemo(() => {
        const map = new Map<number, number[]>(); // salesId -> tokoIds
        (toko || []).forEach((t) => {
            if (t.id_sales) {
                const arr = map.get(t.id_sales) || [];
                arr.push(t.id_toko);
                map.set(t.id_sales, arr);
            }
        });
        return map;
    }, [toko]);

    const events = useMemo<SalesEvent[]>(() => {
        return (sales || [])
            .filter((s) => {
                if (statusFilter === "true" && !s.status_aktif) return false;
                if (statusFilter === "false" && s.status_aktif) return false;
                if (teleponFilter === "true" && !s.nomor_telepon) return false;
                if (teleponFilter === "false" && s.nomor_telepon) return false;
                return true;
            })
            .map((s) => {
                const tokoIds = tokoSalesMap.get(s.id_sales) || [];
                const totalStores = tokoIds.length;

                // Get pengiriman for sales' tokos
                const pIds = (pengiriman || [])
                    .filter((p) => tokoIds.includes(p.id_toko ?? 0))
                    .map((p) => p.id_pengiriman);
                const shipped = (detailPengiriman || [])
                    .filter((d) => pIds.includes(d.id_pengiriman))
                    .reduce((sum, d) => sum + (d.jumlah_kirim || 0), 0);

                // Get penagihan for sales' tokos
                const nIds = (penagihan || [])
                    .filter((p) => tokoIds.includes(p.id_toko ?? 0))
                    .map((p) => p.id_penagihan);
                const penagihanItems = (detailPenagihan || []).filter((d) => nIds.includes(d.id_penagihan));
                const sold = penagihanItems.reduce((sum, d) => sum + (d.jumlah_terjual || 0), 0);
                const returned = penagihanItems.reduce((sum, d) => sum + (d.jumlah_kembali || 0), 0);

                const remaining = shipped - sold - returned;
                const revenue = penagihanItems.reduce((sum, d) => {
                    const harga = produkHarga.get(d.id_produk) || 0;
                    return sum + (d.jumlah_terjual || 0) * harga;
                }, 0);

                return {
                    id: s.id_sales,
                    namaSales: s.nama_sales || "",
                    nomorTelepon: s.nomor_telepon || null,
                    statusAktif: s.status_aktif ?? true,
                    totalStores,
                    quantityShipped: shipped,
                    quantitySold: sold,
                    remainingStock: remaining,
                    totalRevenue: revenue,
                };
            })
            .sort((a, b) => a.namaSales.localeCompare(b.namaSales));
    }, [sales, tokoSalesMap, produkHarga, pengiriman, detailPengiriman, penagihan, detailPenagihan, statusFilter, teleponFilter]);

    return { events };
}

export type { SalesEvent };
