import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { AppShell, ModeSwitch } from "@/components/app-shell";
import { CampaignScanPanel } from "@/components/campaign-scan-panel";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { CampaignDecisionList } from "@/components/campaign-decision-list";
import { getLastCampaignScan } from "@/lib/campaigns/scanner";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { getAppSession, resolveOrganizationId } from "@/lib/auth/session";
import { listCampaigns, listProducts } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";

export default async function CampaignsPage() {
  const session = await getAppSession();
  const supabase = await createClient();
  const orgId = resolveOrganizationId(session);
  const lastScan = supabase ? await getLastCampaignScan(supabase, orgId) : null;

  const [{ data: products, source: productSource }, { data: campaigns, source: campaignSource }] =
    await Promise.all([listProducts(), listCampaigns()]);

  const decisions = campaigns.map((campaign) => {
    const product = products.find((item) => item.id === campaign.productId);
    if (!product) return null;
    return { campaign, product, decision: recommendCampaignDecision(product, campaign) };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const dangerCount = decisions.filter((item) => item.decision.recommendation === "DANGER").length;
  const goodCount = decisions.filter((item) => item.decision.recommendation === "GOOD").length;
  const source = productSource === "supabase" ? "supabase" : campaignSource;
  const sourceLabel = source === "supabase" ? "ใช้ข้อมูลร้านจาก Supabase" : "ใช้ข้อมูลเดโมพร้อมทดลอง";

  return (
    <AppShell title="ตัดสินใจแคมเปญ" subtitle={`เช็กกำไรก่อนสมัครโปรโมชัน · ${sourceLabel}`}>
      <div className="mb-4">
        <CampaignScanPanel lastScan={lastScan} />
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-3">
          <StatBox label="รออนุมัติ" value={`${decisions.length}`} helper="เจ้าของร้านกดเอง" />
          <StatBox label="น่าเข้าร่วม" value={`${goodCount}`} helper="ผ่านเกณฑ์กำไร" tone="green" />
          <StatBox label="อันตราย" value={`${dangerCount}`} helper="ควรหยุดก่อน" tone="red" />
        </div>
        <ModeSwitch />
      </div>

      <CommerceCard
        title="คิวตัดสินใจแคมเปญ"
        action={
          <div className="flex gap-2">
            <Link
              href="/app/campaigns/new"
              className="flex min-h-12 items-center rounded-xl bg-emerald-700 px-4 text-sm font-black text-white"
            >
              + แคมเปญ
            </Link>
            <span className="flex min-h-12 items-center gap-2 rounded-xl bg-slate-200 px-4 text-xs font-black text-slate-600">
              <LockKeyhole size={14} />
              ต้องกดเอง
            </span>
          </div>
        }
      >
        <CampaignDecisionList campaigns={campaigns} products={products} />
      </CommerceCard>
    </AppShell>
  );
}
