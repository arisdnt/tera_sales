import { db } from "../../db/schema";
import { insertWithSync } from "../../utils/syncOperations";
import type { StoreRow } from "./types";

export async function savePenagihan(
    storeRows: StoreRow[],
    autoRestock: boolean
): Promise<void> {
    const now = new Date().toISOString();

    for (const row of storeRows) {
        // Create penagihan
        const maxPenagihan = await db.penagihan.orderBy("id_penagihan").last();
        const newPenagihanId = (maxPenagihan?.id_penagihan ?? 0) + 1;

        await insertWithSync("penagihan", "id_penagihan", {
            id_penagihan: newPenagihanId,
            id_toko: row.id_toko,
            total_uang_diterima: row.total_uang_diterima,
            metode_pembayaran: row.metode_pembayaran,
            ada_potongan: row.ada_potongan,
            dibuat_pada: row.tanggal_pembayaran + "T00:00:00Z",
            diperbarui_pada: now,
        });

        // Create detail_penagihan for priority products
        for (const [produkIdStr, qty] of Object.entries(row.priority_terjual)) {
            if (qty <= 0) continue;
            const maxDetail = await db.detail_penagihan.orderBy("id_detail_tagih").last();
            await insertWithSync("detail_penagihan", "id_detail_tagih", {
                id_detail_tagih: (maxDetail?.id_detail_tagih ?? 0) + 1,
                id_penagihan: newPenagihanId,
                id_produk: Number(produkIdStr),
                jumlah_terjual: qty,
                jumlah_kembali: 0,
                dibuat_pada: now,
                diperbarui_pada: now,
            });
        }

        // Create detail_penagihan for non-priority products
        for (const item of row.non_priority_items) {
            if (item.id_produk <= 0 || item.jumlah_terjual <= 0) continue;
            const maxDetail = await db.detail_penagihan.orderBy("id_detail_tagih").last();
            await insertWithSync("detail_penagihan", "id_detail_tagih", {
                id_detail_tagih: (maxDetail?.id_detail_tagih ?? 0) + 1,
                id_penagihan: newPenagihanId,
                id_produk: item.id_produk,
                jumlah_terjual: item.jumlah_terjual,
                jumlah_kembali: 0,
                dibuat_pada: now,
                diperbarui_pada: now,
            });
        }

        // Create potongan if applicable
        if (row.ada_potongan && row.jumlah_potongan > 0) {
            const maxPotongan = await db.potongan_penagihan.orderBy("id_potongan").last();
            await insertWithSync("potongan_penagihan", "id_potongan", {
                id_potongan: (maxPotongan?.id_potongan ?? 0) + 1,
                id_penagihan: newPenagihanId,
                jumlah_potongan: row.jumlah_potongan,
                alasan: row.alasan_potongan || null,
                dibuat_pada: now,
                diperbarui_pada: now,
            });
        }

        // Create auto-restock pengiriman if enabled
        if (autoRestock) {
            const soldItems: Array<{ id_produk: number; qty: number }> = [];
            Object.entries(row.priority_terjual).forEach(([id, qty]) => {
                if (qty > 0) soldItems.push({ id_produk: Number(id), qty });
            });
            row.non_priority_items.forEach((item) => {
                if (item.jumlah_terjual > 0)
                    soldItems.push({ id_produk: item.id_produk, qty: item.jumlah_terjual });
            });

            if (soldItems.length > 0) {
                const maxPengiriman = await db.pengiriman.orderBy("id_pengiriman").last();
                const newPengirimanId = (maxPengiriman?.id_pengiriman ?? 0) + 1;

                await insertWithSync("pengiriman", "id_pengiriman", {
                    id_pengiriman: newPengirimanId,
                    id_toko: row.id_toko,
                    tanggal_kirim: row.tanggal_pembayaran,
                    is_autorestock: true,
                    dibuat_pada: now,
                    diperbarui_pada: now,
                });

                for (const item of soldItems) {
                    const maxDetail = await db.detail_pengiriman.orderBy("id_detail_kirim").last();
                    await insertWithSync("detail_pengiriman", "id_detail_kirim", {
                        id_detail_kirim: (maxDetail?.id_detail_kirim ?? 0) + 1,
                        id_pengiriman: newPengirimanId,
                        id_produk: item.id_produk,
                        jumlah_kirim: item.qty,
                        dibuat_pada: now,
                        diperbarui_pada: now,
                    });
                }
            }
        }
    }
}
