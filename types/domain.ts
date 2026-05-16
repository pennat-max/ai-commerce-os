export type UserRole = "SUPER_ADMIN" | "CUSTOMER_OWNER" | "CUSTOMER_STAFF";

export type Platform = "shopee" | "lazada" | "tiktok";

export type DecisionStatus = "GOOD" | "WARNING" | "DANGER";

export type DecisionAction = "approve" | "reject" | "watch";

export type AlertChannel = "line" | "email" | "dashboard";

export type Product = {
  id: string;
  organizationId: string;
  storeId: string;
  sku: string;
  name: string;
  platform: Platform;
  cost: number;
  sellingPrice: number;
  stock: number;
  shippingCost: number;
  platformFeePercent: number;
  adsCost: number;
  affiliateCommissionPercent: number;
  packagingCost: number;
  otherCost: number;
  minProfit: number;
  minMarginPercent: number;
};

export type Campaign = {
  id: string;
  organizationId: string;
  productId: string;
  name: string;
  campaignDiscount: number;
  shopVoucher: number;
  coinsCashback: number;
  shippingSubsidy: number;
  startsAt: string;
  endsAt: string;
};

export type CampaignDecision = {
  id: string;
  campaignId: string;
  productId: string;
  organizationId: string;
  recommendation: DecisionStatus;
  action: DecisionAction;
  note: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  tone: "green" | "yellow" | "red" | "blue";
  helper: string;
};
