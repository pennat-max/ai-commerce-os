import type { Platform } from "@/types/domain";

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
  getConnectionStatus(credentials: MarketplaceCredentials): Promise<{ connected: boolean; label: string }>;
}
