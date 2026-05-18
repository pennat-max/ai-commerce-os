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
  PremiumFeedCard,
  PremiumIntro,
  PremiumSection,
} from "@/components/premium-mobile";
import { OrderOperationsBoard } from "@/components/order-operations-board";
import {
  getOperationsInsights,
  getOrderPipelineCounts,
  mockOrders,
  type OrderPipelineStatus,
} from "@/lib/operations-mock";

function pipelineIcon(status: OrderPipelineStatus) {
  if (status === "มีปัญหา") return AlertTriangle;
  if (status === "ส่งสำเร็จ") return PackageCheck;
  if (status === "กำลังจัดส่ง" || status === "ขนส่งรับแล้ว") return Truck;
  if (status === "กำลังแพ็ก" || status === "พร้อมส่ง") return PackageOpen;
  return ClipboardList;
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
          <OrderOperationsBoard orders={mockOrders} />
        </PremiumSection>
      </div>
    </AppShell>
  );
}
