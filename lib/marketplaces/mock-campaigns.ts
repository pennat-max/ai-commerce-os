import type { DiscoveredCampaign } from "@/lib/marketplaces/types";
import type { Platform, Product } from "@/types/domain";

function weekKey(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

/** Simulates marketplace promo discovery until live APIs are connected. */
export function mockDiscoverCampaigns(platform: Platform, products: Product[]): DiscoveredCampaign[] {
  const bucket = weekKey();
  const today = new Date().toISOString().slice(0, 10);
  const end = new Date();
  end.setDate(end.getDate() + 7);

  return products
    .filter((product) => product.platform === platform)
    .map((product) => {
      const discountRate = 0.04 + (product.adsCost > 20 ? 0.02 : 0);
      const campaignDiscount = Math.round(product.sellingPrice * discountRate);
      const shopVoucher = Math.round(product.sellingPrice * 0.02);

      return {
        externalId: `${platform}:${product.sku}:${bucket}`,
        productId: product.id,
        name: `[สแกนอัตโนมัติ] ${platform.toUpperCase()} · ${product.name}`,
        campaignDiscount,
        shopVoucher,
        coinsCashback: Math.round(product.sellingPrice * 0.01),
        shippingSubsidy: Math.min(Math.round(product.shippingCost), 20),
        startsAt: today,
        endsAt: end.toISOString().slice(0, 10),
      };
    });
}
