import type { Platform, Product } from "@/types/domain";

export type MarketplaceCredentials = {
  platform: Platform;
  partnerId?: string;
  shopId?: string;
  accessToken?: string;
};

export type SyncProductInput = {
  externalSku: string;
  name: string;
  price: number;
  stock: number;
};

export type DiscoveredCampaign = {
  externalId: string;
  productId: string;
  name: string;
  campaignDiscount: number;
  shopVoucher: number;
  coinsCashback: number;
  shippingSubsidy: number;
  startsAt: string;
  endsAt: string;
};

export type ScanCampaignsResult = {
  platform: Platform;
  ok: boolean;
  mode: "live" | "mock";
  discovered: number;
  message: string;
};

export type SyncResult = {
  platform: Platform;
  ok: boolean;
  mode: "live" | "mock";
  synced: number;
  message: string;
};

export interface MarketplaceAdapter {
  platform: Platform;
  syncProducts(credentials: MarketplaceCredentials, items: SyncProductInput[]): Promise<SyncResult>;
  scanCampaigns(
    credentials: MarketplaceCredentials,
    products: Product[],
  ): Promise<ScanCampaignsResult & { campaigns: DiscoveredCampaign[] }>;
  getConnectionStatus(credentials: MarketplaceCredentials): Promise<{ connected: boolean; label: string }>;
}
