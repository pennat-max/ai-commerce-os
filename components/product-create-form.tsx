"use client";

import { useState } from "react";
import { createProductAction } from "@/app/app/actions";
import { platformLabel } from "@/components/status";
import type { Platform, Store } from "@/types/domain";

export function ProductCreateForm({ stores }: { stores: Store[] }) {
  const [error, setError] = useState<string | null>(null);
  const defaultStore = stores[0];

  async function onSubmit(formData: FormData) {
    setError(null);
    const result = await createProductAction({
      storeId: String(formData.get("storeId")),
      sku: String(formData.get("sku")),
      name: String(formData.get("name")),
      platform: String(formData.get("platform")) as Platform,
      cost: Number(formData.get("cost")),
      sellingPrice: Number(formData.get("sellingPrice")),
      stock: Number(formData.get("stock")),
      minProfit: Number(formData.get("minProfit")),
      minMarginPercent: Number(formData.get("minMarginPercent")),
    });

    if (!result.ok) {
      setError(result.error ?? "สร้างสินค้าไม่สำเร็จ");
    }
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {error ? (
        <div className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</div>
      ) : null}

      <label className="text-sm font-bold text-slate-600">
        ร้านค้า
        <select
          name="storeId"
          className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-bold"
          defaultValue={defaultStore?.id}
          onChange={(event) => {
            const store = stores.find((item) => item.id === event.target.value);
            const platformInput = document.querySelector<HTMLInputElement>('input[name="platform"]');
            if (store && platformInput) platformInput.value = store.platform;
          }}
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </label>

      <input type="hidden" name="platform" defaultValue={defaultStore?.platform ?? "shopee"} />

      <label className="text-sm font-bold text-slate-600">
        SKU
        <input name="sku" required className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-bold" />
      </label>

      <label className="text-sm font-bold text-slate-600">
        ชื่อสินค้า
        <input name="name" required className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-bold" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-600">
          ต้นทุน (฿)
          <input name="cost" type="number" required defaultValue={100} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          ราคาขาย (฿)
          <input name="sellingPrice" type="number" required defaultValue={199} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          สต็อก
          <input name="stock" type="number" required defaultValue={10} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600">
          กำไรขั้นต่ำ (฿)
          <input name="minProfit" type="number" required defaultValue={30} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
        <label className="text-sm font-bold text-slate-600 sm:col-span-2">
          Margin ขั้นต่ำ (%)
          <input name="minMarginPercent" type="number" required defaultValue={15} className="mt-2 h-12 w-full rounded-xl border px-3 font-bold" />
        </label>
      </div>

      <p className="text-xs font-bold text-slate-500">
        แพลตฟอร์ม: {defaultStore ? platformLabel(defaultStore.platform) : "—"}
      </p>

      <button type="submit" className="min-h-14 rounded-2xl bg-emerald-700 text-base font-black text-white">
        สร้างสินค้า
      </button>
    </form>
  );
}
