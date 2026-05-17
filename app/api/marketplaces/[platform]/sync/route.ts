import { NextResponse } from "next/server";
import { getAppSession, resolveOrganizationId } from "@/lib/auth/session";
import { getMarketplaceAdapter, getMarketplaceEnvCredentials } from "@/lib/marketplaces";
import { listProducts } from "@/lib/repositories";
import type { Platform } from "@/types/domain";

const platforms: Platform[] = ["shopee", "lazada", "tiktok"];

export async function POST(
  _request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform: platformParam } = await context.params;
  if (!platforms.includes(platformParam as Platform)) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  }

  const platform = platformParam as Platform;
  const orgId = resolveOrganizationId(session);
  const { data: products } = await listProducts(orgId);

  const adapter = getMarketplaceAdapter(platform);
  const credentials = getMarketplaceEnvCredentials(platform);

  const result = await adapter.syncProducts(
    credentials,
    products.map((product) => ({
      externalSku: product.sku,
      name: product.name,
      price: product.sellingPrice,
      stock: product.stock,
    })),
  );

  return NextResponse.json(result);
}
