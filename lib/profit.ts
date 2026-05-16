import type { Campaign, DecisionStatus, Product } from "@/types/domain";

export type ProfitBreakdown = {
  platformFee: number;
  affiliateCommission: number;
  netProfit: number;
  marginPercent: number;
  status: DecisionStatus;
};

export function calculateProfit(product: Product, campaign?: Campaign): ProfitBreakdown {
  const campaignDiscount = campaign?.campaignDiscount ?? 0;
  const shopVoucher = campaign?.shopVoucher ?? 0;
  const coinsCashback = campaign?.coinsCashback ?? 0;
  const shippingSubsidy = campaign?.shippingSubsidy ?? 0;
  const platformFee = product.sellingPrice * (product.platformFeePercent / 100);
  const affiliateCommission =
    product.sellingPrice * (product.affiliateCommissionPercent / 100);

  const netProfit =
    product.sellingPrice -
    product.cost -
    platformFee -
    campaignDiscount -
    shopVoucher -
    coinsCashback -
    product.adsCost -
    affiliateCommission -
    shippingSubsidy -
    product.packagingCost -
    product.otherCost;

  const marginPercent = product.sellingPrice === 0 ? 0 : (netProfit / product.sellingPrice) * 100;

  let status: DecisionStatus = "GOOD";
  if (netProfit <= 0) {
    status = "DANGER";
  } else if (netProfit < product.minProfit || marginPercent < product.minMarginPercent) {
    status = "WARNING";
  }

  return {
    platformFee,
    affiliateCommission,
    netProfit,
    marginPercent,
    status,
  };
}

export function formatBaht(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
