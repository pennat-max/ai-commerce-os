import { getAppSession, resolveOrganizationId } from "@/lib/auth/session";
import { buildDashboardMetrics } from "@/lib/dashboard-metrics";
import {
  alerts as mockAlerts,
  campaigns as mockCampaigns,
  organizations as mockOrganizations,
  plans as mockPlans,
  products as mockProducts,
  stores as mockStores,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  Alert,
  Campaign,
  DashboardMetric,
  OrgMember,
  OrganizationSummary,
  PlanSummary,
  Platform,
  Product,
  Store,
  UserRole,
} from "@/types/domain";

const useSupabaseData =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" && isSupabaseConfigured();

export type RepositoryResult<T> = {
  data: T;
  source: "mock" | "supabase";
  error?: string;
};

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

type ProductRow = {
  id: string;
  organization_id: string;
  store_id: string;
  sku: string;
  name: string;
  platform: Platform;
  cost: number;
  selling_price: number;
  stock: number;
  shipping_cost: number;
  platform_fee_percent: number;
  ads_cost: number;
  affiliate_commission_percent: number;
  packaging_cost: number;
  other_cost: number;
  min_profit: number;
  min_margin_percent: number;
};

type CampaignRow = {
  id: string;
  organization_id: string;
  product_id: string;
  name: string;
  campaign_discount: number;
  shop_voucher: number;
  coins_cashback: number;
  shipping_subsidy: number;
  starts_at: string;
  ends_at: string;
};

type StoreRow = {
  id: string;
  organization_id: string;
  name: string;
  platform: Platform;
};

type AlertRow = {
  id: string;
  organization_id: string;
  channel: Alert["channel"];
  severity: Alert["severity"];
  title: string;
  message: string;
  is_read: boolean;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    organizationId: row.organization_id,
    storeId: row.store_id,
    sku: row.sku,
    name: row.name,
    platform: row.platform,
    cost: toNumber(row.cost),
    sellingPrice: toNumber(row.selling_price),
    stock: toNumber(row.stock),
    shippingCost: toNumber(row.shipping_cost),
    platformFeePercent: toNumber(row.platform_fee_percent),
    adsCost: toNumber(row.ads_cost),
    affiliateCommissionPercent: toNumber(row.affiliate_commission_percent),
    packagingCost: toNumber(row.packaging_cost),
    otherCost: toNumber(row.other_cost),
    minProfit: toNumber(row.min_profit),
    minMarginPercent: toNumber(row.min_margin_percent),
  };
}

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    organizationId: row.organization_id,
    productId: row.product_id,
    name: row.name,
    campaignDiscount: toNumber(row.campaign_discount),
    shopVoucher: toNumber(row.shop_voucher),
    coinsCashback: toNumber(row.coins_cashback),
    shippingSubsidy: toNumber(row.shipping_subsidy),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  };
}

function mapStore(row: StoreRow): Store {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    platform: row.platform,
  };
}

function mapAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    organizationId: row.organization_id,
    channel: row.channel,
    severity: row.severity,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
  };
}

function filterByOrg<T extends { organizationId: string }>(items: T[], orgId: string, isSuperAdmin: boolean) {
  if (isSuperAdmin) return items;
  return items.filter((item) => item.organizationId === orgId);
}

export async function listProducts(organizationId?: string): Promise<RepositoryResult<Product[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);
  const scopedMock = filterByOrg(mockProducts, orgId, session?.role === "SUPER_ADMIN");

  if (!useSupabaseData) {
    return { data: scopedMock.length > 0 ? scopedMock : mockProducts, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) return { data: scopedMock, source: "mock" };

  let query = supabase.from("products").select("*").order("created_at", { ascending: false });
  if (session?.role !== "SUPER_ADMIN") {
    query = query.eq("organization_id", orgId);
  }

  const { data, error } = await query;
  if (error) return { data: scopedMock, source: "mock", error: error.message };
  if (!data?.length) return { data: scopedMock, source: "mock", error: "no_rows" };

  return { data: (data as ProductRow[]).map(mapProduct), source: "supabase" };
}

export async function getProductById(id: string): Promise<RepositoryResult<Product | null>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session);
  const mockProduct = mockProducts.find((product) => product.id === id) ?? null;

  if (!useSupabaseData) {
    if (mockProduct && mockProduct.organizationId !== orgId && session?.role !== "SUPER_ADMIN") {
      return { data: null, source: "mock" };
    }
    return { data: mockProduct, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) return { data: mockProduct, source: "mock" };

  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) return { data: mockProduct, source: "mock", error: error.message };
  if (!data) return { data: null, source: "supabase" };

  const product = mapProduct(data as ProductRow);
  if (session?.role !== "SUPER_ADMIN" && product.organizationId !== orgId) {
    return { data: null, source: "supabase", error: "ไม่มีสิทธิ์เข้าถึง SKU นี้" };
  }

  return { data: product, source: "supabase" };
}

export async function listCampaigns(organizationId?: string): Promise<RepositoryResult<Campaign[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);
  const scopedMock = filterByOrg(mockCampaigns, orgId, session?.role === "SUPER_ADMIN");

  if (!useSupabaseData) {
    return { data: scopedMock.length > 0 ? scopedMock : mockCampaigns, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) return { data: scopedMock, source: "mock" };

  let query = supabase.from("campaigns").select("*").order("starts_at", { ascending: false });
  if (session?.role !== "SUPER_ADMIN") {
    query = query.eq("organization_id", orgId);
  }

  const { data, error } = await query;
  if (error) return { data: scopedMock, source: "mock", error: error.message };
  if (!data?.length) return { data: scopedMock, source: "mock", error: "no_rows" };

  return { data: (data as CampaignRow[]).map(mapCampaign), source: "supabase" };
}

export async function getCampaignById(id: string): Promise<RepositoryResult<Campaign | null>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session);
  const mockCampaign = mockCampaigns.find((campaign) => campaign.id === id) ?? null;

  if (!useSupabaseData) {
    return { data: mockCampaign, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) return { data: mockCampaign, source: "mock" };

  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
  if (error) return { data: mockCampaign, source: "mock", error: error.message };
  if (!data) return { data: null, source: "supabase" };

  const campaign = mapCampaign(data as CampaignRow);
  if (session?.role !== "SUPER_ADMIN" && campaign.organizationId !== orgId) {
    return { data: null, source: "supabase", error: "ไม่มีสิทธิ์เข้าถึงแคมเปญนี้" };
  }

  return { data: campaign, source: "supabase" };
}

export async function listStores(organizationId?: string): Promise<RepositoryResult<Store[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);
  const allMockStores = mockStores as Store[];
  const scopedMock = filterByOrg(allMockStores, orgId, session?.role === "SUPER_ADMIN");

  if (!useSupabaseData) {
    return { data: scopedMock.length > 0 ? scopedMock : allMockStores, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) return { data: scopedMock, source: "mock" };

  let query = supabase.from("stores").select("*").order("name");
  if (session?.role !== "SUPER_ADMIN") {
    query = query.eq("organization_id", orgId);
  }

  const { data, error } = await query;
  if (error) return { data: scopedMock, source: "mock", error: error.message };
  if (!data?.length) return { data: scopedMock, source: "mock", error: "no_rows" };

  return { data: (data as StoreRow[]).map(mapStore), source: "supabase" };
}

export async function listAlerts(organizationId?: string): Promise<RepositoryResult<Alert[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);
  const scopedMock: Alert[] = mockAlerts.map((alert) => ({
    ...alert,
    organizationId: orgId,
    isRead: false,
    channel: alert.channel as Alert["channel"],
    severity: alert.severity as Alert["severity"],
  }));

  if (!useSupabaseData) {
    return { data: scopedMock, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) return { data: scopedMock, source: "mock" };

  let query = supabase.from("alerts").select("*").order("created_at", { ascending: false });
  if (session?.role !== "SUPER_ADMIN") {
    query = query.eq("organization_id", orgId);
  }

  const { data, error } = await query;
  if (error) return { data: scopedMock, source: "mock", error: error.message };
  if (!data?.length) return { data: scopedMock, source: "mock", error: "no_rows" };

  return { data: (data as AlertRow[]).map(mapAlert), source: "supabase" };
}

export async function getDashboardMetricsForOrg(): Promise<RepositoryResult<DashboardMetric[]>> {
  const [{ data: products }, { data: campaigns }] = await Promise.all([
    listProducts(),
    listCampaigns(),
  ]);

  return {
    data: buildDashboardMetrics(products, campaigns),
    source: useSupabaseData ? "supabase" : "mock",
  };
}

export async function listOrganizations(): Promise<RepositoryResult<OrganizationSummary[]>> {
  const mockData: OrganizationSummary[] = mockOrganizations.map((org, index) => ({
    id: org.id,
    name: org.name,
    owner: org.owner,
    plan: org.plan,
    stores: org.stores,
    usagePercent: [72, 44, 86][index] ?? 50,
  }));

  if (!useSupabaseData) return { data: mockData, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { data: mockData, source: "mock" };

  const { data: orgs, error } = await supabase
    .from("organizations")
    .select("id, name, subscriptions(plan_id, plans(name)), stores(id)")
    .order("name");

  if (error || !orgs?.length) return { data: mockData, source: "mock", error: error?.message };

  const summaries: OrganizationSummary[] = orgs.map((org) => {
    const row = org as {
      id: string;
      name: string;
      subscriptions: { plans: { name: string } | { name: string }[] | null }[] | null;
      stores: { id: string }[] | null;
    };
    const subscription = Array.isArray(row.subscriptions) ? row.subscriptions[0] : null;
    const planObj = subscription?.plans;
    const planName = Array.isArray(planObj) ? planObj[0]?.name : planObj?.name;

    return {
      id: row.id,
      name: row.name,
      owner: "—",
      plan: planName ?? "Starter",
      stores: row.stores?.length ?? 0,
      usagePercent: Math.min(95, 30 + (row.stores?.length ?? 0) * 15),
    };
  });

  return { data: summaries, source: "supabase" };
}

export async function listPlans(): Promise<RepositoryResult<PlanSummary[]>> {
  const mockData: PlanSummary[] = mockPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    stores: plan.stores,
    decisions: plan.decisions,
  }));

  if (!useSupabaseData) return { data: mockData, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { data: mockData, source: "mock" };

  const { data, error } = await supabase
    .from("plans")
    .select("id, name, monthly_price, store_limit, decision_limit")
    .order("monthly_price");

  if (error || !data?.length) return { data: mockData, source: "mock", error: error?.message };

  return {
    data: data.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      price: toNumber(row.monthly_price),
      stores: toNumber(row.store_limit),
      decisions: toNumber(row.decision_limit),
    })),
    source: "supabase",
  };
}

export async function listOrganizationMembers(
  organizationId?: string,
): Promise<RepositoryResult<OrgMember[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);

  const fallback: OrgMember[] = [
    {
      id: "1",
      profileId: session?.userId ?? "",
      fullName: session?.fullName ?? "เจ้าของร้าน",
      email: session?.email ?? "",
      role: (session?.role ?? "CUSTOMER_OWNER") as UserRole,
    },
  ];

  if (!useSupabaseData) return { data: fallback, source: "mock" };

  const supabase = await createClient();
  if (!supabase) return { data: fallback, source: "mock" };

  const { data, error } = await supabase
    .from("organization_members")
    .select("id, profile_id, role")
    .eq("organization_id", orgId);

  if (error || !data?.length) return { data: fallback, source: "mock", error: error?.message };

  return {
    data: data.map((row) => ({
      id: row.id as string,
      profileId: row.profile_id as string,
      fullName:
        session && row.profile_id === session.userId
          ? (session.fullName ?? "สมาชิก")
          : `สมาชิก ${(row.profile_id as string).slice(0, 8)}`,
      email: session && row.profile_id === session.userId ? (session.email ?? "") : "",
      role: row.role as UserRole,
    })),
    source: "supabase",
  };
}

export async function updateProductProfitRules(
  productId: string,
  minProfit: number,
  minMarginPercent: number,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAppSession();
  if (!session) return { ok: false, error: "ไม่ได้เข้าสู่ระบบ" };

  if (!useSupabaseData) {
    return { ok: true };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase ไม่พร้อม" };

  const { error } = await supabase
    .from("products")
    .update({ min_profit: minProfit, min_margin_percent: minMarginPercent })
    .eq("id", productId);

  if (error) return { ok: false, error: error.message };

  await supabase
    .from("profit_rules")
    .update({ min_profit: minProfit, min_margin_percent: minMarginPercent })
    .eq("product_id", productId);

  return { ok: true };
}

export async function markAlertRead(alertId: string): Promise<{ ok: boolean; error?: string }> {
  if (!useSupabaseData) return { ok: true };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Supabase ไม่พร้อม" };

  const { error } = await supabase.from("alerts").update({ is_read: true }).eq("id", alertId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getDatabaseStatus() {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      source: "mock" as const,
      message: "Supabase env vars are not configured. App is running with mock data.",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      connected: false,
      source: "mock" as const,
      message: "Supabase client could not be created.",
    };
  }

  const { error, count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  if (error) {
    return {
      connected: false,
      source: "mock" as const,
      message: error.message,
    };
  }

  return {
    connected: true,
    source: "supabase" as const,
    message: `เชื่อมต่อ Supabase แล้ว · products ${count ?? 0} รายการ`,
  };
}
