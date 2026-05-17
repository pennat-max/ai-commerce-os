import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  LineChart,
  PackageSearch,
  ShoppingBag,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";
import { listAlerts, listCampaigns, listProducts } from "@/lib/repositories";
import type { DecisionStatus } from "@/types/domain";

type Tone = "green" | "yellow" | "red" | "blue" | "slate";

const toneStyles: Record<Tone, string> = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-800",
  yellow: "border-amber-100 bg-amber-50 text-amber-800",
  red: "border-rose-100 bg-rose-50 text-rose-800",
  blue: "border-sky-100 bg-sky-50 text-sky-800",
  slate: "border-slate-100 bg-slate-50 text-slate-700",
};

const statusTone: Record<DecisionStatus, Tone> = {
  GOOD: "green",
  WARNING: "yellow",
  DANGER: "red",
};

function AssistantCard({
  riskCount,
  urgentCount,
  bestCampaignName,
  dataSource,
}: {
  riskCount: number;
  urgentCount: number;
  bestCampaignName: string;
  dataSource: string;
}) {
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
          <Bot size={26} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-emerald-700">
            AI ผู้ช่วยร้านค้า
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950">
            วันนี้ควรจัดการ {urgentCount} เรื่องก่อน
          </h2>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
            SKU เสี่ยง {riskCount} รายการ และแคมเปญที่น่าดันที่สุดคือ {bestCampaignName}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
          โหมดอนุมัติเอง
        </span>
        <span className="rounded-full border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
          {dataSource}
        </span>
      </div>
    </section>
  );
}

function ProfitSummaryCard({
  todayProfit,
  todaySales,
  averageMargin,
  lowStockCount,
}: {
  todayProfit: number;
  todaySales: number;
  averageMargin: number;
  lowStockCount: number;
}) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-500">กำไรวันนี้</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{formatBaht(todayProfit)}</p>
        </div>
        <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <WalletCards size={24} />
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MetricTile label="ยอดขาย" value={formatBaht(todaySales)} tone="blue" />
        <MetricTile label="มาร์จิน" value={formatPercent(averageMargin)} tone="green" />
        <MetricTile
          label="สต็อกต่ำ"
          value={`${lowStockCount}`}
          tone={lowStockCount > 0 ? "yellow" : "green"}
        />
      </div>
    </section>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-xl border p-3 ${toneStyles[tone]}`}>
      <p className="text-[11px] font-black opacity-80">{label}</p>
      <p className="mt-1 truncate text-sm font-black">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </span>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function UrgentAction({
  title,
  detail,
  href,
  tone,
}: {
  title: string;
  detail: string;
  href: string;
  tone: Tone;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-20 items-center justify-between gap-3 rounded-xl border p-4 ${toneStyles[tone]}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-black">{title}</p>
        <p className="mt-1 text-xs font-bold opacity-80">{detail}</p>
      </div>
      <ArrowRight className="shrink-0" size={20} />
    </Link>
  );
}

function RecommendationItem({
  title,
  detail,
  status,
}: {
  title: string;
  detail: string;
  status: DecisionStatus;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-950">{title}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{detail}</p>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

function QuickActionLink({
  href,
  icon,
  label,
  helper,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  helper: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black">{label}</span>
        <span className="mt-1 block text-xs font-bold text-slate-500">{helper}</span>
      </span>
    </Link>
  );
}

export default async function SellerDashboardPage() {
  const [productsResult, campaignsResult, alertsResult] = await Promise.all([
    listProducts(),
    listCampaigns(),
    listAlerts(),
  ]);

  const products = productsResult.data;
  const campaigns = campaignsResult.data;
  const alerts = alertsResult.data;
  const productById = new Map(products.map((product) => [product.id, product]));
  const campaignRows = campaigns.flatMap((campaign) => {
    const product = productById.get(campaign.productId);
    if (!product) return [];

    const decision = recommendCampaignDecision(product, campaign);
    return [{ campaign, product, decision }];
  });

  const productProfits = products.map((product) => ({ product, profit: calculateProfit(product) }));
  const riskyProducts = productProfits.filter(({ profit }) => profit.status !== "GOOD");
  const lowStockProducts = products.filter((product) => product.stock <= 10);
  const dangerCampaigns = campaignRows.filter(({ decision }) => decision.recommendation === "DANGER");
  const warningCampaigns = campaignRows.filter(({ decision }) => decision.recommendation === "WARNING");
  const goodCampaigns = campaignRows.filter(({ decision }) => decision.recommendation === "GOOD");
  const dangerAlerts = alerts.filter((alert) => alert.severity === "DANGER");

  const todaySales = products.reduce(
    (sum, product) => sum + product.sellingPrice * Math.max(1, Math.min(product.stock, 6)),
    0,
  );
  const todayProfitBase =
    productProfits.reduce((sum, { profit }) => sum + Math.max(profit.netProfit, 0), 0) +
    campaignRows.reduce((sum, { decision }) => sum + Math.max(decision.profit.netProfit, 0), 0);
  const todayProfit = Math.round(todayProfitBase * 4);
  const averageMargin =
    productProfits.length === 0
      ? 0
      : productProfits.reduce((sum, { profit }) => sum + profit.marginPercent, 0) /
        productProfits.length;
  const bestCampaign = goodCampaigns[0] ?? warningCampaigns[0] ?? campaignRows[0];
  const dataSource =
    productsResult.source === "supabase" ||
    campaignsResult.source === "supabase" ||
    alertsResult.source === "supabase"
      ? "ข้อมูลจาก Supabase"
      : "ข้อมูลเดโมร้าน";

  const urgentActions = [
    ...dangerCampaigns.map(({ campaign, product, decision }) => ({
      title: `หยุดก่อน: ${campaign.name}`,
      detail: `${product.sku} คาดกำไร ${formatBaht(decision.profit.netProfit)}`,
      href: `/app/campaigns/${campaign.id}`,
      tone: "red" as const,
    })),
    ...lowStockProducts.map((product) => ({
      title: `เติมสต็อก: ${product.sku}`,
      detail: `${product.name} เหลือ ${product.stock} ชิ้น`,
      href: `/app/products/${product.id}`,
      tone: "yellow" as const,
    })),
    ...dangerAlerts.map((alert) => ({
      title: alert.title,
      detail: alert.message,
      href: "/app/alerts",
      tone: "red" as const,
    })),
  ].slice(0, 4);

  const recommendationFeed = [
    ...goodCampaigns.map(({ campaign, product, decision }) => ({
      title: `อนุมัติได้: ${campaign.name}`,
      detail: `${product.sku} ผ่านเกณฑ์ กำไรประมาณ ${formatBaht(decision.profit.netProfit)}`,
      status: "GOOD" as const,
    })),
    ...warningCampaigns.map(({ campaign, product, decision }) => ({
      title: `เช็กส่วนลดก่อน: ${campaign.name}`,
      detail: `${product.sku} มาร์จิน ${formatPercent(decision.profit.marginPercent)} ต่ำกว่าเป้าบางส่วน`,
      status: "WARNING" as const,
    })),
    ...riskyProducts.map(({ product, profit }) => ({
      title: `ปรับต้นทุนหรือราคา: ${product.sku}`,
      detail: `${product.name} กำไรพื้นฐาน ${formatBaht(profit.netProfit)}`,
      status: profit.status,
    })),
  ].slice(0, 5);

  const dataErrors = [productsResult.error, campaignsResult.error, alertsResult.error].filter(Boolean);

  return (
    <AppShell title="ผู้ช่วย AI ร้านค้า" subtitle="สรุปกำไร ความเสี่ยง และงานที่ควรทำตอนนี้">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <AssistantCard
            riskCount={riskyProducts.length + dangerCampaigns.length}
            urgentCount={urgentActions.length}
            bestCampaignName={bestCampaign?.campaign.name ?? "ยังไม่มีแคมเปญที่ต้องตัดสินใจ"}
            dataSource={dataSource}
          />

          {dataErrors.length > 0 ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-900">
              ใช้ข้อมูลสำรองบางส่วน: {dataErrors.join(" | ")}
            </div>
          ) : null}

          <ProfitSummaryCard
            todayProfit={todayProfit}
            todaySales={todaySales}
            averageMargin={averageMargin}
            lowStockCount={lowStockProducts.length}
          />

          <SectionCard title="งานด่วน" icon={<AlertTriangle size={19} />}>
            <div className="grid gap-3">
              {urgentActions.length > 0 ? (
                urgentActions.map((action) => (
                  <UrgentAction
                    key={`${action.title}-${action.href}`}
                    title={action.title}
                    detail={action.detail}
                    href={action.href}
                    tone={action.tone}
                  />
                ))
              ) : (
                <div className="flex min-h-20 items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
                  <CheckCircle2 size={22} />
                  <div>
                    <p className="text-sm font-black">ยังไม่มีงานเสี่ยงเร่งด่วน</p>
                    <p className="mt-1 text-xs font-bold opacity-80">พร้อมตรวจแคมเปญชุดต่อไป</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="AI แนะนำ" icon={<Sparkles size={19} />}>
            <div className="grid gap-3">
              {recommendationFeed.map((item) => (
                <RecommendationItem
                  key={`${item.title}-${item.detail}`}
                  title={item.title}
                  detail={item.detail}
                  status={item.status}
                />
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="grid content-start gap-4">
          <SectionCard title="ปุ่มลัด" icon={<Zap size={19} />}>
            <div className="grid gap-3">
              <QuickActionLink
                href="/app/campaigns"
                icon={<PackageSearch size={21} />}
                label="ตัดสินใจแคมเปญ"
                helper={`${campaignRows.length} รายการรอเช็ก`}
              />
              <QuickActionLink
                href="/app/products"
                icon={<ShoppingBag size={21} />}
                label="ดู SKU เสี่ยง"
                helper={`${riskyProducts.length} รายการต้องดู`}
              />
              <QuickActionLink
                href="/app/profit-rules"
                icon={<LineChart size={21} />}
                label="ปรับกฎกำไร"
                helper="ตั้งเป้าขั้นต่ำต่อสินค้า"
              />
              <QuickActionLink
                href="/app/alerts"
                icon={<Bell size={21} />}
                label="ดูแจ้งเตือน"
                helper={`${alerts.length} ข้อความล่าสุด`}
              />
            </div>
          </SectionCard>

          <SectionCard title="สถานะอนุมัติเอง" icon={<Clock3 size={19} />}>
            <div className="grid gap-3">
              <div className={`rounded-xl border p-4 ${toneStyles[statusTone.DANGER]}`}>
                <p className="text-sm font-black">แคมเปญอันตราย</p>
                <p className="mt-1 text-2xl font-black">{dangerCampaigns.length}</p>
              </div>
              <div className={`rounded-xl border p-4 ${toneStyles[statusTone.WARNING]}`}>
                <p className="text-sm font-black">ควรเช็กก่อนอนุมัติ</p>
                <p className="mt-1 text-2xl font-black">{warningCampaigns.length}</p>
              </div>
              <div className={`rounded-xl border p-4 ${toneStyles[statusTone.GOOD]}`}>
                <p className="text-sm font-black">อนุมัติได้</p>
                <p className="mt-1 text-2xl font-black">{goodCampaigns.length}</p>
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>
    </AppShell>
  );
}
