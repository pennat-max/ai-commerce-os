import type { Campaign, CampaignDecision, DecisionAction, Product } from "@/types/domain";
import { calculateProfit } from "@/lib/profit";

export function recommendCampaignDecision(product: Product, campaign: Campaign) {
  const profit = calculateProfit(product, campaign);

  return {
    recommendation: profit.status,
    reason:
      profit.status === "GOOD"
        ? "กำไรและมาร์จินผ่านเกณฑ์"
        : profit.status === "WARNING"
          ? "ยังมีกำไร แต่ต่ำกว่าเกณฑ์ที่ตั้งไว้"
          : "แคมเปญนี้ทำให้ขาดทุน",
    profit,
  };
}

export function updateCampaignDecision(
  decision: CampaignDecision,
  action: DecisionAction,
): CampaignDecision {
  return {
    ...decision,
    action,
    note:
      action === "approve"
        ? "อนุมัติแบบ Manual Mode"
        : action === "reject"
          ? "ปฏิเสธเพื่อป้องกันกำไรติดลบ"
          : "ติดตามต่อก่อนตัดสินใจ",
  };
}
