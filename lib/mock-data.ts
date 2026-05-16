import type { Campaign, CampaignDecision, DashboardMetric, Product } from "@/types/domain";
import { calculateProfit, formatBaht } from "@/lib/profit";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";

export const organizations = [
  { id: "10000000-0000-0000-0000-000000000001", name: "บ้านสวยออนไลน์", owner: "คุณเมย์", plan: "Growth", stores: 3 },
  { id: "10000000-0000-0000-0000-000000000002", name: "Gadget Hub TH", owner: "คุณนนท์", plan: "Starter", stores: 2 },
  { id: "org-3", name: "Mango Beauty", owner: "คุณแพร", plan: "Scale", stores: 5 },
];

export const plans = [
  { id: "starter", name: "Starter", price: 990, stores: 2, decisions: 5000 },
  { id: "growth", name: "Growth", price: 2490, stores: 6, decisions: 25000 },
  { id: "scale", name: "Scale", price: 6990, stores: 20, decisions: 100000 },
];

export const stores = [
  { id: "20000000-0000-0000-0000-000000000001", organizationId: "10000000-0000-0000-0000-000000000001", name: "Shopee บ้านสวย", platform: "shopee" },
  { id: "20000000-0000-0000-0000-000000000002", organizationId: "10000000-0000-0000-0000-000000000001", name: "Lazada บ้านสวย", platform: "lazada" },
  { id: "20000000-0000-0000-0000-000000000003", organizationId: "10000000-0000-0000-0000-000000000001", name: "TikTok บ้านสวย", platform: "tiktok" },
];

export const products: Product[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    organizationId: "10000000-0000-0000-0000-000000000001",
    storeId: "20000000-0000-0000-0000-000000000001",
    sku: "HOME-LED-01",
    name: "โคมไฟ LED ตั้งโต๊ะ",
    platform: "shopee",
    cost: 130,
    sellingPrice: 299,
    stock: 18,
    shippingCost: 22,
    platformFeePercent: 6,
    adsCost: 18,
    affiliateCommissionPercent: 3,
    packagingCost: 9,
    otherCost: 4,
    minProfit: 45,
    minMarginPercent: 16,
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    organizationId: "10000000-0000-0000-0000-000000000001",
    storeId: "20000000-0000-0000-0000-000000000002",
    sku: "HOME-BOX-02",
    name: "กล่องเก็บของพับได้",
    platform: "lazada",
    cost: 85,
    sellingPrice: 159,
    stock: 8,
    shippingCost: 18,
    platformFeePercent: 5,
    adsCost: 12,
    affiliateCommissionPercent: 2,
    packagingCost: 7,
    otherCost: 3,
    minProfit: 25,
    minMarginPercent: 15,
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    organizationId: "10000000-0000-0000-0000-000000000001",
    storeId: "20000000-0000-0000-0000-000000000003",
    sku: "HOME-MOP-03",
    name: "ม็อบรีดน้ำ 360 องศา",
    platform: "tiktok",
    cost: 210,
    sellingPrice: 329,
    stock: 42,
    shippingCost: 30,
    platformFeePercent: 7,
    adsCost: 35,
    affiliateCommissionPercent: 5,
    packagingCost: 12,
    otherCost: 6,
    minProfit: 40,
    minMarginPercent: 14,
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    organizationId: "10000000-0000-0000-0000-000000000001",
    storeId: "20000000-0000-0000-0000-000000000001",
    sku: "HOME-RACK-04",
    name: "ชั้นวางของติดผนัง",
    platform: "shopee",
    cost: 155,
    sellingPrice: 249,
    stock: 3,
    shippingCost: 25,
    platformFeePercent: 6,
    adsCost: 24,
    affiliateCommissionPercent: 4,
    packagingCost: 10,
    otherCost: 5,
    minProfit: 35,
    minMarginPercent: 15,
  },
];

export const campaigns: Campaign[] = [
  {
    id: "40000000-0000-0000-0000-000000000001",
    organizationId: "10000000-0000-0000-0000-000000000001",
    productId: "30000000-0000-0000-0000-000000000001",
    name: "Shopee Flash Sale 6.6",
    campaignDiscount: 20,
    shopVoucher: 10,
    coinsCashback: 4,
    shippingSubsidy: 12,
    startsAt: "2026-06-06",
    endsAt: "2026-06-07",
  },
  {
    id: "40000000-0000-0000-0000-000000000002",
    organizationId: "10000000-0000-0000-0000-000000000001",
    productId: "30000000-0000-0000-0000-000000000002",
    name: "Lazada Payday Boost",
    campaignDiscount: 18,
    shopVoucher: 8,
    coinsCashback: 3,
    shippingSubsidy: 10,
    startsAt: "2026-05-25",
    endsAt: "2026-05-26",
  },
  {
    id: "40000000-0000-0000-0000-000000000003",
    organizationId: "10000000-0000-0000-0000-000000000001",
    productId: "30000000-0000-0000-0000-000000000003",
    name: "TikTok Live Mega Deal",
    campaignDiscount: 45,
    shopVoucher: 20,
    coinsCashback: 8,
    shippingSubsidy: 18,
    startsAt: "2026-05-20",
    endsAt: "2026-05-22",
  },
];

export const campaignDecisions: CampaignDecision[] = campaigns.map((campaign) => {
  const product = products.find((item) => item.id === campaign.productId)!;
  const recommendation = recommendCampaignDecision(product, campaign);

  return {
    id: `dec-${campaign.id}`,
    campaignId: campaign.id,
    productId: product.id,
    organizationId: campaign.organizationId,
    recommendation: recommendation.recommendation,
    action: recommendation.recommendation === "GOOD" ? "approve" : "watch",
    note: recommendation.reason,
  };
});

export const alerts = [
  {
    id: "alert-1",
    organizationId: "org-1",
    channel: "line",
    title: "LINE mock: SKU เสี่ยงขาดทุน",
    message: "HOME-MOP-03 มีแคมเปญที่กำไรติดลบ",
    severity: "DANGER",
  },
  {
    id: "alert-2",
    organizationId: "org-1",
    channel: "email",
    title: "Email mock: สต็อกต่ำ",
    message: "HOME-RACK-04 เหลือ 3 ชิ้น",
    severity: "WARNING",
  },
  {
    id: "alert-3",
    organizationId: "org-1",
    channel: "dashboard",
    title: "Dashboard: รออนุมัติ",
    message: "มี 2 แคมเปญรอการตัดสินใจ",
    severity: "GOOD",
  },
];

export function getDashboardMetrics(): DashboardMetric[] {
  const campaignProfits = campaigns.map((campaign) => {
    const product = products.find((item) => item.id === campaign.productId)!;
    return calculateProfit(product, campaign);
  });
  const riskSkuCount = campaignProfits.filter((profit) => profit.status !== "GOOD").length;
  const dangerousCampaigns = campaignProfits.filter((profit) => profit.status === "DANGER").length;
  const lowStockProducts = products.filter((product) => product.stock <= 10).length;
  const todayProfit = campaignProfits.reduce((sum, profit) => sum + Math.max(profit.netProfit, 0), 0);

  return [
    { label: "ยอดขายวันนี้", value: formatBaht(42680), tone: "blue", helper: "Mock จากทุกช่องทาง" },
    { label: "กำไรวันนี้", value: formatBaht(todayProfit * 32), tone: "green", helper: "หลังหักต้นทุนหลัก" },
    { label: "SKU เสี่ยง", value: `${riskSkuCount}`, tone: "yellow", helper: "ต่ำกว่าเกณฑ์กำไร" },
    { label: "แคมเปญแนะนำ", value: "1", tone: "green", helper: "ผ่าน Manual Mode" },
    { label: "แคมเปญอันตราย", value: `${dangerousCampaigns}`, tone: "red", helper: "ควรปฏิเสธ" },
    { label: "สินค้าสต็อกต่ำ", value: `${lowStockProducts}`, tone: "yellow", helper: "เหลือน้อยกว่า 10 ชิ้น" },
    { label: "รออนุมัติ", value: "2", tone: "blue", helper: "ต้องกด Approve/Reject/Watch" },
  ];
}
