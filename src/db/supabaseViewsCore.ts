import type { PgBigInt, PgDate, PgNumeric, PgTimestamp } from "./supabaseTables";

export type ViewRowBase = { __id?: number };

export type FetchAttentionNeededRow = ViewRowBase & {
  id_toko: number | null;
  nama_toko: string | null;
  kabupaten: string | null;
  kecamatan: string | null;
  fetch_attempts: number | null;
  fetch_disabled: boolean | null;
  last_fetch_attempt: PgTimestamp | null;
  fetch_error_message: string | null;
  status: string | null;
};

export type FetchStatusSummaryRow = ViewRowBase & {
  total_toko: PgBigInt | null;
  fetched_success: PgBigInt | null;
  eligible_for_fetch: PgBigInt | null;
  fetch_disabled_count: PgBigInt | null;
  max_attempts_reached: PgBigInt | null;
  no_gmaps_link: PgBigInt | null;
  avg_fetch_attempts: PgNumeric | null;
};

export type CashFlowDashboardRow = ViewRowBase & {
  tanggal_laporan: PgDate | null;
  pembayaran_cash_hari_ini: PgNumeric | null;
  jumlah_transaksi_cash: PgBigInt | null;
  pembayaran_transfer_hari_ini: PgNumeric | null;
  jumlah_transaksi_transfer: PgBigInt | null;
  total_pembayaran_hari_ini: PgNumeric | null;
  total_setoran_hari_ini: PgNumeric | null;
  jumlah_setoran_hari_ini: PgBigInt | null;
  semua_penerima_hari_ini: string | null;
  selisih_harian: PgNumeric | null;
  cash_balance_kumulatif: PgNumeric | null;
  status_setoran_harian: string | null;
  status_arus_kas_harian: string | null;
};

export type CashFlowEventsRow = ViewRowBase & {
  transaction_id: number | null;
  event_timestamp: PgTimestamp | null;
  event_type: string | null;
  description: string | null;
  amount: PgNumeric | null;
  nama_toko: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  nama_sales: string | null;
  transaction_date: PgDate | null;
};

export type ChartProdukPerformanceRow = ViewRowBase & {
  nama_produk: string | null;
  harga_satuan: PgNumeric | null;
  tanggal: PgDate | null;
  bulan: number | null;
  barang_terjual: PgBigInt | null;
  nilai_penjualan: PgNumeric | null;
  frekuensi_transaksi: PgBigInt | null;
  rata_rata_per_transaksi: PgNumeric | null;
  total_retur: PgBigInt | null;
};

export type ChartSalesPerformanceRow = ViewRowBase & {
  nama_sales: string | null;
  tanggal: PgDate | null;
  bulan: number | null;
  minggu: number | null;
  total_pendapatan: PgNumeric | null;
  jumlah_transaksi: PgBigInt | null;
  rata_rata_transaksi: PgNumeric | null;
  pendapatan_cash: PgNumeric | null;
  pendapatan_transfer: PgNumeric | null;
};

export type ChartTokoPerformanceRow = ViewRowBase & {
  nama_toko: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  nama_sales: string | null;
  tanggal: PgDate | null;
  total_barang_terbayar: PgBigInt | null;
  nominal_diterima: PgNumeric | null;
  jumlah_transaksi: PgBigInt | null;
  rata_rata_transaksi_toko: PgNumeric | null;
};

export type ChartWilayahPerformanceRow = ViewRowBase & {
  kabupaten: string | null;
  kecamatan: string | null;
  jumlah_toko: PgBigInt | null;
  jumlah_sales: PgBigInt | null;
  tanggal: PgDate | null;
  total_pendapatan_wilayah: PgNumeric | null;
  total_barang_terjual_wilayah: PgBigInt | null;
  total_transaksi_wilayah: PgBigInt | null;
  rata_rata_transaksi_wilayah: PgNumeric | null;
  pendapatan_cash_wilayah: PgNumeric | null;
  pendapatan_transfer_wilayah: PgNumeric | null;
};

export type DashboardOverviewRow = ViewRowBase & {
  tanggal_dashboard: PgDate | null;
  waktu_update: PgTimestamp | null;
  pengiriman_hari_ini: PgBigInt | null;
  penagihan_hari_ini: PgBigInt | null;
  pendapatan_hari_ini: PgNumeric | null;
  setoran_hari_ini: PgNumeric | null;
  selisih_hari_ini: PgNumeric | null;
  pengiriman_bulan_ini: PgBigInt | null;
  penagihan_bulan_ini: PgBigInt | null;
  pendapatan_bulan_ini: PgNumeric | null;
  setoran_bulan_ini: PgNumeric | null;
  selisih_bulan_ini: PgNumeric | null;
  total_pengiriman: PgBigInt | null;
  total_penagihan: PgBigInt | null;
  total_pendapatan: PgNumeric | null;
  total_setoran: PgNumeric | null;
  selisih_keseluruhan: PgNumeric | null;
  total_sales_aktif: PgBigInt | null;
  total_toko_aktif: PgBigInt | null;
  total_produk_aktif: PgBigInt | null;
};

export type DashboardCardsRow = ViewRowBase & {
  card_type: string | null;
  today: PgDate | null;
  this_week_start: PgTimestamp | null;
  this_month_start: PgTimestamp | null;
  last_7_days: PgTimestamp | null;
  last_14_days: PgTimestamp | null;
  last_30_days: PgTimestamp | null;
  total_sales_all_time: PgNumeric | null;
  total_sales_this_month: PgNumeric | null;
  total_sales_this_week: PgNumeric | null;
  total_sales_today: PgNumeric | null;
  total_sales_last_7_days: PgNumeric | null;
  total_sales_last_14_days: PgNumeric | null;
  total_toko_aktif: PgBigInt | null;
  total_toko_transaksi_this_month: PgBigInt | null;
  total_toko_transaksi_this_week: PgBigInt | null;
  total_toko_transaksi_today: PgBigInt | null;
  total_barang_terkirim_all_time: PgBigInt | null;
  total_barang_terkirim_this_month: PgBigInt | null;
  total_barang_terkirim_this_week: PgBigInt | null;
  total_barang_terkirim_today: PgBigInt | null;
  estimasi_nilai_terkirim_all_time: PgNumeric | null;
  estimasi_nilai_terkirim_this_month: PgNumeric | null;
  total_barang_terjual_all_time: PgBigInt | null;
  total_barang_terjual_this_month: PgBigInt | null;
  total_barang_terjual_this_week: PgBigInt | null;
  total_barang_terjual_today: PgBigInt | null;
  total_pendapatan_cash_all_time: PgNumeric | null;
  total_pendapatan_cash_this_month: PgNumeric | null;
  total_pendapatan_transfer_all_time: PgNumeric | null;
  total_pendapatan_transfer_this_month: PgNumeric | null;
  total_setoran_all_time: PgNumeric | null;
  total_setoran_this_month: PgNumeric | null;
  total_setoran_this_week: PgNumeric | null;
  total_setoran_today: PgNumeric | null;
};

export type DashboardLatestTransactionsRow = ViewRowBase & {
  id_penagihan: number | null;
  waktu_transaksi: PgTimestamp | null;
  nama_toko: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  nama_sales: string | null;
  total_uang_diterima: PgNumeric | null;
  metode_pembayaran: string | null;
  ada_potongan: boolean | null;
  jumlah_item_berbeda: PgBigInt | null;
  total_qty_terjual: PgBigInt | null;
  total_qty_kembali: PgBigInt | null;
  net_qty_terjual: PgBigInt | null;
  produk_utama: string | null;
  estimasi_nilai_barang: PgNumeric | null;
  total_potongan: PgNumeric | null;
  alasan_potongan: string | null;
  kategori_waktu: string | null;
  link_detail_transaksi: string | null;
  link_detail_toko: string | null;
  link_detail_sales: string | null;
  transaction_type: string | null;
  timestamp_unix: PgNumeric | null;
  jam_transaksi: string | null;
  tanggal_transaksi_formatted: string | null;
};

export type DashboardAllTransactionsRow = ViewRowBase & {
  id_penagihan: number | null;
  waktu_transaksi: PgTimestamp | null;
  id_toko: number | null;
  nama_toko: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  id_sales: number | null;
  nama_sales: string | null;
  total_uang_diterima: PgNumeric | null;
  metode_pembayaran: string | null;
  ada_potongan: boolean | null;
  jumlah_item_berbeda: PgBigInt | null;
  total_qty_terjual: PgBigInt | null;
  total_qty_kembali: PgBigInt | null;
  net_qty_terjual: PgBigInt | null;
  daftar_produk: string | null;
  produk_utama: string | null;
  estimasi_nilai_barang: PgNumeric | null;
  total_potongan: PgNumeric | null;
  kategori_waktu: string | null;
  link_detail_transaksi: string | null;
  link_detail_toko: string | null;
  link_detail_sales: string | null;
  transaction_type: string | null;
  timestamp_unix: PgNumeric | null;
  tanggal_transaksi: PgDate | null;
  jam_transaksi: string | null;
  tanggal_formatted: string | null;
  tanggal_formatted_long: string | null;
};
