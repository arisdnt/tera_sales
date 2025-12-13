export type SupabaseTableName =
  | "sales"
  | "produk"
  | "toko"
  | "pengiriman"
  | "detail_pengiriman"
  | "penagihan"
  | "detail_penagihan"
  | "potongan_penagihan"
  | "setoran"
  | "system_logs"
  | "public_toko"
  | "pengeluaran_operasional"
  | "v_setoran_dashboard_backup_data"
  | "v_setoran_dashboard_backup_safe";

export type SupabaseViewName =
  | "fetch_attention_needed"
  | "fetch_status_summary"
  | "v_cash_flow_dashboard"
  | "v_cash_flow_events"
  | "v_chart_produk_performance"
  | "v_chart_sales_performance"
  | "v_chart_toko_performance"
  | "v_chart_wilayah_performance"
  | "v_dashboard_all_transactions"
  | "v_dashboard_cards"
  | "v_dashboard_latest_transactions"
  | "v_dashboard_overview"
  | "v_kabupaten_options"
  | "v_kecamatan_options"
  | "v_master_produk"
  | "v_master_sales"
  | "v_master_toko"
  | "v_penagihan_dashboard"
  | "v_pengiriman_dashboard"
  | "v_produk_options"
  | "v_rekonsiliasi_setoran"
  | "v_sales_options"
  | "v_setoran_dashboard"
  | "v_setoran_dashboard_fixed"
  | "v_toko_options";

export type SupabaseRelationName = SupabaseTableName | SupabaseViewName;

export type PrimaryKeyInfo = {
  name: SupabaseTableName;
  pkField?: string;
};

export const supabaseTables: PrimaryKeyInfo[] = [
  { name: "sales", pkField: "id_sales" },
  { name: "produk", pkField: "id_produk" },
  { name: "toko", pkField: "id_toko" },
  { name: "pengiriman", pkField: "id_pengiriman" },
  { name: "detail_pengiriman", pkField: "id_detail_kirim" },
  { name: "penagihan", pkField: "id_penagihan" },
  { name: "detail_penagihan", pkField: "id_detail_tagih" },
  { name: "potongan_penagihan", pkField: "id_potongan" },
  { name: "setoran", pkField: "id_setoran" },
  { name: "system_logs", pkField: "id" },
  { name: "public_toko", pkField: "id_toko" },
  { name: "pengeluaran_operasional", pkField: "id_pengeluaran" },
  { name: "v_setoran_dashboard_backup_data" },
  { name: "v_setoran_dashboard_backup_safe" },
];

export const supabaseViews: SupabaseViewName[] = [
  "fetch_attention_needed",
  "fetch_status_summary",
  "v_cash_flow_dashboard",
  "v_cash_flow_events",
  "v_chart_produk_performance",
  "v_chart_sales_performance",
  "v_chart_toko_performance",
  "v_chart_wilayah_performance",
  "v_dashboard_all_transactions",
  "v_dashboard_cards",
  "v_dashboard_latest_transactions",
  "v_dashboard_overview",
  "v_kabupaten_options",
  "v_kecamatan_options",
  "v_master_produk",
  "v_master_sales",
  "v_master_toko",
  "v_penagihan_dashboard",
  "v_pengiriman_dashboard",
  "v_produk_options",
  "v_rekonsiliasi_setoran",
  "v_sales_options",
  "v_setoran_dashboard",
  "v_setoran_dashboard_fixed",
  "v_toko_options",
];
