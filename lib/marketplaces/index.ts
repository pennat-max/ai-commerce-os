import { lazadaAdapter } from "@/lib/marketplaces/lazada";
import { shopeeAdapter } from "@/lib/marketplaces/shopee";
import { tiktokAdapter } from "@/lib/marketplaces/tiktok";
import type { MarketplaceAdapter } from "@/lib/marketplaces/types";
import type { Platform } from "@/types/domain";

const adapters: Record<Platform, MarketplaceAdapter> = {
  shopee: shopeeAdapter,
  lazada: lazadaAdapter,
  tiktok: tiktokAdapter,
};

export function getMarketplaceAdapter(platform: Platform) {
  return adapters[platform];
}

export function getMarketplaceEnvCredentials(platform: Platform) {
  if (platform === "shopee") {
    return {
      platform,
      partnerId: process.env.SHOPEE_PARTNER_ID,
      shopId: process.env.SHOPEE_SHOP_ID,
      accessToken: process.env.SHOPEE_ACCESS_TOKEN,
    };
  }
  if (platform === "lazada") {
    return { platform, accessToken: process.env.LAZADA_ACCESS_TOKEN };
  }
  return {
    platform,
    shopId: process.env.TIKTOK_SHOP_ID,
    accessToken: process.env.TIKTOK_ACCESS_TOKEN,
  };
}
