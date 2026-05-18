import { mockDiscoverCampaigns } from "@/lib/marketplaces/mock-campaigns";
import type {
  MarketplaceAdapter,
  SyncResult,
} from "@/lib/marketplaces/types";
import type { Product } from "@/types/domain";

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

  async scanCampaigns(_credentials, products: Product[]) {
    const campaigns = mockDiscoverCampaigns("tiktok", products);
    return {
      platform: "tiktok",
      ok: true,
      mode: "mock" as const,
      discovered: campaigns.length,
      message: `Mock scan พบ ${campaigns.length} แคมเปญ TikTok`,
      campaigns,
    };
  },
};
