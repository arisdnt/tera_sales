import type { PgBigInt, PgDate, PgNumeric, PgTimestamp } from "./supabaseTables";
import type { ViewRowBase } from "./supabaseViewsCore";

export type KabupatenOptionsRow = ViewRowBase & { kabupaten: string | null };
export type KecamatanOptionsRow = ViewRowBase & {
  kabupaten: string | null;
  kecamatan: string | null;
};

export type MasterProdukRow = ViewRowBase & {
  id_produk: number | null;
  nama_produk: string | null;
  harga_satuan: PgNumeric | null;
  status_produk: boolean | null;
  is_priority: boolean | null;
  priority_order: number | null;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
  total_dikirim: PgBigInt | null;
  total_terjual: PgBigInt | null;
  total_dikembalikan: PgBigInt | null;
  stok_di_toko: PgBigInt | null;
  total_dibayar_cash: PgNumeric | null;
  total_dibayar_transfer: PgNumeric | null;
  total_dibayar: PgNumeric | null;
  nilai_total_dikirim: PgNumeric | null;
  nilai_total_terjual: PgNumeric | null;
  nilai_total_dikembalikan: PgNumeric | null;
};

export type MasterSalesRow = ViewRowBase & {
  id_sales: number | null;
  nama_sales: string | null;
  nomor_telepon: string | null;
  status_aktif: boolean | null;
  dibuat_pada: PgTimestamp | null;
  diperbarui_pada: PgTimestamp | null;
  total_stores: PgBigInt | null;
  total_revenue: PgNumeric | null;
  quantity_shipped: PgNumeric | null;
  quantity_sold: PgNumeric | null;
  detail_shipped: string | null;
  detail_sold: string | null;
};

export type MasterTokoRow = ViewRowBase & {
  id_toko: number | null;
  nama_toko: string | null;
  no_telepon: string | null;
  link_gmaps: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  status_toko: boolean | null;
  dibuat_pada: PgTimestamp | null;
  id_sales: number | null;
  nama_sales: string | null;
  quantity_shipped: PgNumeric | null;
  quantity_sold: PgNumeric | null;
  quantity_returned: PgNumeric | null;
  remaining_stock: PgNumeric | null;
  total_revenue: PgNumeric | null;
  detail_shipped: string | null;
  detail_sold: string | null;
  detail_remaining_stock: string | null;
};

export type PenagihanDashboardRow = ViewRowBase & {
  id_penagihan: number | null;
  dibuat_pada: PgTimestamp | null;
  metode_pembayaran: string | null;
  total_uang_diterima: PgNumeric | null;
  ada_potongan: boolean | null;
  id_toko: number | null;
  nama_toko: string | null;
  nomor_telepon_toko: string | null;
  link_gmaps: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  id_sales: number | null;
  nama_sales: string | null;
  kuantitas_terjual: PgBigInt | null;
  kuantitas_kembali: PgBigInt | null;
  detail_terjual: string | null;
  detail_kembali: string | null;
};

export type PengirimanDashboardRow = ViewRowBase & {
  id_pengiriman: number | null;
  tanggal_kirim: PgDate | null;
  dibuat_pada: PgTimestamp | null;
  id_toko: number | null;
  nama_toko: string | null;
  nomor_telepon_toko: string | null;
  link_gmaps: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  id_sales: number | null;
  nama_sales: string | null;
  nomor_telepon_sales: string | null;
  total_quantity: PgBigInt | null;
  detail_pengiriman: string | null;
};

export type ProdukOptionsRow = ViewRowBase & {
  id_produk: number | null;
  nama_produk: string | null;
  harga_satuan: PgNumeric | null;
  status_produk: boolean | null;
  is_priority: boolean | null;
};

export type RekonsiliasiSetoranRow = ViewRowBase & {
  id_setoran: number | null;
  tanggal_setoran: PgDate | null;
  total_setoran: PgNumeric | null;
  penerima_setoran: string | null;
  total_penagihan_cash: PgNumeric | null;
  selisih: PgNumeric | null;
};

export type SalesOptionsRow = ViewRowBase & {
  id_sales: number | null;
  nama_sales: string | null;
  status_aktif: boolean | null;
};

export type SetoranDashboardRow = ViewRowBase & {
  id_setoran: number | null;
  waktu_setoran: PgTimestamp | null;
  tanggal_setoran: PgDate | null;
  total_setoran: PgNumeric | null;
  penerima_setoran: string | null;
  event_type: string | null;
  description: string | null;
  nama_toko: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  pembayaran_cash_hari_ini: PgNumeric | null;
  pembayaran_transfer_hari_ini: PgNumeric | null;
  total_pembayaran_hari_ini: PgNumeric | null;
  total_setoran_hari_ini: PgNumeric | null;
  cash_balance_kumulatif: PgNumeric | null;
  status_setoran: string | null;
  selisih_cash_setoran: PgNumeric | null;
  transaction_category: string | null;
};

export type TokoOptionsRow = ViewRowBase & {
  id_toko: number | null;
  nama_toko: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  nama_sales: string | null;
  status_toko: boolean | null;
};

