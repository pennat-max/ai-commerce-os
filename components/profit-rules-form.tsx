"use client";

import { useState } from "react";
import { Save, SlidersHorizontal } from "lucide-react";
import { saveProductProfitRulesAction } from "@/app/app/actions";
import { formatBaht, formatPercent } from "@/lib/profit";
import type { Product } from "@/types/domain";

export function ProfitRulesForm({ products, source }: { products: Product[]; source: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function saveProduct(product: Product, form: FormData) {
    const minProfit = Number(String(form.get("minProfit")).replace(/[^\d.-]/g, ""));
    const minMargin = Number(String(form.get("minMargin")).replace(/[^\d.-]/g, ""));

    if (Number.isNaN(minProfit) || Number.isNaN(minMargin)) {
      setMessage("กรุณากรอกตัวเลขให้ถูกต้อง");
      return;
    }

    setSavingId(product.id);
    setMessage(null);

    const result = await saveProductProfitRulesAction(product.id, minProfit, minMargin);
    setSavingId(null);
    setMessage(result.ok ? `บันทึก ${product.sku} แล้ว (${source})` : result.error ?? "บันทึกไม่สำเร็จ");
  }

  return (
    <>
      {message ? (
        <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900 ring-1 ring-emerald-100">
          {message}
        </div>
      ) : null}

      <div className="grid gap-3">
        {products.map((product) => (
          <form
            key={product.id}
            action={(formData) => saveProduct(product, formData)}
            className="rounded-xl border border-sky-100 bg-white p-3"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <SlidersHorizontal size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-black text-slate-950">{product.name}</h3>
                <p className="text-xs font-bold text-slate-500">{product.sku}</p>
              </div>
              <button
                type="submit"
                disabled={savingId === product.id}
                className="flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white disabled:opacity-60"
              >
                <Save size={15} />
                {savingId === product.id ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="text-xs font-black text-slate-500">
                กำไรขั้นต่ำ
                <input
                  name="minProfit"
                  className="mt-2 h-12 w-full rounded-lg border border-sky-100 bg-sky-50 px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
                  defaultValue={product.minProfit}
                />
              </label>
              <label className="text-xs font-black text-slate-500">
                Margin ขั้นต่ำ (%)
                <input
                  name="minMargin"
                  className="mt-2 h-12 w-full rounded-lg border border-sky-100 bg-sky-50 px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
                  defaultValue={product.minMarginPercent}
                />
              </label>
              <label className="text-xs font-black text-slate-500">
                ค่า Ads ปัจจุบัน
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-sky-100 bg-white px-3 text-sm font-black text-slate-900 outline-none"
                  defaultValue={formatBaht(product.adsCost)}
                  readOnly
                />
              </label>
              <label className="text-xs font-black text-slate-500">
                ค่าธรรมเนียมแพลตฟอร์ม
                <input
                  className="mt-2 h-12 w-full rounded-lg border border-sky-100 bg-white px-3 text-sm font-black text-slate-900 outline-none"
                  defaultValue={formatPercent(product.platformFeePercent)}
                  readOnly
                />
              </label>
            </div>
          </form>
        ))}
      </div>
    </>
  );
}
