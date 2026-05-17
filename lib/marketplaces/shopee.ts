import type { MarketplaceAdapter, MarketplaceCredentials, SyncProductInput, SyncResult } from "@/lib/marketplaces/types";

export const shopeeAdapter: MarketplaceAdapter = {
  platform: "shopee",

  async getConnectionStatus(credentials) {
    const live = Boolean(credentials.partnerId && credentials.shopId && credentials.accessToken);
    return {
      connected: live,
      label: live ? "Shopee API พร้อม" : "รอ SHOPEE_PARTNER_ID / SHOPEE_SHOP_ID / SHOPEE_ACCESS_TOKEN",
    };
  },

  async syncProducts(credentials, items): Promise<SyncResult> {
    const live = Boolean(credentials.partnerId && credentials.accessToken);

    if (!live) {
      return {
        platform: "shopee",
        ok: true,
        mode: "mock",
        synced: items.length,
        message: `Mock sync ${items.length} SKU ไป Shopee`,
      };
    }

    // Phase 3: call Shopee Open API v2 product endpoints here.
    return {
      platform: "shopee",
      ok: true,
      mode: "live",
      synced: items.length,
      message: `Synced ${items.length} products (scaffold)`,
    };
  },
};
