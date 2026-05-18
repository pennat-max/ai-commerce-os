import { orderPipeline, type MockOrder, type MockReturnCase } from "@/lib/operations-mock";
import { listOrders, listReturnCases, packingStatuses, type OperationsResult } from "@/lib/operations-repository";

export type OperationsAnalyticsTone = "emerald" | "sky" | "amber" | "rose" | "violet" | "slate";

export type OperationsInsight = {
  id: string;
  title: string;
  description: string;
  tone: OperationsAnalyticsTone;
  href: string;
};

export type OperationsAnalytics = {
  totalOrders: number;
  pendingPackOrders: number;
  readyToShipOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  issueOrders: number;
  returnCases: number;
  claimCases: number;
  openReturnCases: number;
  openClaimCases: number;
  returnCostImpact: number;
  claimCostImpact: number;
  totalCostImpact: number;
  completionRate: number;
  issueRate: number;
  workloadScore: number;
  healthTone: OperationsAnalyticsTone;
  insights: OperationsInsight[];
};

const readyStatus = orderPipeline[3];
const carrierCollectedStatus = orderPipeline[4];
const inTransitStatus = orderPipeline[5];
const deliveredStatus = orderPipeline[6];
const issueStatus = orderPipeline[7];
const restockedStatusLabel = "คืนเข้า stock แล้ว";

function percent(part: number, total: number) {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

function isClaimCase(item: MockReturnCase) {
  return item.caseNumber.toUpperCase().startsWith("CLM");
}

function isOpenCase(item: MockReturnCase) {
  return item.status !== restockedStatusLabel;
}

function buildOperationsInsights(analytics: Omit<OperationsAnalytics, "insights">): OperationsInsight[] {
  const insights: OperationsInsight[] = [];

  if (analytics.issueOrders > 0 || analytics.openClaimCases > 0) {
    insights.push({
      id: "claim-risk",
      title: "มีงานเสี่ยงที่ควรดูทันที",
      description: `พบออเดอร์มีปัญหา ${analytics.issueOrders} รายการ และเคลมเปิดอยู่ ${analytics.openClaimCases} เคส ควรเช็กหลักฐานกับสถานะขนส่งก่อนแพ็กล็อตถัดไป`,
      tone: "rose",
      href: "/app/orders/returns",
    });
  }

  if (analytics.pendingPackOrders > analytics.readyToShipOrders + 2) {
    insights.push({
      id: "packing-load",
      title: "คิวแพ็กเริ่มแน่น",
      description: `ยังมีออเดอร์รอแพ็ก ${analytics.pendingPackOrders} รายการ มากกว่าพร้อมส่ง แนะนำเริ่มจากงานด่วนและงานที่ใกล้เลยเวลา`,
      tone: "amber",
      href: "/app/orders/packing",
    });
  }

  if (analytics.totalCostImpact > 0) {
    insights.push({
      id: "return-cost",
      title: "ต้นทุนคืนและเคลมต้องคุมใกล้ชิด",
      description: `ผลกระทบรวมจากคืน/เคลมอยู่ที่ ฿${analytics.totalCostImpact.toLocaleString("th-TH")} แยกดูเคสที่ยังไม่จบเพื่อลดต้นทุนซ้ำ`,
      tone: analytics.totalCostImpact >= 500 ? "rose" : "amber",
      href: "/app/orders/returns",
    });
  }

  if (analytics.completionRate >= 70 && analytics.issueRate <= 15) {
    insights.push({
      id: "healthy-flow",
      title: "งานหน้าร้านไหลดี",
      description: `ส่งสำเร็จ ${analytics.completionRate.toFixed(0)}% และเคสเสี่ยงยังคุมได้ เหมาะกับการดันแคมเปญที่มีสต็อกพร้อม`,
      tone: "emerald",
      href: "/app/opportunities",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "normal-flow",
      title: "ยังไม่มีสัญญาณเร่งด่วน",
      description: "คิวออเดอร์และเคสคืน/เคลมอยู่ในระดับปกติ ใช้หน้านี้ติดตามงานระหว่างวันได้เลย",
      tone: "sky",
      href: "/app/orders",
    });
  }

  return insights.slice(0, 4);
}

export function calculateOperationsAnalytics(
  orders: MockOrder[],
  returnCases: MockReturnCase[],
): OperationsAnalytics {
  const pendingPackOrders = orders.filter((order) => packingStatuses.has(order.status)).length;
  const readyToShipOrders = orders.filter((order) => order.status === readyStatus).length;
  const shippingOrders = orders.filter(
    (order) => order.status === carrierCollectedStatus || order.status === inTransitStatus,
  ).length;
  const deliveredOrders = orders.filter((order) => order.status === deliveredStatus).length;
  const issueOrders = orders.filter((order) => order.status === issueStatus).length;
  const claimItems = returnCases.filter(isClaimCase);
  const returnItems = returnCases.filter((item) => !isClaimCase(item));
  const openClaimCases = claimItems.filter(isOpenCase).length;
  const openReturnCases = returnItems.filter(isOpenCase).length;
  const returnCostImpact = returnItems.reduce((sum, item) => sum + item.costImpact, 0);
  const claimCostImpact = claimItems.reduce((sum, item) => sum + item.costImpact, 0);
  const totalOrders = orders.length;
  const totalCostImpact = returnCostImpact + claimCostImpact;
  const completionRate = percent(deliveredOrders, totalOrders);
  const issueRate = percent(issueOrders + openClaimCases + openReturnCases, Math.max(totalOrders, 1));
  const workloadScore = pendingPackOrders + readyToShipOrders + openReturnCases + openClaimCases;
  const healthTone: OperationsAnalyticsTone =
    issueRate >= 35 || totalCostImpact >= 1000 ? "rose" : pendingPackOrders >= 4 || issueRate >= 18 ? "amber" : "emerald";
  const analyticsWithoutInsights = {
    totalOrders,
    pendingPackOrders,
    readyToShipOrders,
    shippingOrders,
    deliveredOrders,
    issueOrders,
    returnCases: returnItems.length,
    claimCases: claimItems.length,
    openReturnCases,
    openClaimCases,
    returnCostImpact,
    claimCostImpact,
    totalCostImpact,
    completionRate,
    issueRate,
    workloadScore,
    healthTone,
  };

  return {
    ...analyticsWithoutInsights,
    insights: buildOperationsInsights(analyticsWithoutInsights),
  };
}

export async function getOperationsAnalytics(
  organizationId?: string,
): Promise<OperationsResult<OperationsAnalytics>> {
  const [ordersResult, returnCasesResult] = await Promise.all([
    listOrders(organizationId),
    listReturnCases(organizationId),
  ]);

  return {
    data: calculateOperationsAnalytics(ordersResult.data, returnCasesResult.data),
    source: ordersResult.source === "supabase" && returnCasesResult.source === "supabase" ? "supabase" : "mock",
    error: ordersResult.error ?? returnCasesResult.error,
  };
}
