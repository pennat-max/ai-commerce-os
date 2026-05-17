"use client";

import { useState } from "react";
import { createCampaignAction } from "@/app/app/actions";
import type { Product } from "@/types/domain";

export function CampaignCreateForm({ products }: { products: Product[] }) {
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const result = await createCampaignAction({
      productId: String(formData.get("productId")),
      name: String(formData.get("name")),
      campaignDiscount: Number(formData.get("campaignDiscount")),
      shopVoucher: Number(formData.get("shopVoucher")),
      coinsCashback: Number(formData.get("coinsCashback")),
      shippingSubsidy: Number(formData.get("shippingSubsidy")),
      startsAt: String(formData.get("startsAt")),
      endsAt: String(formData.get("endsAt")),
    });

    if (!result.ok) {
      setError(result.error ?? "สร้างแคมเปญไม่สำเร็จ");
    }
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {error ? (
        <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</div>
      ) : null}

      <label className="text-sm font-bold text-slate-600">
        สินค้า
        <select name="productId" required className="mt-2 h-12 w-full rounded-xl border px-3 font-bold">
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} · {product.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-bold text-slate-600">
        ชื่อแคมเปญ
        <input name="name" required className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-600">
          ส่วนลด (฿)
          <input name="campaignDiscount" type="number" defaultValue={10} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          Voucher (฿)
          <input name="shopVoucher" type="number" defaultValue={5} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          Coins (฿)
          <input name="coinsCashback" type="number" defaultValue={2} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          ส่วนลดค่าส่ง (฿)
          <input name="shippingSubsidy" type="number" defaultValue={8} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          เริ่ม
          <input name="startsAt" type="date" required className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          สิ้นสุด
          <input name="endsAt" type="date" required className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
      </div>

      <button type="submit" className="min-h-14 rounded-2xl bg-emerald-700 text-base font-black text-white">
        สร้างแคมเปญ
      </button>
    </form>
  );
}
