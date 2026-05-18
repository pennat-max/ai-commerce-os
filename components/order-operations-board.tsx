"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  PackageCheck,
  PackageOpen,
  RotateCcw,
  ScanLine,
  Truck,
} from "lucide-react";
import {
  PremiumChip,
  PremiumEmptyState,
  PremiumFeedCard,
  PremiumPanel,
  type PremiumTone,
} from "@/components/premium-mobile";
import {
  orderPipeline,
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

function statusAfterAction(action: "print" | "pack" | "ready" | "issue"): OrderPipelineStatus {
  if (action === "print") return "รอหยิบของ";
  if (action === "pack") return "กำลังแพ็ก";
  if (action === "ready") return "พร้อมส่ง";
  return "มีปัญหา";
}

function actionMessage(order: MockOrder, action: "print" | "pack" | "ready" | "issue") {
  if (action === "print") return `${order.orderNumber}: พิมพ์ใบปะหน้าแล้ว ส่งต่อคิวหยิบของ (เดโม)`;
  if (action === "pack") return `${order.orderNumber}: เริ่มแพ็กแล้ว เปิดหน้าสแกนเพื่อเช็ก SKU ได้เลย`;
  if (action === "ready") return `${order.orderNumber}: บันทึกเป็นพร้อมส่งแล้ว รอขนส่งรับรอบถัดไป`;
  return `${order.orderNumber}: แจ้งปัญหาแล้ว ส่งต่อไปศูนย์คืน/เคลมเพื่อติดตาม`;
}

function OrderTimeline({ status }: { status: OrderPipelineStatus }) {
  const activeIndex = orderPipeline.indexOf(status);

  return (
    <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
      <p className="text-xs font-black text-slate-500">Timeline สถานะ</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {orderPipeline.map((item, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;

          return (
            <span
              key={item}
              className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-black ring-1 ${
                active
                  ? "bg-slate-950 text-white ring-slate-950"
                  : done
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                    : "bg-white text-slate-400 ring-slate-100"
              }`}
            >
              {done ? <CheckCircle2 size={13} /> : null}
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  status,
  focused,
  onAction,
}: {
  order: MockOrder;
  status: OrderPipelineStatus;
  focused: boolean;
  onAction: (order: MockOrder, action: "print" | "pack" | "ready" | "issue") => void;
}) {
  const Icon = pipelineIcon(status);

  return (
    <PremiumFeedCard
      icon={Icon}
      title={order.orderNumber}
      description={`${order.customer} · ${order.product} · จำนวน ${order.qty} ชิ้น`}
      tone={statusTone[status]}
      badge={<PremiumChip tone={statusTone[status]}>{status}</PremiumChip>}
    >
      {focused ? (
        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
          เปิดจากเคสคืน/เคลมหรือหน้าสแกนล่าสุด
        </div>
      ) : null}

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

      <OrderTimeline status={status} />

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

      <div className="mt-4 grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 sm:grid-cols-4">
        <button
          type="button"
          data-action="mock-print-label"
          onClick={() => onAction(order, "print")}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-700 shadow-sm sm:text-sm"
        >
          <FileText size={16} />
          พิมพ์ใบ
        </button>
        <Link
          href={`/app/orders/packing?order=${encodeURIComponent(order.orderNumber)}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-2 text-center text-xs font-black text-white shadow-sm sm:text-sm"
          onClick={() => onAction(order, "pack")}
        >
          <ScanLine size={16} />
          เริ่มแพ็ก
        </Link>
        <button
          type="button"
          data-action="mock-ready-to-ship"
          onClick={() => onAction(order, "ready")}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-2 text-xs font-black text-emerald-800 shadow-sm sm:text-sm"
        >
          <Truck size={16} />
          พร้อมส่ง
        </button>
        <button
          type="button"
          data-action="mock-report-issue"
          onClick={() => onAction(order, "issue")}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-2 text-xs font-black text-rose-800 shadow-sm sm:text-sm"
        >
          <RotateCcw size={16} />
          แจ้งปัญหา
        </button>
      </div>
    </PremiumFeedCard>
  );
}

export function OrderOperationsBoard({ orders }: { orders: MockOrder[] }) {
  const searchParams = useSearchParams();
  const focusedOrder = searchParams.get("order") ?? searchParams.get("focus");
  const statusHint = searchParams.get("status");
  const initialReadyOrder = focusedOrder && statusHint === "ready" ? focusedOrder : null;
  const [statusOverrides, setStatusOverrides] = useState<Record<string, OrderPipelineStatus>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const queryNotice = initialReadyOrder
    ? `${initialReadyOrder}: รับสถานะพร้อมส่งจากหน้าแพ็กแล้ว (เดโม)`
    : null;
  const visibleNotice = notice ?? queryNotice;

  const foundFocusedOrder = focusedOrder
    ? orders.some((order) => order.orderNumber === focusedOrder || order.id === focusedOrder)
    : true;
  const visibleOrders = useMemo(() => {
    if (!focusedOrder) return orders;

    return [...orders].sort((a, b) => {
      const aFocused = a.orderNumber === focusedOrder || a.id === focusedOrder;
      const bFocused = b.orderNumber === focusedOrder || b.id === focusedOrder;
      return Number(bFocused) - Number(aFocused);
    });
  }, [focusedOrder, orders]);

  function handleAction(order: MockOrder, action: "print" | "pack" | "ready" | "issue") {
    const nextStatus = statusAfterAction(action);
    setStatusOverrides((current) => ({ ...current, [order.orderNumber]: nextStatus }));
    setNotice(actionMessage(order, action));
  }

  if (orders.length === 0) {
    return (
      <PremiumEmptyState
        title="ยังไม่มีออเดอร์ในคิว"
        description="เมื่อมีออเดอร์ใหม่ ระบบจะแสดงคิวพิมพ์ใบ หยิบของ แพ็ก และส่งมอบขนส่งที่นี่"
        icon={PackageCheck}
      />
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {visibleNotice ? (
        <div className="lg:col-span-2">
          <PremiumPanel tone="emerald" className="px-4 py-3">
            <p className="flex items-start gap-2 text-sm font-black leading-6 text-emerald-800">
              <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
              {visibleNotice}
            </p>
          </PremiumPanel>
        </div>
      ) : null}

      {!foundFocusedOrder ? (
        <div className="lg:col-span-2">
          <PremiumPanel tone="amber" className="px-4 py-3">
            <p className="flex items-start gap-2 text-sm font-black leading-6 text-amber-800">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              ไม่พบออเดอร์ {focusedOrder} ในคิวเดโมปัจจุบัน แสดงรายการออเดอร์ล่าสุดแทน
            </p>
          </PremiumPanel>
        </div>
      ) : null}

      {visibleOrders.map((order) => {
        const queryReady =
          initialReadyOrder === order.orderNumber || initialReadyOrder === order.id
            ? "พร้อมส่ง"
            : null;
        const status = statusOverrides[order.orderNumber] ?? statusOverrides[order.id] ?? queryReady ?? order.status;
        const focused = focusedOrder === order.orderNumber || focusedOrder === order.id;

        return (
          <OrderCard
            key={order.id}
            order={order}
            status={status}
            focused={focused}
            onAction={handleAction}
          />
        );
      })}
    </div>
  );
}
