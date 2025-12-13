import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/schema";

type ProdukEvent = {
    id: number;
    namaProduk: string;
    hargaSatuan: number;
    statusProduk: boolean;
    isPriority: boolean;
    priorityOrder: number | null;
    totalDikirim: number;
    totalTerjual: number;
    totalDikembalikan: number;
    stokDiToko: number;
    totalDibayar: number;
};

export function useProdukData(statusFilter: string, priorityFilter: string) {
    const produk = useLiveQuery(() => db.produk.toArray(), [], []);
    const detailPengiriman = useLiveQuery(() => db.detail_pengiriman.toArray(), [], []);
    const detailPenagihan = useLiveQuery(() => db.detail_penagihan.toArray(), [], []);

    const events = useMemo<ProdukEvent[]>(() => {
        return (produk || [])
            .filter((p) => {
                if (statusFilter === "true" && !p.status_produk) return false;
                if (statusFilter === "false" && p.status_produk) return false;
                if (priorityFilter === "true" && !p.is_priority) return false;
                if (priorityFilter === "false" && p.is_priority) return false;
                return true;
            })
            .map((p) => {
                // Calculate totals
                const dikirim = (detailPengiriman || [])
                    .filter((d) => d.id_produk === p.id_produk)
                    .reduce((sum, d) => sum + (d.jumlah_kirim || 0), 0);

                const penagihan = (detailPenagihan || []).filter((d) => d.id_produk === p.id_produk);
                const terjual = penagihan.reduce((sum, d) => sum + (d.jumlah_terjual || 0), 0);
                const dikembalikan = penagihan.reduce((sum, d) => sum + (d.jumlah_kembali || 0), 0);

                const stok = dikirim - terjual - dikembalikan;
                const totalDibayar = terjual * Number(p.harga_satuan || 0);

                return {
                    id: p.id_produk,
                    namaProduk: p.nama_produk || "",
                    hargaSatuan: Number(p.harga_satuan || 0),
                    statusProduk: p.status_produk ?? true,
                    isPriority: p.is_priority ?? false,
                    priorityOrder: p.priority_order ?? null,
                    totalDikirim: dikirim,
                    totalTerjual: terjual,
                    totalDikembalikan: dikembalikan,
                    stokDiToko: stok,
                    totalDibayar,
                };
            })
            .sort((a, b) => {
                // Priority first, then by name
                if (a.isPriority && !b.isPriority) return -1;
                if (!a.isPriority && b.isPriority) return 1;
                if (a.priorityOrder !== null && b.priorityOrder !== null) {
                    return a.priorityOrder - b.priorityOrder;
                }
                return a.namaProduk.localeCompare(b.namaProduk);
            });
    }, [produk, detailPengiriman, detailPenagihan, statusFilter, priorityFilter]);

    return { events };
}

export type { ProdukEvent };
