import type { MarketplaceAdapter, MarketplaceCredentials, SyncProductInput, SyncResult } from "@/lib/marketplaces/types";

export const lazadaAdapter: MarketplaceAdapter = {
  platform: "lazada",

  async getConnectionStatus(credentials) {
    const live = Boolean(credentials.accessToken);
    return {
      connected: live,
      label: live ? "Lazada API พร้อม" : "รอ LAZADA_ACCESS_TOKEN",
    };
  },

  async syncProducts(_credentials, items): Promise<SyncResult> {
    return {
      platform: "lazada",
      ok: true,
      mode: "mock",
      synced: items.length,
      message: `Mock sync ${items.length} SKU ไป Lazada`,
    };
  },
};
