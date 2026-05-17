import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { getMarketplaceAdapter, getMarketplaceEnvCredentials } from "@/lib/marketplaces";
import type { DiscoveredCampaign } from "@/lib/marketplaces/types";
import { dispatchNotification } from "@/lib/notifications/dispatch";
import { mapProduct, type ProductRow } from "@/lib/repositories";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Platform, Product } from "@/types/domain";

const PLATFORMS: Platform[] = ["shopee", "lazada", "tiktok"];

export type CampaignScanSummary = {
  organizationId: string;
  imported: number;
  updated: number;
  decisionsUpdated: number;
  alertsCreated: number;
  scannedAt: string;
  platforms: string[];
};

type CampaignRow = {
  id: string;
  product_id: string;
  organization_id: string;
  name: string;
  campaign_discount: number;
  shop_voucher: number;
  coins_cashback: number;
  shipping_subsidy: number;
  starts_at: string;
  ends_at: string;
  source_platform: Platform | null;
  external_campaign_id: string | null;
};

async function upsertDiscoveredCampaign(
  supabase: SupabaseClient,
  organizationId: string,
  platform: Platform,
  discovered: DiscoveredCampaign,
): Promise<"imported" | "updated"> {
  const { data: existing } = await supabase
    .from("campaigns")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("source_platform", platform)
    .eq("external_campaign_id", discovered.externalId)
    .maybeSingle();

  const payload = {
    organization_id: organizationId,
    product_id: discovered.productId,
    name: discovered.name,
    campaign_discount: discovered.campaignDiscount,
    shop_voucher: discovered.shopVoucher,
    coins_cashback: discovered.coinsCashback,
    shipping_subsidy: discovered.shippingSubsidy,
    starts_at: discovered.startsAt,
    ends_at: discovered.endsAt,
    source_platform: platform,
    external_campaign_id: discovered.externalId,
  };

  if (existing?.id) {
    await supabase.from("campaigns").update(payload).eq("id", existing.id);
    return "updated";
  }

  await supabase.from("campaigns").insert(payload);
  return "imported";
}

async function refreshDecisions(
  supabase: SupabaseClient,
  organizationId: string,
  products: Product[],
  campaigns: CampaignRow[],
) {
  let count = 0;

  for (const campaign of campaigns) {
    const product = products.find((item) => item.id === campaign.product_id);
    if (!product) continue;

    const mapped = {
      id: campaign.id,
      organizationId: campaign.organization_id,
      productId: campaign.product_id,
      name: campaign.name,
      campaignDiscount: Number(campaign.campaign_discount),
      shopVoucher: Number(campaign.shop_voucher),
      coinsCashback: Number(campaign.coins_cashback),
      shippingSubsidy: Number(campaign.shipping_subsidy),
      startsAt: campaign.starts_at,
      endsAt: campaign.ends_at,
    };

    const decision = recommendCampaignDecision(product, mapped);
    const profit = decision.profit;

    const { data: existing } = await supabase
      .from("campaign_decisions")
      .select("id, action")
      .eq("campaign_id", campaign.id)
      .maybeSingle();

    const payload = {
      organization_id: organizationId,
      campaign_id: campaign.id,
      product_id: campaign.product_id,
      recommendation: profit.status,
      net_profit: profit.netProfit,
      margin_percent: profit.marginPercent,
      note: decision.reason,
    };

    if (existing?.id) {
      await supabase
        .from("campaign_decisions")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabase.from("campaign_decisions").insert({
        ...payload,
        action: profit.status === "GOOD" ? "approve" : "watch",
      });
    }

    count += 1;
  }

  return count;
}

async function createDangerAlerts(
  supabase: SupabaseClient,
  organizationId: string,
  products: Product[],
  campaigns: CampaignRow[],
) {
  let created = 0;

  for (const campaign of campaigns) {
    const product = products.find((item) => item.id === campaign.product_id);
    if (!product) continue;

    const mapped = {
      id: campaign.id,
      organizationId: campaign.organization_id,
      productId: campaign.product_id,
      name: campaign.name,
      campaignDiscount: Number(campaign.campaign_discount),
      shopVoucher: Number(campaign.shop_voucher),
      coinsCashback: Number(campaign.coins_cashback),
      shippingSubsidy: Number(campaign.shipping_subsidy),
      startsAt: campaign.starts_at,
      endsAt: campaign.ends_at,
    };

    const decision = recommendCampaignDecision(product, mapped);
    if (decision.recommendation !== "DANGER") continue;

    const title = `แคมเปญเสี่ยง: ${campaign.name}`;
    const message = `${product.sku} กำไรสุทธิ ${decision.profit.netProfit.toFixed(2)} บาท — ควรพิจารณาปฏิเสธ`;

    const { data: recent } = await supabase
      .from("alerts")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("title", title)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (recent?.length) continue;

    await supabase.from("alerts").insert({
      organization_id: organizationId,
      channel: "dashboard",
      severity: "DANGER",
      title,
      message,
    });

    await dispatchNotification({
      channel: "line",
      title,
      message,
      organizationId,
    });

    created += 1;
  }

  return created;
}

export async function scanOrganizationCampaigns(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<CampaignScanSummary> {
  const scannedAt = new Date().toISOString();
  let imported = 0;
  let updated = 0;
  const platformMessages: string[] = [];

  const { data: productRows } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", organizationId);

  const products = ((productRows ?? []) as ProductRow[]).map(mapProduct);

  for (const platform of PLATFORMS) {
    const adapter = getMarketplaceAdapter(platform);
    const credentials = getMarketplaceEnvCredentials(platform);
    const result = await adapter.scanCampaigns(credentials, products);
    platformMessages.push(result.message);

    for (const discovered of result.campaigns) {
      const status = await upsertDiscoveredCampaign(supabase, organizationId, platform, discovered);
      if (status === "imported") imported += 1;
      else updated += 1;
    }
  }

  const { data: campaignRows } = await supabase
    .from("campaigns")
    .select("*")
    .eq("organization_id", organizationId);

  const campaigns = (campaignRows ?? []) as CampaignRow[];
  const decisionsUpdated = await refreshDecisions(supabase, organizationId, products, campaigns);
  const alertsCreated = await createDangerAlerts(supabase, organizationId, products, campaigns);

  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    action: "campaign_scan",
    entity_type: "organization",
    entity_id: organizationId,
    metadata: {
      imported,
      updated,
      decisionsUpdated,
      alertsCreated,
      scannedAt,
      platforms: platformMessages,
    },
  });

  return {
    organizationId,
    imported,
    updated,
    decisionsUpdated,
    alertsCreated,
    scannedAt,
    platforms: platformMessages,
  };
}

export async function scanAllOrganizations(supabase: SupabaseClient) {
  const { data: orgs } = await supabase.from("organizations").select("id");
  const summaries: CampaignScanSummary[] = [];

  for (const org of orgs ?? []) {
    summaries.push(await scanOrganizationCampaigns(supabase, org.id as string));
  }

  return summaries;
}

export async function getLastCampaignScan(supabase: SupabaseClient, organizationId: string) {
  const { data } = await supabase
    .from("audit_logs")
    .select("metadata, created_at")
    .eq("organization_id", organizationId)
    .eq("action", "campaign_scan")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const metadata = data.metadata as CampaignScanSummary | null;
  return {
    scannedAt: (metadata?.scannedAt as string | undefined) ?? (data.created_at as string),
    imported: Number(metadata?.imported ?? 0),
    updated: Number(metadata?.updated ?? 0),
    decisionsUpdated: Number(metadata?.decisionsUpdated ?? 0),
    alertsCreated: Number(metadata?.alertsCreated ?? 0),
  };
}
