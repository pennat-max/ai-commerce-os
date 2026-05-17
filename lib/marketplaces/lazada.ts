import { mockDiscoverCampaigns } from "@/lib/marketplaces/mock-campaigns";
import type {
  MarketplaceAdapter,
  MarketplaceCredentials,
  SyncProductInput,
  SyncResult,
} from "@/lib/marketplaces/types";
import type { Product } from "@/types/domain";

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

  async scanCampaigns(_credentials, products: Product[]) {
    const campaigns = mockDiscoverCampaigns("lazada", products);
    return {
      platform: "lazada",
      ok: true,
      mode: "mock" as const,
      discovered: campaigns.length,
      message: `Mock scan พบ ${campaigns.length} แคมเปญ Lazada`,
      campaigns,
    };
  },
};
