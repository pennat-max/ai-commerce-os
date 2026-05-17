import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";
import type { Campaign, Product } from "@/types/domain";

export type ProfitSuggestion = {
  id: string;
  priority: number;
  title: string;
  description: string;
  currentLabel?: string;
  suggestedLabel?: string;
  impactBaht?: number;
};

export type CampaignProfitAdvice = {
  status: "GOOD" | "WARNING" | "DANGER";
  summary: string;
  netProfit: number;
  marginPercent: number;
  minProfit: number;
  minMarginPercent: number;
  profitGap: number;
  marginGap: number;
  suggestions: ProfitSuggestion[];
};

type ProfitInputs = {
  revenueRate: number;
  fixedProductCosts: number;
  campaignDiscount: number;
  shopVoucher: number;
  coinsCashback: number;
  shippingSubsidy: number;
  totalCampaignCosts: number;
};

function getProfitInputs(product: Product, campaign: Campaign): ProfitInputs {
  const campaignDiscount = campaign.campaignDiscount;
  const shopVoucher = campaign.shopVoucher;
  const coinsCashback = campaign.coinsCashback;
  const shippingSubsidy = campaign.shippingSubsidy;
  const revenueRate =
    1 - product.platformFeePercent / 100 - product.affiliateCommissionPercent / 100;

  return {
    revenueRate,
    fixedProductCosts: product.cost + product.adsCost + product.packagingCost + product.otherCost,
    campaignDiscount,
    shopVoucher,
    coinsCashback,
    shippingSubsidy,
    totalCampaignCosts: campaignDiscount + shopVoucher + coinsCashback + shippingSubsidy,
  };
}

function netProfitAt(
  sellingPrice: number,
  inputs: ProfitInputs,
  campaignCosts: number,
): number {
  return sellingPrice * inputs.revenueRate - inputs.fixedProductCosts - campaignCosts;
}

function requiredSellingPriceForProfit(
  minProfit: number,
  inputs: ProfitInputs,
  campaignCosts: number,
): number | null {
  if (inputs.revenueRate <= 0) return null;
  return (minProfit + inputs.fixedProductCosts + campaignCosts) / inputs.revenueRate;
}

function requiredSellingPriceForMargin(
  minMarginPercent: number,
  inputs: ProfitInputs,
  campaignCosts: number,
): number | null {
  const marginRate = minMarginPercent / 100;
  const denominator = inputs.revenueRate - marginRate;
  if (denominator <= 0) return null;
  return (inputs.fixedProductCosts + campaignCosts) / denominator;
}

function roundBaht(value: number) {
  return Math.ceil(Math.max(0, value));
}

export function analyzeCampaignProfit(product: Product, campaign: Campaign): CampaignProfitAdvice {
  const profit = calculateProfit(product, campaign);
  const inputs = getProfitInputs(product, campaign);

  const profitGap = Math.max(0, product.minProfit - profit.netProfit);
  const marginGap = Math.max(0, product.minMarginPercent - profit.marginPercent);

  if (profit.status === "GOOD") {
    return {
      status: "GOOD",
      summary: "แคมเปญนี้ผ่านเกณฑ์กำไรและ Margin ที่ตั้งไว้แล้ว สามารถเข้าร่วมได้ตามแผน",
      netProfit: profit.netProfit,
      marginPercent: profit.marginPercent,
      minProfit: product.minProfit,
      minMarginPercent: product.minMarginPercent,
      profitGap: 0,
      marginGap: 0,
      suggestions: [
        {
          id: "ok",
          priority: 1,
          title: "ไม่ต้องปรับราคาหรือส่วนลด",
          description: `กำไรสุทธิ ${formatBaht(profit.netProfit)} และ Margin ${formatPercent(profit.marginPercent)} สูงกว่าเป้า`,
        },
      ],
    };
  }

  const suggestions: ProfitSuggestion[] = [];
  const maxAffordableCampaignCost = roundBaht(
    product.sellingPrice * inputs.revenueRate - inputs.fixedProductCosts - product.minProfit,
  );
  const campaignCostGap = roundBaht(inputs.totalCampaignCosts - maxAffordableCampaignCost);

  const priceForProfit = requiredSellingPriceForProfit(
    product.minProfit,
    inputs,
    inputs.totalCampaignCosts,
  );
  const priceForMargin = requiredSellingPriceForMargin(
    product.minMarginPercent,
    inputs,
    inputs.totalCampaignCosts,
  );

  const targetPrice = Math.max(priceForProfit ?? 0, priceForMargin ?? 0);
  const priceIncrease = roundBaht(targetPrice - product.sellingPrice);

  if (campaignCostGap > 0) {
    if (inputs.campaignDiscount > 0) {
      const reduceDiscount = Math.min(inputs.campaignDiscount, Math.ceil(campaignCostGap * 0.5));
      const newDiscount = Math.max(0, inputs.campaignDiscount - reduceDiscount);
      const newProfit = netProfitAt(
        product.sellingPrice,
        inputs,
        inputs.totalCampaignCosts - reduceDiscount,
      );
      suggestions.push({
        id: "reduce-discount",
        priority: 1,
        title: "ลดส่วนลดแคมเปญ",
        description: `ลดส่วนลดลง ${formatBaht(reduceDiscount)} กำไรจะขึ้นเป็น ${formatBaht(newProfit)}`,
        currentLabel: formatBaht(inputs.campaignDiscount),
        suggestedLabel: formatBaht(newDiscount),
        impactBaht: newProfit - profit.netProfit,
      });
    }

    if (inputs.shopVoucher > 0) {
      const reduceVoucher = Math.min(
        inputs.shopVoucher,
        Math.ceil(campaignCostGap * 0.25),
      );
      const newVoucher = Math.max(0, inputs.shopVoucher - reduceVoucher);
      suggestions.push({
        id: "reduce-voucher",
        priority: 2,
        title: "ลด Voucher ร้าน",
        description: `ลด voucher ลง ${formatBaht(reduceVoucher)} เพื่อเพิ่มกำไรสุทธิ`,
        currentLabel: formatBaht(inputs.shopVoucher),
        suggestedLabel: formatBaht(newVoucher),
        impactBaht: reduceVoucher,
      });
    }

    if (inputs.coinsCashback > 0) {
      const reduceCoins = Math.min(inputs.coinsCashback, Math.ceil(campaignCostGap * 0.15));
      suggestions.push({
        id: "reduce-coins",
        priority: 3,
        title: "ลด Coins / Cashback",
        description: `ลด coins/cashback ลง ${formatBaht(reduceCoins)}`,
        currentLabel: formatBaht(inputs.coinsCashback),
        suggestedLabel: formatBaht(Math.max(0, inputs.coinsCashback - reduceCoins)),
        impactBaht: reduceCoins,
      });
    }

    if (inputs.shippingSubsidy > 0) {
      const reduceShip = Math.min(inputs.shippingSubsidy, Math.ceil(campaignCostGap * 0.1));
      suggestions.push({
        id: "reduce-shipping",
        priority: 4,
        title: "ลดส่วนลดค่าส่ง",
        description: `ลดส่วนลดค่าส่งลง ${formatBaht(reduceShip)}`,
        currentLabel: formatBaht(inputs.shippingSubsidy),
        suggestedLabel: formatBaht(Math.max(0, inputs.shippingSubsidy - reduceShip)),
        impactBaht: reduceShip,
      });
    }

    suggestions.push({
      id: "max-campaign-budget",
      priority: 5,
      title: "งบส่วนลดรวมสูงสุดที่แนะนำ",
      description: `ถ้าไม่เปลี่ยนราคาขาย ส่วนลด+Voucher+Coins+ค่าส่งรวมไม่ควรเกิน ${formatBaht(maxAffordableCampaignCost)} (ตอนนี้ ${formatBaht(inputs.totalCampaignCosts)})`,
      currentLabel: formatBaht(inputs.totalCampaignCosts),
      suggestedLabel: formatBaht(maxAffordableCampaignCost),
      impactBaht: campaignCostGap,
    });
  }

  if (priceIncrease > 0 && targetPrice > 0) {
    const newProfit = netProfitAt(targetPrice, inputs, inputs.totalCampaignCosts);
    const increasePercent =
      product.sellingPrice > 0 ? (priceIncrease / product.sellingPrice) * 100 : 0;

    suggestions.push({
      id: "increase-price",
      priority: campaignCostGap > 0 ? 6 : 1,
      title: "เพิ่มราคาขาย",
      description: `เพิ่มราคาขาย ${formatBaht(priceIncrease)} (+${increasePercent.toFixed(1)}%) เพื่อให้ถึงเป้ากำไร/Margin`,
      currentLabel: formatBaht(product.sellingPrice),
      suggestedLabel: formatBaht(roundBaht(targetPrice)),
      impactBaht: newProfit - profit.netProfit,
    });
  }

  if (campaignCostGap > 0 && priceIncrease > 0) {
    const comboDiscountCut = Math.ceil(campaignCostGap * 0.6);
    const comboPrice = roundBaht(
      (product.minProfit +
        inputs.fixedProductCosts +
        (inputs.totalCampaignCosts - comboDiscountCut)) /
        inputs.revenueRate,
    );
    const comboPriceIncrease = Math.max(0, comboPrice - product.sellingPrice);

    if (comboPriceIncrease < priceIncrease) {
      suggestions.push({
        id: "combo",
        priority: 7,
        title: "แนวทางผสม (แนะนำ)",
        description: `ลดส่วนลดรวมประมาณ ${formatBaht(comboDiscountCut)} และเพิ่มราคาขาย ${formatBaht(comboPriceIncrease)} — มักทำได้จริงกว่าเพิ่มราคาอย่างเดียว`,
        suggestedLabel: `ส่วนลดรวม ~${formatBaht(inputs.totalCampaignCosts - comboDiscountCut)} · ราคา ${formatBaht(comboPrice)}`,
      });
    }
  }

  if (product.adsCost > product.minProfit * 0.3 && profit.netProfit < product.minProfit) {
    suggestions.push({
      id: "review-ads",
      priority: 8,
      title: "ทบทวนค่า Ads",
      description: `ค่า Ads ${formatBaht(product.adsCost)} กินกำไรมาก ลองลดงบโฆษณาช่วงแคมเปญหรือเลือก keyword ที่ ROAS ดีกว่า`,
    });
  }

  suggestions.sort((a, b) => a.priority - b.priority);

  const summary =
    profit.status === "DANGER"
      ? `แคมเปญนี้เสี่ยงขาดทุน (ขาด ${formatBaht(profitGap)}) — ควรปรับส่วนลดหรือราคาก่อนอนุมัติ`
      : `กำไรต่ำกว่าเป้า ${formatBaht(profitGap)} และ Margin ต่ำกว่าเป้า ${marginGap.toFixed(1)}%`;

  return {
    status: profit.status,
    summary,
    netProfit: profit.netProfit,
    marginPercent: profit.marginPercent,
    minProfit: product.minProfit,
    minMarginPercent: product.minMarginPercent,
    profitGap,
    marginGap,
    suggestions,
  };
}
