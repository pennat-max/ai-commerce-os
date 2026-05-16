import Link from "next/link";
import { ArrowLeft, CalendarDays, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { ProfitBreakdown } from "@/components/profit-breakdown";
import { StatusBadge } from "@/components/status";
import { campaigns, products } from "@/lib/mock-data";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { formatBaht } from "@/lib/profit";

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ id: campaign.id }));
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaigns.find((item) => item.id === id);
  if (!campaign) notFound();

  const product = products.find((item) => item.id === campaign.productId);
  if (!product) notFound();

  const decision = recommendCampaignDecision(product, campaign);

  return (
    <AppShell title="รายละเอียดแคมเปญ" subtitle="ดูผลกระทบของส่วนลดและค่าใช้จ่ายก่อนอนุมัติ">
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
        <CommerceCard title="Campaign Profile">
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
              <p className="mt-1 text-xs font-bold text-slate-500">Manual Mode approval only</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <StatBox label="Campaign discount" value={formatBaht(campaign.campaignDiscount)} />
            <StatBox label="Shop voucher" value={formatBaht(campaign.shopVoucher)} />
            <StatBox label="Coins cashback" value={formatBaht(campaign.coinsCashback)} />
            <StatBox label="Shipping subsidy" value={formatBaht(campaign.shippingSubsidy)} />
          </div>
        </CommerceCard>

        <div className="grid gap-4">
          <ProfitBreakdown product={product} campaign={campaign} />

          <CommerceCard title="Approval Guidance">
            <div className="grid gap-3 md:grid-cols-3">
              <button className="min-h-12 rounded-lg border border-emerald-200 bg-emerald-500/90 text-sm font-black text-white">
                Approve
              </button>
              <button className="min-h-12 rounded-lg border border-orange-200 bg-orange-400 text-sm font-black text-white">
                Watch
              </button>
              <button className="min-h-12 rounded-lg border border-rose-200 bg-rose-500/90 text-sm font-black text-white">
                Reject
              </button>
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-100 p-4">
              <LockKeyhole className="shrink-0 text-slate-500" size={22} />
              <p className="text-sm font-bold text-slate-600">
                Phase 1 จะไม่ส่งคำสั่งไป Shopee, Lazada หรือ TikTok Shop จริง ปุ่มนี้เป็น mock approval เพื่อยืนยัน workflow เท่านั้น
              </p>
            </div>
          </CommerceCard>
        </div>
      </div>
    </AppShell>
  );
}
