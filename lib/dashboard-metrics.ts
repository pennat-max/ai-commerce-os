import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { calculateProfit, formatBaht } from "@/lib/profit";
import type { Campaign, DashboardMetric, Product } from "@/types/domain";

export function buildDashboardMetrics(products: Product[], campaigns: Campaign[]): DashboardMetric[] {
  const campaignProfits = campaigns.map((campaign) => {
    const product = products.find((item) => item.id === campaign.productId);
    if (!product) return null;
    return calculateProfit(product, campaign);
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const riskSkuCount = campaignProfits.filter((profit) => profit.status !== "GOOD").length;
  const dangerousCampaigns = campaignProfits.filter((profit) => profit.status === "DANGER").length;
  const lowStockProducts = products.filter((product) => product.stock <= 10).length;
  const todayProfit = campaignProfits.reduce((sum, profit) => sum + Math.max(profit.netProfit, 0), 0);
  const goodCampaigns = campaignProfits.filter((profit) => profit.status === "GOOD").length;

  return [
    {
      label: "ยอดขายวันนี้",
      value: formatBaht(products.reduce((sum, p) => sum + p.sellingPrice * Math.min(p.stock, 5), 0)),
      tone: "blue",
      helper: "ประมาณการจาก SKU",
    },
    {
      label: "กำไรวันนี้",
      value: formatBaht(todayProfit),
      tone: "green",
      helper: "หลังหักต้นทุนหลัก",
    },
    {
      label: "SKU เสี่ยง",
      value: `${riskSkuCount}`,
      tone: "yellow",
      helper: "ต่ำกว่าเกณฑ์กำไร",
    },
    {
      label: "แคมเปญแนะนำ",
      value: `${goodCampaigns}`,
      tone: "green",
      helper: "ผ่าน Manual Mode",
    },
    {
      label: "แคมเปญอันตราย",
      value: `${dangerousCampaigns}`,
      tone: "red",
      helper: "ควรปฏิเสธ",
    },
    {
      label: "สินค้าสต็อกต่ำ",
      value: `${lowStockProducts}`,
      tone: "yellow",
      helper: "เหลือน้อยกว่า 10 ชิ้น",
    },
    {
      label: "รออนุมัติ",
      value: `${campaigns.length}`,
      tone: "blue",
      helper: "ต้องกด Approve/Reject/Watch",
    },
  ];
}
