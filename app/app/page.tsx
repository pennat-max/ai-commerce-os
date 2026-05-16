import { AlertTriangle, ArrowUpRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { AppShell, RiskCallout, StorePill } from "@/components/app-shell";
import { QuickActions } from "@/components/quick-actions";
import { campaigns, products } from "@/lib/mock-data";
import { calculateProfit, formatBaht } from "@/lib/profit";

const salesBars = [30, 42, 36, 58, 48, 65, 52, 76, 68, 92, 74, 86];
const profitLine = "M4 78 C 18 70, 22 52, 34 61 S 52 88, 62 55 S 82 28, 94 43 S 112 80, 124 44 S 148 30, 156 36";
const salesLine = "M4 82 C 20 78, 26 88, 38 75 S 58 70, 70 78 S 92 52, 106 58 S 132 46, 156 54";

function MiniChart() {
  return (
    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
      <div className="grid grid-cols-12 items-end gap-1">
        {salesBars.map((height, index) => (
          <span
            key={index}
            className="rounded-t bg-emerald-300"
            style={{ height: `${height * 0.42}px` }}
          />
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
        <path d="M0 72 L180 72 M0 48 L180 48 M0 24 L180 24" stroke="#eef2f7" strokeWidth="1" />
        <path
          d="M4 88 C18 78 20 48 34 58 S52 82 66 50 S86 20 102 38 S120 60 136 32 S156 18 176 26"
          fill="none"
          stroke="#059669"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M4 88 C18 78 20 48 34 58 S52 82 66 50 S86 20 102 38 S120 60 136 32 S156 18 176 26 L176 96 L4 96 Z"
          fill="#a7f3d0"
          opacity="0.75"
        />
      </svg>
      <div className="flex justify-between text-[10px] font-bold text-slate-400">
        <span>1 พ.ค.</span>
        <span>15 พ.ค.</span>
        <span>30 พ.ค.</span>
      </div>
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
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 ${className}`}
    >
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

export default function SellerDashboardPage() {
  const campaignRows = campaigns.map((campaign) => {
    const product = products.find((item) => item.id === campaign.productId)!;
    const profit = calculateProfit(product, campaign);

    return { campaign, product, profit };
  });

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

  return (
    <AppShell title="ภาพรวมร้านค้า" subtitle="ควบคุมกำไร แคมเปญ และ SKU เสี่ยงแบบ Manual Mode">
      <div className="mb-4 space-y-3">
        <StorePill />
        <RiskCallout />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title="ภาพรวมร้านค้า" className="xl:col-span-2">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            {[
              ["ยอดขาย", "฿125,680", "+8.2%"],
              ["กำไร", "฿28,560", "+14.5%"],
              ["ออเดอร์", "246", "ชิ้น"],
            ].map(([label, value, helper]) => (
              <div
                key={label}
                className="min-w-[7.5rem] shrink-0 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:min-w-0"
              >
                <p className="text-[11px] font-bold text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-black text-slate-900 sm:text-base">{value}</p>
                <p className="text-[11px] font-bold text-emerald-600">{helper}</p>
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
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{campaign.name}</p>
                  <p className="text-xs font-bold text-slate-500">
                    กำไรสุทธิ {formatBaht(profit.netProfit)}
                  </p>
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
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-amber-200"
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
          <p className="text-sm font-bold text-slate-700">กำไรสุทธิ (30 วัน)</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="text-2xl font-black text-slate-950">฿86,250</p>
            <span className="flex items-center gap-1 text-xs font-black text-emerald-600">
              <ArrowUpRight size={14} />
              +12.5%
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
