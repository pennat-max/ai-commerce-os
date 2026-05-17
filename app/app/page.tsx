import { AlertTriangle, ArrowUpRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { AppShell, RiskCallout, StorePill } from "@/components/app-shell";
import { QuickActions } from "@/components/quick-actions";
import { listCampaigns, listProducts } from "@/lib/repositories";
import { calculateProfit, formatBaht } from "@/lib/profit";

const salesBars = [30, 42, 36, 58, 48, 65, 52, 76, 68, 92, 74, 86];
const profitLine = "M4 78 C 18 70, 22 52, 34 61 S 52 88, 62 55 S 82 28, 94 43 S 112 80, 124 44 S 148 30, 156 36";
const salesLine = "M4 82 C 20 78, 26 88, 38 75 S 58 70, 70 78 S 92 52, 106 58 S 132 46, 156 54";

function MiniChart() {
  return (
    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
      <div className="grid grid-cols-12 items-end gap-1">
        {salesBars.map((height, index) => (
          <span key={index} className="rounded-t bg-emerald-300" style={{ height: `${height * 0.42}px` }} />
        ))}
      </div>
      <svg className="mt-2 h-10 w-full" viewBox="0 0 160 90" aria-hidden="true">
        <path d={salesLine} fill="none" stroke="#86efac" strokeWidth="4" strokeLinecap="round" />
        <path d={profitLine} fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ProfitChart() {
  return (
    <div className="mt-3 rounded-xl bg-slate-50 p-2">
      <svg className="h-20 w-full sm:h-24" viewBox="0 0 180 100" aria-hidden="true">
        <path d="M0 95 L0 18 L180 18" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        <path
          d="M4 88 C18 78 20 48 34 58 S52 82 66 50 S86 20 102 38 S120 60 136 32 S156 18 176 26"
          fill="none"
          stroke="#059669"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function DashboardCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 ${className}`}>
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-sky-50/50 px-4 py-3">
        <h2 className="text-base font-black text-slate-900">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function CampaignPill({ recommended }: { recommended: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-black ${
        recommended ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"
      }`}
    >
      {recommended ? "แนะนำ" : "ไม่แนะนำ"}
    </span>
  );
}

export default async function SellerDashboardPage() {
  const [{ data: products }, { data: campaigns, source }] = await Promise.all([
    listProducts(),
    listCampaigns(),
  ]);

  const campaignRows = campaigns.map((campaign) => {
    const product = products.find((item) => item.id === campaign.productId);
    if (!product) return null;
    return { campaign, product, profit: calculateProfit(product, campaign) };
  }).filter((row): row is NonNullable<typeof row> => row !== null);

  const watchProducts = products
    .map((product) => {
      const profit = calculateProfit(product);
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        detail:
          profit.netProfit <= 0
            ? `กำไรสุทธิ ${formatBaht(profit.netProfit)}`
            : product.stock <= 10
              ? `สต็อกเหลือ ${product.stock} ชิ้น`
              : `Margin ${profit.marginPercent.toFixed(1)}%`,
        risky: profit.status !== "GOOD" || product.stock <= 10,
      };
    })
    .filter((item) => item.risky)
    .slice(0, 3);

  const totalProfit = campaignRows.reduce((sum, row) => sum + Math.max(row.profit.netProfit, 0), 0);

  return (
    <AppShell title="ภาพรวมร้านค้า" subtitle={`ควบคุมกำไรและแคมเปญ · ข้อมูลจาก ${source}`}>
      <div className="mb-4 space-y-3">
        <StorePill />
        <RiskCallout />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title="ภาพรวมร้านค้า" className="xl:col-span-2">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {[
              ["SKU", `${products.length}`, "รายการ"],
              ["กำไรแคมเปญ", formatBaht(totalProfit), "ประมาณการ"],
              ["แคมเปญ", `${campaigns.length}`, "รายการ"],
            ].map(([label, value, helper]) => (
              <div key={label as string} className="min-w-[7.5rem] shrink-0 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:min-w-0">
                <p className="text-[11px] font-bold text-slate-500">{label as string}</p>
                <p className="mt-1 text-sm font-black text-slate-900 sm:text-base">{value as string}</p>
                <p className="text-[11px] font-bold text-emerald-600">{helper as string}</p>
              </div>
            ))}
          </div>
          <MiniChart />
        </DashboardCard>

        <DashboardCard title="แคมเปญที่แนะนำ">
          <div className="space-y-3">
            {campaignRows.map(({ campaign, profit }) => (
              <Link
                key={campaign.id}
                href={`/app/campaigns/${campaign.id}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-emerald-200"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{campaign.name}</p>
                  <p className="text-xs font-bold text-slate-500">กำไรสุทธิ {formatBaht(profit.netProfit)}</p>
                </div>
                <CampaignPill recommended={profit.status === "GOOD"} />
              </Link>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="สินค้าที่ต้องเฝ้าระวัง">
          <div className="space-y-3">
            {watchProducts.map((product) => (
              <Link
                key={product.id}
                href={`/app/products/${product.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <ShoppingBag size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900">
                    {product.sku} · {product.name}
                  </p>
                  <p className="text-xs font-bold text-rose-600">{product.detail}</p>
                </div>
                <AlertTriangle className="shrink-0 text-amber-500" size={20} />
              </Link>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="รายงานกำไร">
          <p className="text-sm font-bold text-slate-700">กำไรสุทธิรวม (แคมเปญ)</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="text-2xl font-black text-slate-950">{formatBaht(totalProfit)}</p>
            <span className="flex items-center gap-1 text-xs font-black text-emerald-600">
              <ArrowUpRight size={14} />
              {source}
            </span>
          </div>
          <ProfitChart />
        </DashboardCard>

        <DashboardCard title="สั่งงานด่วน">
          <QuickActions />
        </DashboardCard>
      </div>
    </AppShell>
  );
}

