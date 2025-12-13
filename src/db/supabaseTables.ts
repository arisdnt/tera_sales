export type PgTimestamp = string;
export type PgDate = string;
export type PgNumeric = number | string;
export type PgBigInt = number | string;

export type SalesRow = {
  id_sales: number;
  nama_sales: string;
  nomor_telepon: string | null;
  status_aktif: boolean | null;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
  __local?: boolean;
};

export type ProdukRow = {
  id_produk: number;
  nama_produk: string;
  harga_satuan: PgNumeric;
  status_produk: boolean | null;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
  is_priority: boolean | null;
  priority_order: number | null;
};

export type TokoRow = {
  id_toko: number;
  id_sales: number;
  nama_toko: string;
  kecamatan: string | null;
  kabupaten: string | null;
  link_gmaps: string | null;
  status_toko: boolean | null;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
  no_telepon: string | null;
};

export type PengirimanRow = {
  id_pengiriman: number;
  id_toko: number;
  tanggal_kirim: PgDate;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
  is_autorestock: boolean | null;
};

export type DetailPengirimanRow = {
  id_detail_kirim: number;
  id_pengiriman: number;
  id_produk: number;
  jumlah_kirim: number;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
};

export type PenagihanRow = {
  id_penagihan: number;
  id_toko: number;
  total_uang_diterima: PgNumeric;
  metode_pembayaran: string;
  ada_potongan: boolean | null;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
};

export type DetailPenagihanRow = {
  id_detail_tagih: number;
  id_penagihan: number;
  id_produk: number;
  jumlah_terjual: number;
  jumlah_kembali: number;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
};

export type PotonganPenagihanRow = {
  id_potongan: number;
  id_penagihan: number;
  jumlah_potongan: PgNumeric;
  alasan: string | null;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
};

export type SetoranRow = {
  id_setoran: number;
  total_setoran: PgNumeric;
  penerima_setoran: string;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
};

export type SystemLogsRow = {
  id: number;
  log_type: string;
  message: string;
  created_at: PgTimestamp | null;
};

export type PublicTokoRow = {
  id_toko: number;
  nama_toko: string;
  kabupaten: string | null;
  kecamatan: string | null;
  link_gmaps: string | null;
  latitude: PgNumeric | null;
  longitude: PgNumeric | null;
  alamat_gmaps: string | null;
  alamat_fetched: boolean | null;
  produk_tersedia: unknown | null;
  diperbarui_pada: PgTimestamp | null;
  fetch_attempts: number | null;
  last_fetch_attempt: PgTimestamp | null;
  fetch_disabled: boolean | null;
  fetch_error_message: string | null;
};

export type PengeluaranOperasionalRow = {
  id_pengeluaran: number;
  jumlah: PgNumeric;
  keterangan: string;
  url_bukti_foto: string | null;
  tanggal_pengeluaran: PgTimestamp;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
};

export type SetoranDashboardBackupRow = {
  __id?: number;
  id_setoran: number | null;
  waktu_setoran: PgTimestamp | null;
  tanggal_setoran: PgDate | null;
  total_setoran: PgNumeric | null;
  penerima_setoran: string | null;
  pembayaran_cash_hari_ini: PgNumeric | null;
  pembayaran_transfer_hari_ini: PgNumeric | null;
  total_pembayaran_hari_ini: PgNumeric | null;
  selisih_cash_setoran: PgNumeric | null;
  status_setoran: string | null;
  event_type: string | null;
  description: string | null;
  transaction_category: string | null;
  nama_toko: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  cash_balance_kumulatif: PgNumeric | null;
  jumlah_transaksi_cash: number | null;
  jumlah_transaksi_transfer: number | null;
  status_arus_kas: string | null;
};
