import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  PackageCheck,
  PackageOpen,
  RotateCcw,
  ScanLine,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  KpiCard,
  PremiumChip,
  PremiumFeedCard,
  PremiumIntro,
  PremiumSection,
  type PremiumTone,
} from "@/components/premium-mobile";
import {
  getOperationsInsights,
  getOrderPipelineCounts,
  mockOrders,
  type MockOrder,
  type OperationPlatform,
  type OrderPipelineStatus,
} from "@/lib/operations-mock";

const statusTone: Record<OrderPipelineStatus, PremiumTone> = {
  "รอพิมพ์ใบ": "amber",
  "รอหยิบของ": "sky",
  "กำลังแพ็ก": "violet",
  "พร้อมส่ง": "emerald",
  "ขนส่งรับแล้ว": "slate",
  "กำลังจัดส่ง": "sky",
  "ส่งสำเร็จ": "emerald",
  "มีปัญหา": "rose",
};

const platformClass: Record<OperationPlatform, string> = {
  Shopee: "bg-orange-50 text-orange-700 ring-orange-100",
  Lazada: "bg-violet-50 text-violet-700 ring-violet-100",
  "TikTok Shop": "bg-slate-950 text-white ring-slate-200",
};

function pipelineIcon(status: OrderPipelineStatus) {
  if (status === "มีปัญหา") return AlertTriangle;
  if (status === "ส่งสำเร็จ") return PackageCheck;
  if (status === "กำลังจัดส่ง" || status === "ขนส่งรับแล้ว") return Truck;
  if (status === "กำลังแพ็ก" || status === "พร้อมส่ง") return PackageOpen;
  return ClipboardList;
}

function OrderCard({ order }: { order: MockOrder }) {
  const Icon = pipelineIcon(order.status);
  const needsPacking = ["รอพิมพ์ใบ", "รอหยิบของ", "กำลังแพ็ก", "พร้อมส่ง"].includes(order.status);
  const hasIssue = order.status === "มีปัญหา";

  return (
    <PremiumFeedCard
      icon={Icon}
      title={order.orderNumber}
      description={`${order.customer} · ${order.product} · จำนวน ${order.qty} ชิ้น`}
      tone={statusTone[order.status]}
      badge={<PremiumChip tone={statusTone[order.status]}>{order.status}</PremiumChip>}
    >
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${platformClass[order.platform]}`}>
          {order.platform}
        </span>
        <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-100">
          SKU {order.sku}
        </span>
        <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-100">
          {order.carrier}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
          <p className="text-xs font-black text-slate-500">Tracking</p>
          <p className="mt-1 break-all text-sm font-black text-slate-950">{order.trackingNumber}</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
          <p className="text-xs font-black text-slate-500">กำหนดแพ็ก</p>
          <p className="mt-1 text-sm font-black text-slate-950">{order.packBy}</p>
        </div>
      </div>

      <p className="mt-3 rounded-2xl border border-white/80 bg-white/75 p-3 text-xs font-bold leading-5 text-slate-600 shadow-sm">
        {order.note}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/app/orders/packing?order=${encodeURIComponent(order.orderNumber)}`}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-center text-sm font-black shadow-sm ${
            needsPacking ? "bg-emerald-700 text-white" : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          <ScanLine size={17} />
          {needsPacking ? "แพ็กต่อ" : "ตรวจแพ็ก"}
        </Link>
        <Link
          href={hasIssue ? "/app/orders/returns" : "/app/orders"}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-center text-sm font-black shadow-sm ${
            hasIssue ? "bg-rose-600 text-white" : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          {hasIssue ? <RotateCcw size={17} /> : <Truck size={17} />}
          {hasIssue ? "เปิดเคส" : "ดูสถานะ"}
        </Link>
      </div>
    </PremiumFeedCard>
  );
}

export default function OrdersPage() {
  const pipelineCounts = getOrderPipelineCounts();
  const readyCount = mockOrders.filter((order) => order.status === "พร้อมส่ง").length;
  const problemCount = mockOrders.filter((order) => order.status === "มีปัญหา").length;
  const packingCount = mockOrders.filter((order) =>
    ["รอพิมพ์ใบ", "รอหยิบของ", "กำลังแพ็ก"].includes(order.status),
  ).length;
  const insights = getOperationsInsights();

  return (
    <AppShell
      title="จัดการออเดอร์"
      subtitle="คุมงานพิมพ์ใบ หยิบของ แพ็ก ส่งมอบขนส่ง และเคสมีปัญหาแบบเดโม"
    >
      <div className="grid gap-5">
        <PremiumIntro
          eyebrow="Operations cockpit"
          title="เห็นคิวส่งของทั้งร้านในจอเดียว"
          description="เฟสนี้เป็น workflow เดโม ยังไม่เชื่อม Shopee, Lazada, TikTok Shop, ขนส่ง หรือระบบจ่ายเงินจริง"
          icon={PackageCheck}
          tone="emerald"
        >
          <div className="grid grid-cols-3 gap-2">
            <KpiCard label="รอแพ็ก" value={`${packingCount}`} helper="ควรเคลียร์ก่อนเที่ยง" tone="amber" />
            <KpiCard label="พร้อมส่ง" value={`${readyCount}`} helper="รอขนส่งรับ" tone="emerald" />
            <KpiCard label="มีปัญหา" value={`${problemCount}`} helper="ต้องติดตามวันนี้" tone="rose" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/app/orders/packing"
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 text-sm font-black text-white"
            >
              <ScanLine size={17} />
              เริ่มแพ็ก
            </Link>
            <Link
              href="/app/orders/returns"
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700"
            >
              <RotateCcw size={17} />
              เคสคืน/เคลม
            </Link>
          </div>
        </PremiumIntro>

        <PremiumSection title="Pipeline ออเดอร์" helper="สแกนเร็วจากซ้ายไปขวาว่างานติดอยู่ตรงไหน">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {pipelineCounts.map((item) => {
              const Icon = pipelineIcon(item.status);

              return (
                <div
                  key={item.status}
                  className="rounded-[1.25rem] border border-slate-100 bg-white/90 p-3 shadow-sm"
                >
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Icon size={18} />
                  </span>
                  <p className="mt-3 text-xs font-black leading-tight text-slate-600">{item.status}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{item.count}</p>
                </div>
              );
            })}
          </div>
        </PremiumSection>

        <PremiumSection title="AI operations insight" helper="สัญญาณที่ควรดูวันนี้ก่อนงานแพ็กสะสม">
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map((insight) => (
              <PremiumFeedCard
                key={insight.id}
                icon={AlertTriangle}
                title={insight.title}
                description={insight.description}
                tone={insight.tone}
              />
            ))}
          </div>
        </PremiumSection>

        <PremiumSection title="ออเดอร์ล่าสุด" helper="การ์ดใหญ่ อ่านง่าย และกดไปทำงานต่อได้ทันที">
          <div className="grid gap-3 lg:grid-cols-2">
            {mockOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </PremiumSection>
      </div>
    </AppShell>
  );
}
