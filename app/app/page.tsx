import { AlertTriangle, ArrowUpRight, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { QuickActions } from "@/components/quick-actions";
import { campaigns, products } from "@/lib/mock-data";
import { calculateProfit, formatBaht } from "@/lib/profit";

const salesBars = [30, 42, 36, 58, 48, 65, 52, 76, 68, 92, 74, 86];
const profitLine = "M4 78 C 18 70, 22 52, 34 61 S 52 88, 62 55 S 82 28, 94 43 S 112 80, 124 44 S 148 30, 156 36";
const salesLine = "M4 82 C 20 78, 26 88, 38 75 S 58 70, 70 78 S 92 52, 106 58 S 132 46, 156 54";

function MiniChart() {
  return (
    <div className="mt-3 rounded-xl border border-sky-100 bg-white p-2">
      <div className="grid grid-cols-12 items-end gap-1">
        {salesBars.map((height, index) => (
          <span
            key={index}
            className="rounded-t bg-sky-200"
            style={{ height: `${height * 0.42}px` }}
          />
        ))}
      </div>
      <svg className="mt-2 h-10 w-full" viewBox="0 0 160 90" aria-hidden="true">
        <path d={salesLine} fill="none" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" />
        <path d={profitLine} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ProfitChart() {
  return (
    <div className="mt-3 rounded-xl bg-white p-2">
      <svg className="h-24 w-full" viewBox="0 0 180 100" aria-hidden="true">
        <path d="M0 95 L0 18 L180 18" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        <path d="M0 72 L180 72 M0 48 L180 48 M0 24 L180 24" stroke="#eef2f7" strokeWidth="1" />
        <path
          d="M4 88 C18 78 20 48 34 58 S52 82 66 50 S86 20 102 38 S120 60 136 32 S156 18 176 26"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M4 88 C18 78 20 48 34 58 S52 82 66 50 S86 20 102 38 S120 60 136 32 S156 18 176 26 L176 96 L4 96 Z"
          fill="#bfdbfe"
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-[250px] rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white shadow-sm">
      <div className="border-b border-sky-100 px-4 py-3 text-center">
        <h2 className="text-base font-black text-slate-900">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function CampaignPill({ recommended }: { recommended: boolean }) {
  return (
    <span
      className={`rounded-lg px-3 py-2 text-xs font-black ${
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

  const watchProducts = [
    { sku: "A123", name: "สินค้าในช่องทาง 1", detail: "กำไรสุทธิ -12 บาท" },
    { sku: "B456", name: "สินค้าในช่องทาง 2", detail: "กำไรสุทธิ 8 บาท" },
    { sku: "C789", name: "สินค้าในช่องทาง 3", detail: "สต็อกเหลือ 2 ชิ้น" },
  ];

  return (
    <AppShell title="ภาพรวมร้านค้า" subtitle="หน้าควบคุมกำไร แคมเปญ และ SKU เสี่ยงแบบ Manual Mode">
      <div className="grid gap-3 xl:grid-cols-5">
        <DashboardCard title="ภาพรวมร้านค้า">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["ยอดขาย", "฿125,680", "+8.2%"],
              ["กำไร", "฿28,560", "+14.5%"],
              ["ออเดอร์", "246", "ชิ้น"],
            ].map(([label, value, helper]) => (
              <div key={label} className="rounded-lg border border-sky-100 bg-white p-2">
                <p className="text-[10px] font-bold text-slate-400">{label}</p>
                <p className="mt-1 text-xs font-black text-slate-900">{value}</p>
                <p className="text-[10px] font-bold text-emerald-600">{helper}</p>
              </div>
            ))}
          </div>
          <MiniChart />
          <ul className="mt-3 space-y-1.5 text-sm font-bold text-slate-800">
            <li>• ยอดขายวันนี้</li>
            <li>• กำไรสุทธิ</li>
            <li>• ออเดอร์ทั้งหมด</li>
            <li>• สินค้าขายดี</li>
          </ul>
        </DashboardCard>

        <DashboardCard title="แคมเปญที่แนะนำ">
          <div className="space-y-3">
            {campaignRows.map(({ campaign, profit }) => (
              <div key={campaign.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{campaign.name}</p>
                  <p className="text-xs font-bold text-slate-500">
                    กำไรสุทธิ {formatBaht(profit.netProfit)}
                  </p>
                </div>
                <CampaignPill recommended={profit.status === "GOOD"} />
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="สินค้าที่ต้องเฝ้าระวัง">
          <div className="space-y-3">
            {watchProducts.map((product) => (
              <div key={product.sku} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-950 text-white">
                  <ShoppingBag size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900">
                    {product.sku} {product.name}
                  </p>
                  <p className="text-xs font-bold text-rose-600">{product.detail}</p>
                </div>
                <AlertTriangle className="shrink-0 text-amber-500" size={20} />
              </div>
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
