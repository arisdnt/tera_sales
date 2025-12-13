import Dexie, { type Table } from "dexie";
import type {
  DetailPenagihanRow,
  DetailPengirimanRow,
  PengeluaranOperasionalRow,
  PengirimanRow,
  PenagihanRow,
  PotonganPenagihanRow,
  ProdukRow,
  PublicTokoRow,
  SalesRow,
  SetoranDashboardBackupRow,
  SetoranRow,
  SystemLogsRow,
  TokoRow,
} from "./supabaseTables";
import type {
  CashFlowDashboardRow,
  CashFlowEventsRow,
  ChartProdukPerformanceRow,
  ChartSalesPerformanceRow,
  ChartTokoPerformanceRow,
  ChartWilayahPerformanceRow,
  DashboardAllTransactionsRow,
  DashboardCardsRow,
  DashboardLatestTransactionsRow,
  DashboardOverviewRow,
  FetchAttentionNeededRow,
  FetchStatusSummaryRow,
} from "./supabaseViewsCore";
import type {
  KabupatenOptionsRow,
  KecamatanOptionsRow,
  MasterProdukRow,
  MasterSalesRow,
  MasterTokoRow,
  PenagihanDashboardRow,
  PengirimanDashboardRow,
  ProdukOptionsRow,
  RekonsiliasiSetoranRow,
  SalesOptionsRow,
  SetoranDashboardRow,
  TokoOptionsRow,
} from "./supabaseViewsExtras";

export type ActivityStatus = "pending" | "success" | "error";

export type OutboxOperation = "insert" | "update" | "delete" | "upsert";
export type OutboxStatus = "pending" | "processing" | "done" | "error";

export type OutboxItem = {
  id?: number;
  table: string;
  op: OutboxOperation;
  pkField?: string;
  pkValue?: number | string;
  localPk?: number | string;
  payload: Record<string, unknown>;
  status: OutboxStatus;
  attempts: number;
  lastError?: string;
  createdAt: number;
  updatedAt: number;
};

export type IdMapRow = {
  id?: number;
  entity: string;
  localId: number | string;
  remoteId: number | string;
  createdAt: number;
};

export type KvRow = {
  id?: number;
  key: string;
  value: unknown;
  updatedAt: number;
};



class AppDexie extends Dexie {
  sales!: Table<SalesRow, number>;
  produk!: Table<ProdukRow, number>;
  toko!: Table<TokoRow, number>;
  pengiriman!: Table<PengirimanRow, number>;
  detail_pengiriman!: Table<DetailPengirimanRow, number>;
  penagihan!: Table<PenagihanRow, number>;
  detail_penagihan!: Table<DetailPenagihanRow, number>;
  potongan_penagihan!: Table<PotonganPenagihanRow, number>;
  setoran!: Table<SetoranRow, number>;
  system_logs!: Table<SystemLogsRow, number>;
  public_toko!: Table<PublicTokoRow, number>;
  pengeluaran_operasional!: Table<PengeluaranOperasionalRow, number>;

  v_setoran_dashboard_backup_data!: Table<SetoranDashboardBackupRow, number>;
  v_setoran_dashboard_backup_safe!: Table<SetoranDashboardBackupRow, number>;

  fetch_attention_needed!: Table<FetchAttentionNeededRow, number>;
  fetch_status_summary!: Table<FetchStatusSummaryRow, number>;
  v_cash_flow_dashboard!: Table<CashFlowDashboardRow, number>;
  v_cash_flow_events!: Table<CashFlowEventsRow, number>;
  v_chart_produk_performance!: Table<ChartProdukPerformanceRow, number>;
  v_chart_sales_performance!: Table<ChartSalesPerformanceRow, number>;
  v_chart_toko_performance!: Table<ChartTokoPerformanceRow, number>;
  v_chart_wilayah_performance!: Table<ChartWilayahPerformanceRow, number>;
  v_dashboard_all_transactions!: Table<DashboardAllTransactionsRow, number>;
  v_dashboard_cards!: Table<DashboardCardsRow, number>;
  v_dashboard_latest_transactions!: Table<DashboardLatestTransactionsRow, number>;
  v_dashboard_overview!: Table<DashboardOverviewRow, number>;
  v_kabupaten_options!: Table<KabupatenOptionsRow, number>;
  v_kecamatan_options!: Table<KecamatanOptionsRow, number>;
  v_master_produk!: Table<MasterProdukRow, number>;
  v_master_sales!: Table<MasterSalesRow, number>;
  v_master_toko!: Table<MasterTokoRow, number>;
  v_penagihan_dashboard!: Table<PenagihanDashboardRow, number>;
  v_pengiriman_dashboard!: Table<PengirimanDashboardRow, number>;
  v_produk_options!: Table<ProdukOptionsRow, number>;
  v_rekonsiliasi_setoran!: Table<RekonsiliasiSetoranRow, number>;
  v_sales_options!: Table<SalesOptionsRow, number>;
  v_setoran_dashboard!: Table<SetoranDashboardRow, number>;
  v_setoran_dashboard_fixed!: Table<SetoranDashboardRow, number>;
  v_toko_options!: Table<TokoOptionsRow, number>;

  outbox!: Table<OutboxItem, number>;
  id_map!: Table<IdMapRow, number>;
  kv!: Table<KvRow, number>;


  constructor() {
    super("tera_sales");
    this.version(1).stores({
      sales: "id_sales, status_aktif",
      produk: "id_produk, status_produk, is_priority, priority_order",
      toko: "id_toko, id_sales, kabupaten, kecamatan, status_toko",
      pengiriman: "id_pengiriman, id_toko, tanggal_kirim",
      detail_pengiriman: "id_detail_kirim, id_pengiriman, id_produk",
      penagihan: "id_penagihan, id_toko, metode_pembayaran",
      detail_penagihan: "id_detail_tagih, id_penagihan, id_produk",
      potongan_penagihan: "id_potongan, id_penagihan",
      setoran: "id_setoran",
      system_logs: "id, log_type, created_at",
      public_toko: "id_toko, kabupaten, kecamatan, fetch_disabled, alamat_fetched",
      pengeluaran_operasional: "id_pengeluaran, tanggal_pengeluaran",

      v_setoran_dashboard_backup_data: "++__id",
      v_setoran_dashboard_backup_safe: "++__id",

      fetch_attention_needed: "++__id",
      fetch_status_summary: "++__id",
      v_cash_flow_dashboard: "++__id",
      v_cash_flow_events: "++__id",
      v_chart_produk_performance: "++__id",
      v_chart_sales_performance: "++__id",
      v_chart_toko_performance: "++__id",
      v_chart_wilayah_performance: "++__id",
      v_dashboard_all_transactions: "++__id",
      v_dashboard_cards: "++__id",
      v_dashboard_latest_transactions: "++__id",
      v_dashboard_overview: "++__id",
      v_kabupaten_options: "++__id",
      v_kecamatan_options: "++__id",
      v_master_produk: "++__id",
      v_master_sales: "++__id",
      v_master_toko: "++__id",
      v_penagihan_dashboard: "++__id",
      v_pengiriman_dashboard: "++__id",
      v_produk_options: "++__id",
      v_rekonsiliasi_setoran: "++__id",
      v_sales_options: "++__id",
      v_setoran_dashboard: "++__id",
      v_setoran_dashboard_fixed: "++__id",
      v_toko_options: "++__id",

      outbox: "++id, status, createdAt, [status+createdAt], table, op",
      id_map: "++id, [entity+localId], entity, remoteId, createdAt",
      kv: "++id, key, updatedAt",

    });
  }
}

export const db = new AppDexie();
