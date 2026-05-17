import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Clock3,
  Database,
  Megaphone,
  MessageCircle,
  Package,
  PieChart,
  ShoppingBag,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { resolveLocale, type Locale, withLocalePath } from "@/lib/i18n";
import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";
import { listAlerts, listCampaigns, listProducts } from "@/lib/repositories";
import type { Campaign, Product } from "@/types/domain";

type Accent = "blue" | "green" | "violet" | "orange" | "red";
type PlatformLogoKey = "shopee" | "lazada" | "tiktok" | "line" | "email";
type CampaignAnalysis = {
  campaign: Campaign;
  product: Product;
  decision: ReturnType<typeof recommendCampaignDecision>;
};

const homeCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    greeting: (name: string) => string;
    date: string;
    kpi: {
      sales: string;
      profit: string;
      orders: string;
      margin: string;
      compare: string;
    };
    focus: {
      title: string;
      viewAll: string;
      loss: string;
      lowProfit: string;
      pending: string;
      lowStock: string;
      unit: string;
    };
    campaign: {
      title: string;
      viewAll: string;
      goodBadge: string;
      dangerBadge: string;
      shopeeTitle: string;
      lazadaTitle: string;
      products: string;
      expectedProfit: string;
      expectedLoss: string;
      reason: string;
      lowMargin: string;
      highShipping: string;
      details: string;
    };
    insight: {
      label: string;
      headline: string;
      subtext: string;
      action: string;
    };
    shortcuts: {
      title: string;
      products: string;
      campaigns: string;
      inbox: string;
      reports: string;
      askAi: string;
    };
  }
> = {
  th: {
    pageTitle: "หน้าหลัก",
    pageSubtitle: "ภาพรวมร้านค้าของคุณวันนี้",
    greeting: (name) => `สวัสดีครับ, ${name} 👋`,
    date: "24 พ.ค. 2025",
    kpi: {
      sales: "ยอดขายวันนี้",
      profit: "กำไรวันนี้",
      orders: "ออเดอร์วันนี้",
      margin: "มาร์จินเฉลี่ย",
      compare: "เทียบเมื่อวาน",
    },
    focus: {
      title: "สถานะสำคัญที่ต้องโฟกัส",
      viewAll: "ดูทั้งหมด",
      loss: "เสี่ยงขาดทุน",
      lowProfit: "กำไรต่ำ",
      pending: "รออนุมัติแคมเปญ",
      lowStock: "สต็อกใกล้หมด",
      unit: "รายการ",
    },
    campaign: {
      title: "แคมเปญแนะนำสำหรับคุณ",
      viewAll: "ดูทั้งหมด",
      goodBadge: "แนะนำให้เข้า",
      dangerBadge: "ไม่แนะนำให้เข้า",
      shopeeTitle: "Shopee 6.6 ลดใหญ่กลางปี",
      lazadaTitle: "Lazada Flash Sale",
      products: "สินค้าแนะนำ",
      expectedProfit: "คาดว่ากำไร",
      expectedLoss: "คาดว่าขาดทุน",
      reason: "เหตุผล",
      lowMargin: "มาร์จินต่ำกว่าเกณฑ์",
      highShipping: "ค่าส่งต่อออเดอร์สูง",
      details: "ดูรายละเอียด",
    },
    insight: {
      label: "AI Insight สำหรับคุณ",
      headline: "พบ 3 สินค้าที่ควรปรับราคาขึ้น",
      subtext: "จะช่วยเพิ่มกำไรเฉลี่ย 2,180 บาท/วัน",
      action: "ดูเพิ่มเติม",
    },
    shortcuts: {
      title: "ทางลัด",
      products: "สินค้า",
      campaigns: "แคมเปญ",
      inbox: "ข้อความ",
      reports: "รายงาน",
      askAi: "Ask AI",
    },
  },
  zh: {
    pageTitle: "首页",
    pageSubtitle: "今天店铺总览",
    greeting: (name) => `${name}，你好 👋`,
    date: "2025年5月24日",
    kpi: {
      sales: "今日销售额",
      profit: "今日利润",
      orders: "今日订单",
      margin: "平均毛利率",
      compare: "较昨日",
    },
    focus: {
      title: "重点关注状态",
      viewAll: "查看全部",
      loss: "亏损风险",
      lowProfit: "利润偏低",
      pending: "待审批活动",
      lowStock: "库存将尽",
      unit: "项",
    },
    campaign: {
      title: "为你推荐的活动",
      viewAll: "查看全部",
      goodBadge: "建议参加",
      dangerBadge: "不建议参加",
      shopeeTitle: "Shopee 6.6 年中大促",
      lazadaTitle: "Lazada 限时闪购",
      products: "推荐商品",
      expectedProfit: "预计利润",
      expectedLoss: "预计亏损",
      reason: "原因",
      lowMargin: "毛利率低于标准",
      highShipping: "单笔运费过高",
      details: "查看详情",
    },
    insight: {
      label: "专属 AI 洞察",
      headline: "发现 3 个商品适合调高价格",
      subtext: "预计可增加平均利润 2,180 泰铢/天",
      action: "查看更多",
    },
    shortcuts: {
      title: "快捷入口",
      products: "商品",
      campaigns: "活动",
      inbox: "消息",
      reports: "报告",
      askAi: "Ask AI",
    },
  },
  en: {
    pageTitle: "Home",
    pageSubtitle: "Your store overview today",
    greeting: (name) => `Hi, ${name} 👋`,
    date: "24 May 2025",
    kpi: {
      sales: "Today sales",
      profit: "Today profit",
      orders: "Today orders",
      margin: "Avg margin",
      compare: "vs yesterday",
    },
    focus: {
      title: "Key Status To Focus",
      viewAll: "View all",
      loss: "Loss risk",
      lowProfit: "Low profit",
      pending: "Pending campaigns",
      lowStock: "Low stock",
      unit: "items",
    },
    campaign: {
      title: "Campaigns For You",
      viewAll: "View all",
      goodBadge: "Recommended",
      dangerBadge: "Not recommended",
      shopeeTitle: "Shopee 6.6 Mid-Year Sale",
      lazadaTitle: "Lazada Flash Sale",
      products: "Recommended products",
      expectedProfit: "Expected profit",
      expectedLoss: "Expected loss",
      reason: "Reason",
      lowMargin: "Margin below target",
      highShipping: "Shipping cost too high",
      details: "View details",
    },
    insight: {
      label: "AI Insight For You",
      headline: "3 products are ready for a price increase",
      subtext: "Potential average profit lift: ฿2,180/day",
      action: "See more",
    },
    shortcuts: {
      title: "Shortcuts",
      products: "Products",
      campaigns: "Campaigns",
      inbox: "Inbox",
      reports: "Reports",
      askAi: "Ask AI",
    },
  },
};

const accentStyles: Record<
  Accent,
  {
    icon: string;
    text: string;
    soft: string;
    border: string;
  }
> = {
  blue: {
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-600",
    soft: "bg-blue-50",
    border: "border-blue-100",
  },
  green: {
    icon: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-600",
    soft: "bg-emerald-50",
    border: "border-emerald-100",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600",
    text: "text-violet-600",
    soft: "bg-violet-50",
    border: "border-violet-100",
  },
  orange: {
    icon: "bg-orange-100 text-orange-600",
    text: "text-orange-600",
    soft: "bg-orange-50",
    border: "border-orange-100",
  },
  red: {
    icon: "bg-rose-100 text-rose-600",
    text: "text-rose-600",
    soft: "bg-rose-50",
    border: "border-rose-100",
  },
};

const platformLabels: Record<PlatformLogoKey, string> = {
  shopee: "Shopee",
  lazada: "Lazada",
  tiktok: "TikTok Shop",
  line: "LINE",
  email: "Email",
};

function PlatformLogo({
  platform,
  showLabel = false,
}: {
  platform: PlatformLogoKey;
  showLabel?: boolean;
}) {
  const icon = (() => {
    if (platform === "shopee") {
      return (
        <span className="relative flex size-7 items-center justify-center rounded-lg bg-[#ee4d2d] text-white shadow-sm">
          <ShoppingBag size={17} strokeWidth={2.5} />
          <span className="absolute top-[0.55rem] text-[8px] font-black leading-none">S</span>
        </span>
      );
    }

    if (platform === "lazada") {
      return (
        <span className="relative flex size-7 items-center justify-center overflow-hidden rounded-lg bg-[#1a48ff] shadow-sm">
          <span className="absolute inset-0 bg-[linear-gradient(135deg,#1a48ff_0%,#7b2cff_45%,#ff7a1a_100%)]" />
          <span className="relative h-3.5 w-4 rotate-45 rounded-[0.28rem] bg-white/95" />
          <span className="absolute text-[7px] font-black text-[#1a48ff]">L</span>
        </span>
      );
    }

    if (platform === "tiktok") {
      return (
        <span className="relative flex size-7 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
          <span className="absolute translate-x-0.5 translate-y-0.5 text-sm font-black text-cyan-300">♪</span>
          <span className="absolute -translate-x-0.5 -translate-y-0.5 text-sm font-black text-rose-400">♪</span>
          <span className="relative text-sm font-black">♪</span>
        </span>
      );
    }

    if (platform === "line") {
      return (
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#06c755] text-[8px] font-black text-white shadow-sm">
          LINE
        </span>
      );
    }

    return (
      <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-[8px] font-black text-white shadow-sm">
        @
      </span>
    );
  })();

  if (!showLabel) return icon;

  return (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-slate-100 bg-white/85 px-2.5 text-[11px] font-black text-slate-700 shadow-sm">
      {icon}
      {platformLabels[platform]}
    </span>
  );
}

function KpiTile({
  label,
  value,
  trend,
  compareLabel,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  trend: string;
  compareLabel: string;
  icon: LucideIcon;
  accent: Accent;
}) {
  return (
    <div className="min-h-[7.55rem] rounded-[1.25rem] border border-slate-100 bg-white/90 p-3 shadow-[0_14px_32px_rgba(15,23,42,0.06)] min-[560px]:p-4">
      <span className={`flex size-9 items-center justify-center rounded-2xl ${accentStyles[accent].icon}`}>
        <Icon size={18} />
      </span>
      <p className="mt-3 text-[11px] font-black leading-tight text-slate-700">{label}</p>
      <p className="mt-2 text-base font-black leading-none text-slate-950">{value}</p>
      <p className="mt-2 text-[11px] font-black text-emerald-600">↗ {trend}</p>
      <p className="mt-1 text-[11px] font-bold text-slate-500">{compareLabel}</p>
    </div>
  );
}

function FocusItem({
  label,
  value,
  unit,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  accent: Accent;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 min-[560px]:gap-3">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full min-[560px]:size-10 ${accentStyles[accent].icon}`}>
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold leading-tight text-slate-600">{label}</span>
        <span className="mt-0.5 block text-lg font-black leading-none text-slate-950">{value}</span>
        <span className="mt-1 block text-[11px] font-bold text-slate-500">{unit}</span>
      </span>
    </div>
  );
}

function MiniProductStack({ count }: { count: number }) {
  const platforms: PlatformLogoKey[] = ["shopee", "lazada", "tiktok"];

  return (
    <div className="mt-3 flex items-center gap-2 min-[560px]:gap-3">
      {platforms.map((platform) => (
        <span key={platform} className="flex size-9 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm min-[560px]:size-12">
          <PlatformLogo platform={platform} />
        </span>
      ))}
      <span className="flex size-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-[11px] font-black text-slate-700 shadow-sm min-[560px]:size-12 min-[560px]:text-xs">
        +{Math.max(1, count)}
      </span>
    </div>
  );
}

function CampaignCard({
  type,
  title,
  productLabel,
  profitLabel,
  marginLabel,
  baselineMarginLabel,
  href,
  reasonRows,
  productCount,
  platform,
  copy,
}: {
  type: "good" | "danger";
  title: string;
  productLabel: string;
  profitLabel: string;
  marginLabel?: string;
  baselineMarginLabel?: string;
  href: string;
  reasonRows?: Array<{ label: string; value: string; danger?: boolean }>;
  productCount: number;
  platform: PlatformLogoKey;
  copy: (typeof homeCopy)[Locale]["campaign"];
}) {
  const isGood = type === "good";

  return (
    <div
      className={`rounded-[1.35rem] border p-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.05)] min-[560px]:p-4 ${
        isGood ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50/60"
      }`}
    >
      <span
        className={`inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-black ${
          isGood ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}
      >
        {isGood ? <ThumbsUp size={15} /> : <XCircle size={15} />}
        {isGood ? copy.goodBadge : copy.dangerBadge}
      </span>

      <div className="mt-4 flex items-center gap-3">
        <PlatformLogo platform={platform} />
        <h3 className="text-[13px] font-black leading-tight text-slate-950 min-[560px]:text-sm">{title}</h3>
      </div>

      {isGood ? (
        <>
          <p className="mt-5 text-xs font-black text-slate-700">{productLabel}</p>
          <MiniProductStack count={productCount} />
          <div className="mt-5 grid grid-cols-[1fr_auto] gap-2 text-xs font-bold">
            <span className="text-slate-500">{copy.expectedProfit}</span>
            <span className="text-right font-black text-emerald-600">{marginLabel}</span>
            <span className="text-base font-black text-emerald-700">{profitLabel}</span>
            <span className="text-right font-black text-emerald-600">{baselineMarginLabel}</span>
          </div>
          <Link
            href={href}
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-sm"
          >
            {copy.details}
            <ArrowRight size={18} />
          </Link>
        </>
      ) : (
        <>
          <p className="mt-5 text-xs font-black text-slate-700">{copy.reason}</p>
          <div className="mt-3 grid gap-3">
            {reasonRows?.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 text-xs font-bold">
                <span className="text-slate-500">{row.label}</span>
                <span className={row.danger ? "font-black text-rose-600" : "font-black text-slate-700"}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500">{copy.expectedLoss}</span>
            <span className="font-black text-rose-600">{profitLabel}</span>
          </div>
          <Link
            href={href}
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white/80 px-4 text-xs font-black text-rose-600"
          >
            {copy.details}
            <ArrowRight size={18} />
          </Link>
        </>
      )}
    </div>
  );
}

function ShortcutTile({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  accent: Accent;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[1.35rem] border border-slate-100 bg-white/90 p-2.5 text-center shadow-[0_14px_32px_rgba(15,23,42,0.06)] active:scale-[0.99] min-[560px]:min-h-28 min-[560px]:gap-3 min-[560px]:p-3"
    >
      <span className={`flex size-11 items-center justify-center rounded-2xl ${accentStyles[accent].icon}`}>
        <Icon size={22} />
      </span>
      <span className="text-[11px] font-black leading-tight text-slate-700 min-[560px]:text-xs">{label}</span>
    </Link>
  );
}

function estimateDailyUnits(product: Product) {
  if (product.stock <= 0) return 0;
  return Math.max(1, Math.min(8, Math.ceil(product.stock / 12)));
}

function platformLogoFromProduct(product: Product): PlatformLogoKey {
  return product.platform === "tiktok" ? "tiktok" : product.platform;
}

function trendFromValue(value: number, divisor: number) {
  if (value <= 0) return "0.0%";
  return formatPercent(Math.min(49.9, Math.max(1.2, value / divisor)));
}

function buildInsight({
  locale,
  copy,
  dangerCampaign,
  lowStockProduct,
  goodCampaign,
  healthyMargin,
  hrefFor,
}: {
  locale: Locale;
  copy: (typeof homeCopy)[Locale]["insight"];
  dangerCampaign?: CampaignAnalysis;
  lowStockProduct?: Product;
  goodCampaign?: CampaignAnalysis;
  healthyMargin: number;
  hrefFor: (path: string) => string;
}) {
  if (dangerCampaign) {
    const campaignName = dangerCampaign.campaign.name;
    const loss = formatBaht(dangerCampaign.decision.profit.netProfit);

    return {
      label: copy.label,
      headline:
        locale === "zh"
          ? `建议先暂停 ${campaignName}`
          : locale === "en"
            ? `Stop ${campaignName} before approving`
            : `ควรหยุด ${campaignName} ก่อนอนุมัติ`,
      subtext:
        locale === "zh"
          ? `系统测算该活动可能亏损 ${loss}，建议拒绝或调价后再参加`
          : locale === "en"
            ? `Estimated campaign loss is ${loss}. Reject it or adjust price before joining.`
            : `ระบบประเมินว่าแคมเปญนี้อาจขาดทุน ${loss} ควรปฏิเสธหรือปรับราคาก่อน`,
      action: copy.action,
      href: hrefFor(`/app/campaigns/${dangerCampaign.campaign.id}`),
    };
  }

  if (lowStockProduct) {
    return {
      label: copy.label,
      headline:
        locale === "zh"
          ? `${lowStockProduct.name} 库存偏低`
          : locale === "en"
            ? `${lowStockProduct.name} is running low`
            : `${lowStockProduct.name} ใกล้หมดสต็อก`,
      subtext:
        locale === "zh"
          ? `当前库存剩 ${lowStockProduct.stock} 件，建议补货后再推活动`
          : locale === "en"
            ? `Only ${lowStockProduct.stock} units left. Restock before pushing more campaigns.`
            : `เหลือ ${lowStockProduct.stock} ชิ้น ควรเติมสต็อกก่อนดันแคมเปญเพิ่ม`,
      action: copy.action,
      href: hrefFor(`/app/products/${lowStockProduct.id}`),
    };
  }

  if (goodCampaign) {
    return {
      label: copy.label,
      headline:
        locale === "zh"
          ? `${goodCampaign.campaign.name} 可以参加`
          : locale === "en"
            ? `${goodCampaign.campaign.name} is ready to join`
            : `${goodCampaign.campaign.name} น่าเข้าร่วม`,
      subtext:
        locale === "zh"
          ? `预计利润 ${formatBaht(goodCampaign.decision.profit.netProfit)}，毛利率 ${formatPercent(
              goodCampaign.decision.profit.marginPercent,
            )}`
          : locale === "en"
            ? `Estimated profit ${formatBaht(goodCampaign.decision.profit.netProfit)} with ${formatPercent(
                goodCampaign.decision.profit.marginPercent,
              )} margin.`
            : `คาดว่ากำไร ${formatBaht(goodCampaign.decision.profit.netProfit)} มาร์จิน ${formatPercent(
                goodCampaign.decision.profit.marginPercent,
              )}`,
      action: copy.action,
      href: hrefFor(`/app/campaigns/${goodCampaign.campaign.id}`),
    };
  }

  return {
    label: copy.label,
    headline:
      locale === "zh"
        ? "店铺状态健康"
        : locale === "en"
          ? "Store health looks good"
          : "ภาพรวมร้านค้าดูแข็งแรง",
    subtext:
      locale === "zh"
        ? `当前平均毛利率 ${formatPercent(healthyMargin)}，暂无高风险活动`
        : locale === "en"
          ? `Average margin is ${formatPercent(healthyMargin)} with no high-risk campaigns.`
          : `มาร์จินเฉลี่ย ${formatPercent(healthyMargin)} และยังไม่มีแคมเปญเสี่ยงสูง`,
    action: copy.action,
    href: hrefFor("/app/opportunities"),
  };
}

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string | string[] | undefined }>;
}) {
  const params = searchParams ? await searchParams : {};
  const locale = resolveLocale(params.lang);
  const copy = homeCopy[locale];
  const hrefFor = (path: string) => withLocalePath(path, locale);
  const [productsResult, campaignsResult, alertsResult] = await Promise.all([
    listProducts(),
    listCampaigns(),
    listAlerts(),
  ]);

  const products = productsResult.data;
  const campaigns = campaignsResult.data;
  const alerts = alertsResult.data;
  const productById = new Map(products.map((product) => [product.id, product]));
  const campaignRows: CampaignAnalysis[] = campaigns.flatMap((campaign) => {
    const product = productById.get(campaign.productId);
    if (!product) return [];

    const decision = recommendCampaignDecision(product, campaign);
    return [{ campaign, product, decision }];
  });

  const productProfits = products.map((product) => ({ product, profit: calculateProfit(product) }));
  const dangerProducts = productProfits.filter(({ profit }) => profit.status === "DANGER");
  const warningProducts = productProfits.filter(({ profit }) => profit.status === "WARNING");
  const lowStockProducts = products.filter((product) => product.stock <= 10);
  const dangerCampaigns = campaignRows
    .filter(({ decision }) => decision.recommendation === "DANGER")
    .sort((a, b) => a.decision.profit.netProfit - b.decision.profit.netProfit);
  const warningCampaigns = campaignRows.filter(({ decision }) => decision.recommendation === "WARNING");
  const goodCampaigns = campaignRows
    .filter(({ decision }) => decision.recommendation === "GOOD")
    .sort((a, b) => b.decision.profit.netProfit - a.decision.profit.netProfit);

  const recommendedCampaign = goodCampaigns[0];
  const blockedCampaign = dangerCampaigns[0];
  const displayName = "Alex";
  const estimatedUnits = new Map(products.map((product) => [product.id, estimateDailyUnits(product)]));
  const todaySales = products.reduce(
    (sum, product) => sum + product.sellingPrice * (estimatedUnits.get(product.id) ?? 0),
    0,
  );
  const todayProfit = productProfits.reduce(
    (sum, { product, profit }) => sum + profit.netProfit * (estimatedUnits.get(product.id) ?? 0),
    0,
  );
  const todayOrders =
    products.reduce((sum, product) => sum + (estimatedUnits.get(product.id) ?? 0), 0) +
    campaignRows.length;
  const averageMargin =
    productProfits.length === 0
      ? 0
      : productProfits.reduce((sum, { profit }) => sum + profit.marginPercent, 0) /
        productProfits.length;
  const salesTrend = trendFromValue(todaySales, Math.max(1, products.length * 1200));
  const profitTrend = trendFromValue(Math.max(todayProfit, 0), Math.max(1, products.length * 180));
  const orderTrend = trendFromValue(todayOrders, Math.max(1, products.length * 4));
  const marginTrend = trendFromValue(averageMargin, 8);
  const focusLoss = dangerProducts.length + dangerCampaigns.length;
  const focusLowProfit = warningProducts.length + warningCampaigns.length;
  const focusPending = campaignRows.length;
  const focusLowStock = lowStockProducts.length;
  const unreadAlerts = alerts.filter((alert) => !alert.isRead).length;
  const alertBadgeCount = Math.min(99, unreadAlerts || alerts.length);
  const recommendedBaselineMargin = recommendedCampaign
    ? calculateProfit(recommendedCampaign.product).marginPercent
    : 0;
  const extraProductCount = recommendedCampaign
    ? Math.max(1, products.filter((product) => product.platform === recommendedCampaign.product.platform).length - 1)
    : Math.max(1, products.length - 1);
  const insight = buildInsight({
    locale,
    copy: copy.insight,
    dangerCampaign: blockedCampaign,
    lowStockProduct: lowStockProducts[0],
    goodCampaign: recommendedCampaign,
    healthyMargin: averageMargin,
    hrefFor,
  });

  return (
    <AppShell
      title={copy.pageTitle}
      subtitle={copy.pageSubtitle}
      showPageHeader={false}
      premiumMobileFrame
      locale={locale}
      notificationCount={alertBadgeCount}
    >
      <div className="grid gap-5">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-black leading-tight text-slate-950">
              {copy.greeting(displayName)}
            </h1>
            <p className="mt-2 text-xs font-bold text-slate-500">{copy.pageSubtitle}</p>
          </div>
          <span className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 text-xs font-black text-slate-700 shadow-sm min-[560px]:px-4">
            <CalendarDays size={18} className="text-slate-500" />
            {copy.date}
          </span>
        </section>

        <section className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <PlatformLogo platform="shopee" showLabel />
          <PlatformLogo platform="lazada" showLabel />
          <PlatformLogo platform="tiktok" showLabel />
          <PlatformLogo platform="line" showLabel />
          <PlatformLogo platform="email" showLabel />
        </section>

        <section className="grid grid-cols-4 gap-2 min-[560px]:gap-3">
          <KpiTile label={copy.kpi.sales} value={formatBaht(todaySales)} trend={salesTrend} compareLabel={copy.kpi.compare} icon={ShoppingBag} accent="blue" />
          <KpiTile label={copy.kpi.profit} value={formatBaht(todayProfit)} trend={profitTrend} compareLabel={copy.kpi.compare} icon={Database} accent="green" />
          <KpiTile label={copy.kpi.orders} value={`${todayOrders}`} trend={orderTrend} compareLabel={copy.kpi.compare} icon={PieChart} accent="violet" />
          <KpiTile label={copy.kpi.margin} value={formatPercent(averageMargin)} trend={marginTrend} compareLabel={copy.kpi.compare} icon={TrendingUp} accent="orange" />
        </section>

        <section className="rounded-[1.35rem] border border-slate-100 bg-white/90 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-950">{copy.focus.title}</h2>
            <Link href={hrefFor("/app/alerts")} className="flex items-center gap-1 text-xs font-black text-blue-600">
              {copy.focus.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2 min-[560px]:gap-4">
            <FocusItem label={copy.focus.loss} value={`${focusLoss}`} unit={copy.focus.unit} icon={XCircle} accent="red" />
            <FocusItem label={copy.focus.lowProfit} value={`${focusLowProfit}`} unit={copy.focus.unit} icon={Clock3} accent="orange" />
            <FocusItem label={copy.focus.pending} value={`${focusPending}`} unit={copy.focus.unit} icon={Clock3} accent="blue" />
            <FocusItem label={copy.focus.lowStock} value={`${focusLowStock}`} unit={copy.focus.unit} icon={Package} accent="violet" />
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-950">{copy.campaign.title}</h2>
            <Link href={hrefFor("/app/campaigns")} className="flex items-center gap-1 text-xs font-black text-blue-600">
              {copy.campaign.viewAll}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 min-[560px]:gap-4">
            {recommendedCampaign ? (
              <CampaignCard
                type="good"
                title={recommendedCampaign.campaign.name}
                productLabel={recommendedCampaign.product.name}
                profitLabel={formatBaht(recommendedCampaign.decision.profit.netProfit)}
                marginLabel={formatPercent(recommendedCampaign.decision.profit.marginPercent)}
                href={hrefFor(`/app/campaigns/${recommendedCampaign.campaign.id}`)}
                productCount={extraProductCount}
                platform={platformLogoFromProduct(recommendedCampaign.product)}
                copy={copy.campaign}
                baselineMarginLabel={formatPercent(recommendedBaselineMargin)}
              />
            ) : null}
            {blockedCampaign ? (
              <CampaignCard
                type="danger"
                title={blockedCampaign.campaign.name}
                productLabel={copy.campaign.reason}
                profitLabel={formatBaht(blockedCampaign.decision.profit.netProfit)}
                href={hrefFor(`/app/campaigns/${blockedCampaign.campaign.id}`)}
                productCount={extraProductCount}
                platform={platformLogoFromProduct(blockedCampaign.product)}
                copy={copy.campaign}
                reasonRows={[
                  {
                    label: copy.campaign.lowMargin,
                    value: formatPercent(blockedCampaign.decision.profit.marginPercent),
                    danger: true,
                  },
                  {
                    label: copy.campaign.highShipping,
                    value: formatBaht(blockedCampaign.product.shippingCost),
                    danger: true,
                  },
                ]}
              />
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.35rem] border border-violet-100 bg-[linear-gradient(110deg,#faf5ff_0%,#eef6ff_55%,#f0fdf4_100%)] p-5 shadow-[0_14px_36px_rgba(88,28,135,0.10)]">
          <div className="grid gap-4 min-[560px]:grid-cols-[1fr_auto_auto] min-[560px]:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-black text-slate-950">
                <Sparkles size={20} className="text-violet-600" />
                {insight.label}
              </p>
              <h2 className="mt-4 text-base font-black leading-tight text-slate-950">
                {insight.headline}
              </h2>
              <p className="mt-2 text-xs font-bold leading-6 text-slate-500">
                {insight.subtext}
              </p>
            </div>
            <span className="hidden size-24 items-center justify-center rounded-full bg-slate-950 text-cyan-300 shadow-[0_16px_40px_rgba(15,23,42,0.18)] min-[560px]:flex">
              <Bot size={48} />
            </span>
            <Link
              href={insight.href}
              className="flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-xs font-black text-white shadow-sm"
            >
              {insight.action}
            </Link>
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-sm font-black text-slate-950">{copy.shortcuts.title}</h2>
          <div className="grid grid-cols-5 gap-2 min-[560px]:gap-3">
            <ShortcutTile href={hrefFor("/app/products")} icon={Package} label={copy.shortcuts.products} accent="blue" />
            <ShortcutTile href={hrefFor("/app/campaigns")} icon={Megaphone} label={copy.shortcuts.campaigns} accent="green" />
            <ShortcutTile href={hrefFor("/app/inbox")} icon={MessageCircle} label={copy.shortcuts.inbox} accent="violet" />
            <ShortcutTile href={hrefFor("/app/opportunities")} icon={BarChart3} label={copy.shortcuts.reports} accent="orange" />
            <ShortcutTile href={hrefFor("/app/assistant")} icon={Bot} label={copy.shortcuts.askAi} accent="red" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
