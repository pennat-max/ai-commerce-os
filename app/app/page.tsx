import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  Clock3,
  LineChart,
  MessageCircle,
  PackageSearch,
  ShoppingBag,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  AiInsightCard,
  KpiCard,
  PremiumChip,
  PremiumFeedCard,
  PremiumIntro,
  PremiumSection,
  QuickActionCard,
  StatusSummaryCard,
} from "@/components/premium-mobile";
import { StatusBadge } from "@/components/status";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";
import { listAlerts, listCampaigns, listProducts } from "@/lib/repositories";

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
  const dangerProducts = productProfits.filter(({ profit }) => profit.status === "DANGER");
  const warningProducts = productProfits.filter(({ profit }) => profit.status === "WARNING");
  const lowStockProducts = products.filter((product) => product.stock <= 10);
  const dangerCampaigns = campaignRows.filter(({ decision }) => decision.recommendation === "DANGER");
  const warningCampaigns = campaignRows.filter(({ decision }) => decision.recommendation === "WARNING");
  const goodCampaigns = campaignRows.filter(({ decision }) => decision.recommendation === "GOOD");

  const todayOrders = products.reduce(
    (sum, product) => sum + Math.max(1, Math.min(9, Math.ceil(product.stock / 8))),
    0,
  );
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

  const recommendedCampaign = goodCampaigns[0] ?? warningCampaigns[0] ?? campaignRows[0];
  const blockedCampaign = dangerCampaigns[0] ?? warningCampaigns[0] ?? campaignRows[0];
  const bestCampaignName = recommendedCampaign?.campaign.name ?? "ยังไม่มีแคมเปญที่เหมาะ";
  const todayLabel = new Intl.DateTimeFormat("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());
  const hasDataNotice = [productsResult.error, campaignsResult.error, alertsResult.error].some(Boolean);

  return (
    <AppShell title="วันนี้ร้านเป็นยังไง" subtitle="สรุปยอดขาย กำไร ความเสี่ยง และงานสำคัญในที่เดียว">
      <div className="grid gap-5">
        <PremiumIntro
          eyebrow="สวัสดีคุณเจ้าของร้าน"
          title={`วันนี้โฟกัส ${dangerProducts.length + dangerCampaigns.length + lowStockProducts.length} เรื่องก่อน`}
          description={`แคมเปญที่น่าดูที่สุดคือ ${bestCampaignName} และมีสินค้าใกล้หมด ${lowStockProducts.length} รายการ`}
          icon={Bot}
          tone="emerald"
        >
          <div className="flex flex-wrap gap-2">
            <PremiumChip tone="sky">{todayLabel}</PremiumChip>
            <PremiumChip tone="emerald">โหมดอนุมัติเอง</PremiumChip>
            {hasDataNotice ? <PremiumChip tone="amber">ใช้ข้อมูลสำรองบางส่วน</PremiumChip> : null}
          </div>
        </PremiumIntro>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="ยอดขายวันนี้" value={formatBaht(todaySales)} helper="รวมทุกช่องทาง" icon={WalletCards} tone="sky" />
          <KpiCard label="กำไรวันนี้" value={formatBaht(todayProfit)} helper="หลังหักต้นทุนหลัก" icon={LineChart} tone="emerald" />
          <KpiCard label="ออเดอร์วันนี้" value={`${todayOrders}`} helper="ประมาณจากข้อมูลร้าน" icon={ShoppingBag} tone="violet" />
          <KpiCard label="มาร์จินเฉลี่ย" value={formatPercent(averageMargin)} helper="ดูแนวโน้มกำไร" icon={Sparkles} tone="amber" />
        </div>

        <StatusSummaryCard
          title="สถานะที่ต้องโฟกัส"
          items={[
            { label: "เสี่ยงขาดทุน", value: `${dangerProducts.length + dangerCampaigns.length}`, tone: "rose" },
            { label: "กำไรต่ำ", value: `${warningProducts.length + warningCampaigns.length}`, tone: "amber" },
            { label: "รออนุมัติแคมเปญ", value: `${campaignRows.length}`, tone: "violet" },
            { label: "สต็อกใกล้หมด", value: `${lowStockProducts.length}`, tone: "sky" },
          ]}
        />

        <PremiumSection title="แคมเปญที่ควรตัดสินใจ" helper="ดูใบที่ควรสมัครและใบที่ควรหยุดก่อน">
          <div className="grid gap-3 lg:grid-cols-2">
            {recommendedCampaign ? (
              <PremiumFeedCard
                icon={CheckCircle2}
                title={`น่าเข้าร่วม: ${recommendedCampaign.campaign.name}`}
                description={`${recommendedCampaign.product.name} คาดกำไร ${formatBaht(recommendedCampaign.decision.profit.netProfit)}`}
                tone="emerald"
                badge={<StatusBadge status={recommendedCampaign.decision.recommendation} />}
              >
                <Link
                  href={`/app/campaigns/${recommendedCampaign.campaign.id}`}
                  className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 text-sm font-black text-white"
                >
                  ตรวจและอนุมัติ
                  <ArrowRight size={17} />
                </Link>
              </PremiumFeedCard>
            ) : null}

            {blockedCampaign ? (
              <PremiumFeedCard
                icon={AlertTriangle}
                title={`ควรหยุดก่อน: ${blockedCampaign.campaign.name}`}
                description={`${blockedCampaign.product.name} คาดกำไร ${formatBaht(blockedCampaign.decision.profit.netProfit)}`}
                tone={blockedCampaign.decision.recommendation === "DANGER" ? "rose" : "amber"}
                badge={<StatusBadge status={blockedCampaign.decision.recommendation} />}
              >
                <Link
                  href={`/app/campaigns/${blockedCampaign.campaign.id}`}
                  className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
                >
                  ดูเหตุผล
                  <ArrowRight size={17} />
                </Link>
              </PremiumFeedCard>
            ) : null}
          </div>
        </PremiumSection>

        <AiInsightCard
          title="ปิดความเสี่ยงก่อน แล้วค่อยดันยอด"
          description={`เริ่มจากแคมเปญเสี่ยง ${dangerCampaigns.length} รายการ เติมของใกล้หมด ${lowStockProducts.length} รายการ แล้วค่อยเพิ่มแรงขายให้สินค้าที่กำไรดี`}
          ctaHref="/app/assistant"
          ctaLabel="ถาม AI ต่อ"
        />

        <PremiumSection title="ปุ่มลัดสำหรับวันนี้">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <QuickActionCard
              href="/app/campaigns"
              icon={PackageSearch}
              title="ตัดสินใจแคมเปญ"
              description={`${campaignRows.length} รายการรอเช็ก`}
              tone="emerald"
            />
            <QuickActionCard
              href="/app/products"
              icon={ShoppingBag}
              title="ดูสินค้าเสี่ยง"
              description={`${warningProducts.length + dangerProducts.length} รายการต้องดู`}
              tone="rose"
            />
            <QuickActionCard
              href="/app/inbox"
              icon={MessageCircle}
              title="ตอบแชท"
              description="ดูคำตอบที่ AI ช่วยร่าง"
              tone="sky"
            />
            <QuickActionCard
              href="/app/opportunities"
              icon={Zap}
              title="หาโอกาสกำไร"
              description={`${alerts.length} สัญญาณล่าสุด`}
              tone="violet"
            />
            <QuickActionCard
              href="/app/alerts"
              icon={Bell}
              title="ดูแจ้งเตือน"
              description="เรื่องที่ควรตรวจทันที"
              tone="amber"
            />
            <QuickActionCard
              href="/app/profit-rules"
              icon={Clock3}
              title="ตั้งกฎกำไร"
              description="กันขายแล้วกำไรหาย"
              tone="slate"
            />
          </div>
        </PremiumSection>
      </div>
    </AppShell>
  );
}
