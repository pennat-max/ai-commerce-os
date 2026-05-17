import Link from "next/link";
import { CheckCircle2, LockKeyhole, Megaphone, Plus, ShieldAlert } from "lucide-react";
import { AppShell, ModeSwitch } from "@/components/app-shell";
import { CampaignScanPanel } from "@/components/campaign-scan-panel";
import { CampaignDecisionList } from "@/components/campaign-decision-list";
import { KpiCard, PremiumChip, PremiumIntro, PremiumSection } from "@/components/premium-mobile";
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
  const sourceLabel = source === "supabase" ? "ข้อมูลร้านล่าสุด" : "ข้อมูลตัวอย่างพร้อมทดลอง";

  return (
    <AppShell title="ตัดสินใจแคมเปญ" subtitle={`เช็กกำไรก่อนสมัครโปรโมชัน · ${sourceLabel}`}>
      <div className="grid gap-5">
        <PremiumIntro
          eyebrow="คิวแคมเปญ"
          title={`${decisions.length} แคมเปญรอเจ้าของร้านตัดสินใจ`}
          description="ระบบช่วยคำนวณกำไรก่อนสมัครโปรโมชัน คุณเลือกอนุมัติ เฝ้าดู หรือปฏิเสธเอง"
          icon={Megaphone}
          tone="emerald"
        >
          <div className="flex flex-wrap gap-2">
            <PremiumChip tone="emerald">{sourceLabel}</PremiumChip>
            <PremiumChip tone="violet">กดอนุมัติเอง</PremiumChip>
          </div>
        </PremiumIntro>

        <CampaignScanPanel lastScan={lastScan} />

        <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard label="รออนุมัติ" value={`${decisions.length}`} helper="เจ้าของร้านกดเอง" icon={LockKeyhole} tone="violet" />
            <KpiCard label="น่าเข้าร่วม" value={`${goodCount}`} helper="ผ่านเกณฑ์กำไร" icon={CheckCircle2} tone="emerald" />
            <KpiCard label="ควรหยุดก่อน" value={`${dangerCount}`} helper="เสี่ยงกำไรหาย" icon={ShieldAlert} tone="rose" />
          </div>
          <ModeSwitch />
        </div>

        <PremiumSection
          title="คิวตัดสินใจแคมเปญ"
          helper="ไม่มีการส่งคำสั่งจริง จนกว่าคุณจะเชื่อมต่อระบบในเฟสถัดไป"
          action={
            <Link
              href="/app/campaigns/new"
              className="flex min-h-12 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
            >
              <Plus size={17} />
              + แคมเปญ
            </Link>
          }
        >
          <CampaignDecisionList campaigns={campaigns} products={products} />
        </PremiumSection>
      </div>
    </AppShell>
  );
}
