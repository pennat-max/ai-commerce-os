"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  ScanLine,
  Truck,
} from "lucide-react";
import { PremiumChip, PremiumPanel } from "@/components/premium-mobile";
import { getPackingQueue, mockOrders } from "@/lib/operations-mock";

const checklistItems = [
  "เช็กเลขออเดอร์ตรงกับใบปะหน้า",
  "หยิบ SKU และจำนวนตรงกับระบบ",
  "ถ่ายรูปสินค้าก่อนปิดกล่อง",
  "ติดใบปะหน้าและเลข tracking ชัดเจน",
];

export function PackingWorkflow() {
  const searchParams = useSearchParams();
  const requestedOrder = searchParams.get("order");
  const queue = getPackingQueue();
  const activeOrder = useMemo(
    () =>
      mockOrders.find((order) => order.id === requestedOrder || order.orderNumber === requestedOrder) ??
      queue[0],
    [queue, requestedOrder],
  );
  const [orderScan, setOrderScan] = useState(activeOrder?.orderNumber ?? "");
  const [skuScan, setSkuScan] = useState("");
  const [trackingScan, setTrackingScan] = useState("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);

  if (!activeOrder) {
    return (
      <PremiumPanel tone="slate" className="text-center">
        <PackageCheck className="mx-auto text-emerald-700" size={36} />
        <h2 className="mt-3 text-lg font-black text-slate-950">ยังไม่มีออเดอร์รอแพ็ก</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
          เมื่อมีออเดอร์ใหม่ ระบบจะแสดงคิวสแกนและเช็กลิสต์ที่นี่
        </p>
      </PremiumPanel>
    );
  }

  const orderMatches = orderScan.trim().toUpperCase() === activeOrder.orderNumber.toUpperCase();
  const skuMatches = skuScan.trim().toUpperCase() === activeOrder.sku.toUpperCase();
  const trackingMatches = trackingScan.trim().toUpperCase() === activeOrder.trackingNumber.toUpperCase();
  const hasWrongSku = skuScan.trim().length > 0 && !skuMatches;
  const allChecked = checkedItems.length === checklistItems.length;
  const readyToShip = orderMatches && skuMatches && trackingMatches && allChecked;

  function toggleChecklist(item: string) {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
    setResult(null);
  }

  function fillDemoScan() {
    setOrderScan(activeOrder.orderNumber);
    setSkuScan(activeOrder.sku);
    setTrackingScan(activeOrder.trackingNumber);
    setCheckedItems(checklistItems);
    setResult("เติมข้อมูลสแกนตัวอย่างครบแล้ว พร้อมกดพร้อมส่ง");
  }

  return (
    <div className="grid gap-5">
      <PremiumPanel tone="emerald">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <ScanLine size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-emerald-800">คิวแพ็กเดโม</p>
            <h2 className="mt-1 text-xl font-black leading-tight text-slate-950">
              {activeOrder.orderNumber}
            </h2>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
              {activeOrder.platform} · {activeOrder.customer} · {activeOrder.product} x{activeOrder.qty}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <PremiumChip tone="emerald">SKU {activeOrder.sku}</PremiumChip>
              <PremiumChip tone="sky">{activeOrder.carrier}</PremiumChip>
              <PremiumChip tone={activeOrder.priority === "เสี่ยง" ? "rose" : "amber"}>
                แพ็กก่อน {activeOrder.packBy}
              </PremiumChip>
            </div>
          </div>
        </div>
      </PremiumPanel>

      <PremiumPanel tone={hasWrongSku ? "rose" : "slate"}>
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm font-black text-slate-700">
            สแกนเลขออเดอร์
            <input
              value={orderScan}
              onChange={(event) => {
                setOrderScan(event.target.value);
                setResult(null);
              }}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-black text-slate-950 outline-none focus:border-emerald-400"
              placeholder="เช่น SPX-240518-001"
            />
          </label>

          <label className="grid gap-2 text-sm font-black text-slate-700">
            สแกน SKU
            <input
              value={skuScan}
              onChange={(event) => {
                setSkuScan(event.target.value);
                setResult(null);
              }}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-black text-slate-950 outline-none focus:border-emerald-400"
              placeholder="เช่น HOME-LED-01"
            />
          </label>

          {hasWrongSku ? (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-800">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} />
              สินค้าที่สแกนไม่ตรงกับออเดอร์ ควรหยุดแพ็กและหยิบสินค้าใหม่ก่อนปิดกล่อง
            </div>
          ) : null}

          <label className="grid gap-2 text-sm font-black text-slate-700">
            สแกนเลข Tracking
            <input
              value={trackingScan}
              onChange={(event) => {
                setTrackingScan(event.target.value);
                setResult(null);
              }}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-black text-slate-950 outline-none focus:border-emerald-400"
              placeholder="เลขพัสดุจากใบปะหน้า"
            />
          </label>

          <button
            type="button"
            data-action="fill-demo-packing-scan"
            onClick={fillDemoScan}
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm"
          >
            เติมข้อมูลสแกนตัวอย่าง
          </button>
        </div>
      </PremiumPanel>

      <PremiumPanel tone="sky">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="text-sky-700" size={22} />
          <h2 className="text-base font-black text-slate-950">เช็กลิสต์ก่อนส่ง</h2>
        </div>
        <div className="mt-4 grid gap-2">
          {checklistItems.map((item) => {
            const checked = checkedItems.includes(item);

            return (
              <label
                key={item}
                className={`flex min-h-12 items-center gap-3 rounded-2xl border px-3 text-sm font-bold leading-5 ${
                  checked ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleChecklist(item)}
                  className="size-5 accent-emerald-700"
                />
                {item}
              </label>
            );
          })}
        </div>
      </PremiumPanel>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-action="mock-ready-to-ship"
          disabled={!readyToShip}
          onClick={() => setResult(`${activeOrder.orderNumber} ถูกบันทึกเป็นพร้อมส่งแล้ว (เดโม)`)}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-black shadow-sm ${
            readyToShip
              ? "bg-emerald-700 text-white"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          <Truck size={18} />
          พร้อมส่ง
        </button>
        <Link
          href="/app/orders"
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm"
        >
          กลับคิวออเดอร์
          <ArrowRight size={17} />
        </Link>
      </div>

      {result ? (
        <div
          className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800 shadow-sm"
          role="status"
        >
          <CheckCircle2 className="mr-2 inline" size={17} />
          {result}
        </div>
      ) : null}
    </div>
  );
}
