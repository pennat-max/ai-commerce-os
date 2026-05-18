export type OrderPipelineStatus =
  | "รอพิมพ์ใบ"
  | "รอหยิบของ"
  | "กำลังแพ็ก"
  | "พร้อมส่ง"
  | "ขนส่งรับแล้ว"
  | "กำลังจัดส่ง"
  | "ส่งสำเร็จ"
  | "มีปัญหา";

export type ReturnCaseStatus =
  | "ลูกค้าไม่รับสินค้า"
  | "สินค้าตีกลับ"
  | "เคลมสินค้าเสียหาย"
  | "ส่งผิดสินค้า"
  | "ขอคืนเงิน"
  | "รอคืนเข้าสต็อก"
  | "คืนเข้า stock แล้ว"
  | "เสียหายขายต่อไม่ได้";

export type OperationPlatform = "Shopee" | "Lazada" | "TikTok Shop";

export type MockOrder = {
  id: string;
  orderNumber: string;
  platform: OperationPlatform;
  customer: string;
  product: string;
  sku: string;
  qty: number;
  status: OrderPipelineStatus;
  trackingNumber: string;
  carrier: "Kerry" | "J&T" | "Flash" | "Thailand Post";
  paidAt: string;
  packBy: string;
  note: string;
  priority: "ปกติ" | "ด่วน" | "เสี่ยง";
};

export type MockReturnCase = {
  id: string;
  caseNumber: string;
  orderNumber: string;
  customer: string;
  platform: OperationPlatform;
  reason: ReturnCaseStatus;
  status: ReturnCaseStatus;
  costImpact: number;
  evidenceLabel: string;
  suggestedAction: string;
  updatedAt: string;
};

export const orderPipeline: OrderPipelineStatus[] = [
  "รอพิมพ์ใบ",
  "รอหยิบของ",
  "กำลังแพ็ก",
  "พร้อมส่ง",
  "ขนส่งรับแล้ว",
  "กำลังจัดส่ง",
  "ส่งสำเร็จ",
  "มีปัญหา",
];

export const mockOrders: MockOrder[] = [
  {
    id: "order-1001",
    orderNumber: "SPX-240518-001",
    platform: "Shopee",
    customer: "คุณฝน",
    product: "โคมไฟ LED ตั้งโต๊ะ",
    sku: "HOME-LED-01",
    qty: 1,
    status: "รอพิมพ์ใบ",
    trackingNumber: "TH2405180001",
    carrier: "Kerry",
    paidAt: "09:12",
    packBy: "11:30",
    note: "แพ็กกันกระแทกเพิ่ม ลูกค้าเป็นของขวัญ",
    priority: "ด่วน",
  },
  {
    id: "order-1002",
    orderNumber: "LZD-240518-014",
    platform: "Lazada",
    customer: "คุณแทน",
    product: "กล่องเก็บของพับได้",
    sku: "HOME-BOX-02",
    qty: 2,
    status: "รอหยิบของ",
    trackingNumber: "LZ2405180220",
    carrier: "Flash",
    paidAt: "09:38",
    packBy: "12:00",
    note: "หยิบสีครีม 2 ใบจากชั้น B2",
    priority: "ปกติ",
  },
  {
    id: "order-1003",
    orderNumber: "TTS-240518-021",
    platform: "TikTok Shop",
    customer: "คุณเมย์",
    product: "ชุดม็อบไมโครไฟเบอร์",
    sku: "HOME-MOP-03",
    qty: 1,
    status: "กำลังแพ็ก",
    trackingNumber: "JT2405189301",
    carrier: "J&T",
    paidAt: "10:05",
    packBy: "11:00",
    note: "ตรวจหัวม็อบให้ครบ 2 ชิ้นก่อนปิดกล่อง",
    priority: "เสี่ยง",
  },
  {
    id: "order-1004",
    orderNumber: "SPX-240518-033",
    platform: "Shopee",
    customer: "คุณบี",
    product: "ชั้นวางของล้อเลื่อน",
    sku: "HOME-RACK-04",
    qty: 1,
    status: "พร้อมส่ง",
    trackingNumber: "TH2405180033",
    carrier: "Thailand Post",
    paidAt: "10:44",
    packBy: "13:00",
    note: "วางจุดรอรับรอบบ่าย",
    priority: "ปกติ",
  },
  {
    id: "order-1005",
    orderNumber: "LZD-240517-078",
    platform: "Lazada",
    customer: "คุณก้อง",
    product: "โคมไฟ LED ตั้งโต๊ะ",
    sku: "HOME-LED-01",
    qty: 3,
    status: "ขนส่งรับแล้ว",
    trackingNumber: "LZ2405170780",
    carrier: "Kerry",
    paidAt: "เมื่อวาน",
    packBy: "เสร็จแล้ว",
    note: "รอระบบขนส่งอัปเดตสถานะ",
    priority: "ปกติ",
  },
  {
    id: "order-1006",
    orderNumber: "TTS-240517-092",
    platform: "TikTok Shop",
    customer: "คุณแอน",
    product: "กล่องเก็บของพับได้",
    sku: "HOME-BOX-02",
    qty: 1,
    status: "กำลังจัดส่ง",
    trackingNumber: "JT2405170920",
    carrier: "J&T",
    paidAt: "เมื่อวาน",
    packBy: "เสร็จแล้ว",
    note: "ปลายทางต่างจังหวัด คาดถึงพรุ่งนี้",
    priority: "ปกติ",
  },
  {
    id: "order-1007",
    orderNumber: "SPX-240516-120",
    platform: "Shopee",
    customer: "คุณน้ำ",
    product: "ชุดม็อบไมโครไฟเบอร์",
    sku: "HOME-MOP-03",
    qty: 1,
    status: "ส่งสำเร็จ",
    trackingNumber: "TH2405160120",
    carrier: "Flash",
    paidAt: "16 พ.ค.",
    packBy: "เสร็จแล้ว",
    note: "ลูกค้าให้คะแนน 5 ดาว",
    priority: "ปกติ",
  },
  {
    id: "order-1008",
    orderNumber: "LZD-240516-131",
    platform: "Lazada",
    customer: "คุณพลอย",
    product: "ชั้นวางของล้อเลื่อน",
    sku: "HOME-RACK-04",
    qty: 1,
    status: "มีปัญหา",
    trackingNumber: "LZ2405161310",
    carrier: "J&T",
    paidAt: "16 พ.ค.",
    packBy: "เลยเวลา",
    note: "ลูกค้าแจ้งได้รับสินค้าผิดสี",
    priority: "เสี่ยง",
  },
];

export const mockReturnCases: MockReturnCase[] = [
  {
    id: "return-1",
    caseNumber: "RTN-240518-01",
    orderNumber: "LZD-240516-131",
    customer: "คุณพลอย",
    platform: "Lazada",
    reason: "ส่งผิดสินค้า",
    status: "ส่งผิดสินค้า",
    costImpact: 180,
    evidenceLabel: "รูปกล่องและสีสินค้า",
    suggestedAction: "ขอรูปเพิ่มและเตรียมส่งสีที่ถูกต้อง พร้อมบันทึก SKU ที่หยิบผิด",
    updatedAt: "วันนี้ 10:20",
  },
  {
    id: "return-2",
    caseNumber: "RTN-240518-02",
    orderNumber: "SPX-240515-088",
    customer: "คุณมุก",
    platform: "Shopee",
    reason: "ลูกค้าไม่รับสินค้า",
    status: "สินค้าตีกลับ",
    costImpact: 62,
    evidenceLabel: "สถานะขนส่งตีกลับ",
    suggestedAction: "รอตีกลับถึงคลังแล้วตรวจกล่องก่อนคืนเข้าสต็อก",
    updatedAt: "วันนี้ 09:48",
  },
  {
    id: "return-3",
    caseNumber: "CLM-240517-04",
    orderNumber: "TTS-240514-041",
    customer: "คุณออม",
    platform: "TikTok Shop",
    reason: "เคลมสินค้าเสียหาย",
    status: "เคลมสินค้าเสียหาย",
    costImpact: 320,
    evidenceLabel: "วิดีโอเปิดกล่อง",
    suggestedAction: "แยกเคสเคลมขนส่ง และส่งคูปองชดเชยให้ลูกค้าในเดโม",
    updatedAt: "เมื่อวาน 17:35",
  },
  {
    id: "return-4",
    caseNumber: "RTN-240516-07",
    orderNumber: "SPX-240513-072",
    customer: "คุณเจ",
    platform: "Shopee",
    reason: "ขอคืนเงิน",
    status: "รอคืนเข้าสต็อก",
    costImpact: 95,
    evidenceLabel: "ใบคืนสินค้า",
    suggestedAction: "ตรวจสภาพสินค้า ถ้ากล่องสมบูรณ์ให้คืนเข้าสต็อก",
    updatedAt: "16 พ.ค. 15:10",
  },
  {
    id: "return-5",
    caseNumber: "RTN-240515-03",
    orderNumber: "LZD-240512-031",
    customer: "คุณอิง",
    platform: "Lazada",
    reason: "สินค้าตีกลับ",
    status: "คืนเข้า stock แล้ว",
    costImpact: 40,
    evidenceLabel: "รูปสินค้าหลังตรวจ",
    suggestedAction: "พร้อมขายต่อ แต่ควรเปลี่ยนกล่องแพ็กใหม่",
    updatedAt: "15 พ.ค. 13:22",
  },
  {
    id: "return-6",
    caseNumber: "CLM-240514-02",
    orderNumber: "TTS-240511-019",
    customer: "คุณแพร",
    platform: "TikTok Shop",
    reason: "เคลมสินค้าเสียหาย",
    status: "เสียหายขายต่อไม่ได้",
    costImpact: 480,
    evidenceLabel: "รูปแตกหักจากลูกค้า",
    suggestedAction: "ตัดสต็อกเสียหายและบันทึกเป็นต้นทุนเคลม",
    updatedAt: "14 พ.ค. 18:05",
  },
];

export function getOrderPipelineCounts() {
  return orderPipeline.map((status) => ({
    status,
    count: mockOrders.filter((order) => order.status === status).length,
  }));
}

export function getPackingQueue() {
  return mockOrders.filter((order) =>
    ["รอพิมพ์ใบ", "รอหยิบของ", "กำลังแพ็ก", "พร้อมส่ง"].includes(order.status),
  );
}

export function getOperationsInsights() {
  const latePacking = mockOrders.filter((order) => order.packBy === "เลยเวลา" || order.priority === "เสี่ยง");
  const refusedCases = mockReturnCases.filter((item) => item.reason === "ลูกค้าไม่รับสินค้า");
  const frequentClaimSku = "HOME-MOP-03";
  const slowCarrier = "J&T";

  return [
    {
      id: "late-packing",
      title: "ออเดอร์เลยเวลาแพ็ก",
      description: `พบ ${latePacking.length} รายการที่ควรตรวจทันที โดยเฉพาะออเดอร์เสี่ยงจาก TikTok และ Lazada`,
      tone: "rose" as const,
    },
    {
      id: "refused",
      title: "ลูกค้าไม่รับสินค้าเพิ่มขึ้น",
      description: `${refusedCases.length} เคสตีกลับจากลูกค้าไม่รับสินค้า ควรเช็ก COD และข้อความยืนยันก่อนส่ง`,
      tone: "amber" as const,
    },
    {
      id: "sku-claim",
      title: "SKU นี้ถูกเคลมบ่อย",
      description: `${frequentClaimSku} มีเคสเสียหายและส่งผิด ควรเพิ่มขั้นตอนถ่ายรูปก่อนปิดกล่อง`,
      tone: "violet" as const,
    },
    {
      id: "slow-carrier",
      title: "ขนส่งนี้ส่งช้ากว่าปกติ",
      description: `${slowCarrier} มีทั้งเคสล่าช้าและเคลมเสียหาย ควรแยกติดตามรายวัน`,
      tone: "sky" as const,
    },
  ];
}
