import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CampaignApprovalButtons } from "@/components/campaign-approval-buttons";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { CampaignProfitAdvisor } from "@/components/campaign-profit-advisor";
import { ProfitBreakdown } from "@/components/profit-breakdown";
import { StatusBadge } from "@/components/status";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { getCampaignById, getProductById } from "@/lib/repositories";
import { formatBaht } from "@/lib/profit";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: campaign, source } = await getCampaignById(id);
  if (!campaign) notFound();

  const { data: product } = await getProductById(campaign.productId);
  if (!product) notFound();

  const decision = recommendCampaignDecision(product, campaign);

  return (
    <AppShell title="รายละเอียดแคมเปญ" subtitle={`ดูผลกระทบก่อนอนุมัติ · ${source}`}>
      <div className="mb-4">
        <Link
          href="/app/campaigns"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-100 bg-white px-3 text-sm font-black text-slate-700 shadow-sm"
        >
          <ArrowLeft size={16} />
          กลับไปแคมเปญ
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <CommerceCard title="โปรไฟล์แคมเปญ">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">{campaign.name}</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {product.sku} · {product.name}
              </p>
            </div>
            <StatusBadge status={decision.recommendation} />
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl bg-sky-50 p-4">
            <CalendarDays className="shrink-0 text-blue-700" size={22} />
            <div>
              <p className="text-sm font-black text-slate-900">
                {campaign.startsAt} ถึง {campaign.endsAt}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">อนุมัติแบบ Manual Mode เท่านั้น</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <StatBox label="ส่วนลดแคมเปญ" value={formatBaht(campaign.campaignDiscount)} />
            <StatBox label="Voucher ร้าน" value={formatBaht(campaign.shopVoucher)} />
            <StatBox label="Coins / Cashback" value={formatBaht(campaign.coinsCashback)} />
            <StatBox label="ส่วนลดค่าส่ง" value={formatBaht(campaign.shippingSubsidy)} />
          </div>
        </CommerceCard>

        <div className="grid gap-4">
          <ProfitBreakdown product={product} campaign={campaign} />

          <CampaignProfitAdvisor product={product} campaign={campaign} />

          <CommerceCard title="คำแนะนำการอนุมัติ">
            <CampaignApprovalButtons campaignId={campaign.id} />
          </CommerceCard>
        </div>
      </div>
    </AppShell>
  );
}
