import { Save, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { products } from "@/lib/mock-data";
import { formatBaht, formatPercent } from "@/lib/profit";

export default function ProfitRulesPage() {
  return (
    <AppShell title="กฎกำไร" subtitle="ตั้งกำไรขั้นต่ำและ Margin ขั้นต่ำต่อสินค้า">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatBox label="กฎทั้งหมด" value={`${products.length}`} helper="ต่อ SKU" />
        <StatBox label="ค่าเฉลี่ยกำไรขั้นต่ำ" value="฿36" helper="จาก mock data" tone="green" />
        <StatBox label="Manual Mode" value="เปิด" helper="Auto Mode ยังปิด" tone="blue" />
      </div>

      <CommerceCard
        title="กฎกำไร Phase 1"
        action={
          <button className="flex min-h-10 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white">
            <Save size={15} />
            บันทึกทั้งหมด
          </button>
        }
      >
        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-xl border border-sky-100 bg-white p-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <SlidersHorizontal size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-black text-slate-950">{product.name}</h3>
                  <p className="text-xs font-bold text-slate-500">{product.sku}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <label className="text-xs font-black text-slate-500">
                  กำไรขั้นต่ำ
                  <input
                    className="mt-2 h-12 w-full rounded-lg border border-sky-100 bg-sky-50 px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
                    defaultValue={formatBaht(product.minProfit)}
                  />
                </label>
                <label className="text-xs font-black text-slate-500">
                  Margin ขั้นต่ำ
                  <input
                    className="mt-2 h-12 w-full rounded-lg border border-sky-100 bg-sky-50 px-3 text-sm font-black text-slate-900 outline-none focus:border-blue-500"
                    defaultValue={formatPercent(product.minMarginPercent)}
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
            </article>
          ))}
        </div>
      </CommerceCard>
    </AppShell>
  );
}
