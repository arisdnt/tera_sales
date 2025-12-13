export type StoreRow = {
    id_toko: number;
    nama_toko: string;
    kecamatan: string;
    kabupaten: string;
    priority_terjual: Record<number, number>;
    has_non_priority: boolean;
    non_priority_items: Array<{ id_produk: number; jumlah_terjual: number }>;
    metode_pembayaran: "Cash" | "Transfer";
    tanggal_pembayaran: string;
    total_uang_diterima: number;
    ada_potongan: boolean;
    jumlah_potongan: number;
    alasan_potongan: string;
};
