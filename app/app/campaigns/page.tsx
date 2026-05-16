import { LockKeyhole } from "lucide-react";
import { AppShell, ModeSwitch } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { CampaignDecisionList } from "@/components/campaign-decision-list";
import { campaigns, products } from "@/lib/mock-data";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";

export default function CampaignsPage() {
  const decisions = campaigns.map((campaign) => {
    const product = products.find((item) => item.id === campaign.productId)!;
    return { campaign, product, decision: recommendCampaignDecision(product, campaign) };
  });
  const dangerCount = decisions.filter((item) => item.decision.recommendation === "DANGER").length;
  const goodCount = decisions.filter((item) => item.decision.recommendation === "GOOD").length;

  return (
    <AppShell title="Campaign Decisions" subtitle="อนุมัติ ปฏิเสธ หรือ Watch ก่อนเข้าแคมเปญ">
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 md:grid-cols-3">
          <StatBox label="รอ Manual Approval" value={`${decisions.length}`} helper="Phase 1" />
          <StatBox label="แนะนำให้สมัคร" value={`${goodCount}`} helper="ผ่านเกณฑ์กำไร" tone="green" />
          <StatBox label="อันตราย" value={`${dangerCount}`} helper="ควรหยุดก่อน" tone="red" />
        </div>
        <ModeSwitch />
      </div>

      <CommerceCard
        title="คิวตัดสินใจแคมเปญ"
        action={
          <span className="flex items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-xs font-black text-slate-500">
            <LockKeyhole size={14} />
            Auto Mode locked
          </span>
        }
      >
        <CampaignDecisionList campaigns={campaigns} products={products} />
      </CommerceCard>
    </AppShell>
  );
}
