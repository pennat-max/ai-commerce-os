import type { MarketplaceAdapter, MarketplaceCredentials, SyncProductInput, SyncResult } from "@/lib/marketplaces/types";

export const tiktokAdapter: MarketplaceAdapter = {
  platform: "tiktok",

  async getConnectionStatus(credentials) {
    const live = Boolean(credentials.accessToken && credentials.shopId);
    return {
      connected: live,
      label: live ? "TikTok Shop API พร้อม" : "รอ TIKTOK_ACCESS_TOKEN / TIKTOK_SHOP_ID",
    };
  },

  async syncProducts(_credentials, items): Promise<SyncResult> {
    return {
      platform: "tiktok",
      ok: true,
      mode: "mock",
      synced: items.length,
      message: `Mock sync ${items.length} SKU ไป TikTok Shop`,
    };
  },
};
