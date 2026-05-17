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

export type Store = {
  id: string;
  organizationId: string;
  name: string;
  platform: Platform;
};

export type Alert = {
  id: string;
  organizationId: string;
  channel: AlertChannel;
  severity: DecisionStatus;
  title: string;
  message: string;
  isRead: boolean;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  owner: string;
  plan: string;
  stores: number;
  usagePercent: number;
};

export type PlanSummary = {
  id: string;
  name: string;
  price: number;
  stores: number;
  decisions: number;
};

export type OrgMember = {
  id: string;
  profileId: string;
  fullName: string;
  email: string;
  role: UserRole;
};
