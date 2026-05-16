import { getAppSession, resolveOrganizationId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { products as mockProducts, stores as mockStores } from "@/lib/mock-data";
import type { Platform, Product } from "@/types/domain";

const useSupabaseData =
  process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase" && isSupabaseConfigured();

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

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

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

export type RepositoryResult<T> = {
  data: T;
  source: "mock" | "supabase";
  error?: string;
};

export async function listProducts(
  organizationId?: string,
): Promise<RepositoryResult<Product[]>> {
  const session = await getAppSession();
  const orgId = resolveOrganizationId(session, organizationId);

  if (!useSupabaseData) {
    const scoped = mockProducts.filter((product) => product.organizationId === orgId);
    return { data: scoped.length > 0 ? scoped : mockProducts, source: "mock" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { data: mockProducts, source: "mock" };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: mockProducts, source: "mock", error: error.message };
  }

  return { data: ((data ?? []) as ProductRow[]).map(mapProduct), source: "supabase" };
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
  if (!supabase) {
    return { data: mockProduct, source: "mock" };
  }

  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (error) {
    return { data: mockProduct, source: "mock", error: error.message };
  }

  if (!data) {
    return { data: null, source: "supabase" };
  }

  const product = mapProduct(data as ProductRow);
  if (session?.role !== "SUPER_ADMIN" && product.organizationId !== orgId) {
    return { data: null, source: "supabase", error: "ไม่มีสิทธิ์เข้าถึง SKU นี้" };
  }

  return { data: product, source: "supabase" };
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
    message: `Connected to Supabase. Products table rows: ${count ?? 0}.`,
  };
}

export function listStores() {
  return mockStores;
}
