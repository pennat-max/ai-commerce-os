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
import { type OrderPipelineStatus } from "@/lib/operations-mock";
import { calculateOperationsAnalytics } from "@/lib/operations-analytics";
import { buildOrderPipelineCounts, listOrders, listReturnCases } from "@/lib/operations-repository";

function pipelineIcon(status: OrderPipelineStatus) {
  if (status === "มีปัญหา") return AlertTriangle;
  if (status === "ส่งสำเร็จ") return PackageCheck;
  if (status === "กำลังจัดส่ง" || status === "ขนส่งรับแล้ว") return Truck;
  if (status === "กำลังแพ็ก" || status === "พร้อมส่ง") return PackageOpen;
  return ClipboardList;
}

export default async function OrdersPage() {
  const [{ data: orders }, { data: returnCases }] = await Promise.all([
    listOrders(),
    listReturnCases(),
  ]);
  const pipelineCounts = buildOrderPipelineCounts(orders);
  const analytics = calculateOperationsAnalytics(orders, returnCases);

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
            <KpiCard label="รอแพ็ก" value={`${analytics.pendingPackOrders}`} helper="ควรเคลียร์ก่อนเที่ยง" tone="amber" />
            <KpiCard label="พร้อมส่ง" value={`${analytics.readyToShipOrders}`} helper="รอขนส่งรับ" tone="emerald" />
            <KpiCard label="มีปัญหา" value={`${analytics.issueOrders}`} helper="ต้องติดตามวันนี้" tone="rose" />
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

        <PremiumSection title="วิเคราะห์งานวันนี้" helper="คำนวณจากออเดอร์ งานแพ็ก เคสคืน และเคลมในระบบ">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <KpiCard
              label="ส่งสำเร็จ"
              value={`${analytics.completionRate.toFixed(0)}%`}
              helper={`${analytics.deliveredOrders}/${analytics.totalOrders} ออเดอร์`}
              tone="emerald"
              icon={PackageCheck}
            />
            <KpiCard
              label="งานเปิดอยู่"
              value={`${analytics.workloadScore}`}
              helper="รวมแพ็ก พร้อมส่ง คืน/เคลม"
              tone="sky"
              icon={ClipboardList}
            />
            <KpiCard
              label="คืน/เคลม"
              value={`฿${analytics.totalCostImpact.toLocaleString("th-TH")}`}
              helper={`${analytics.openReturnCases + analytics.openClaimCases} เคสยังไม่จบ`}
              tone={analytics.healthTone}
              icon={RotateCcw}
            />
            <KpiCard
              label="อัตราเสี่ยง"
              value={`${analytics.issueRate.toFixed(0)}%`}
              helper="ออเดอร์ปัญหา + เคสเปิด"
              tone={analytics.healthTone}
              icon={AlertTriangle}
            />
          </div>
        </PremiumSection>

        <PremiumSection title="AI operations insight" helper="สัญญาณที่ควรดูวันนี้ก่อนงานแพ็กสะสม">
          <div className="grid gap-3 md:grid-cols-2">
            {analytics.insights.map((insight) => (
              <PremiumFeedCard
                key={insight.id}
                icon={AlertTriangle}
                title={insight.title}
                description={insight.description}
                tone={insight.tone}
                href={insight.href}
              />
            ))}
          </div>
        </PremiumSection>

        <PremiumSection title="ออเดอร์ล่าสุด" helper="การ์ดใหญ่ อ่านง่าย และกดไปทำงานต่อได้ทันที">
          <OrderOperationsBoard orders={orders} />
        </PremiumSection>
      </div>
    </AppShell>
  );
}
