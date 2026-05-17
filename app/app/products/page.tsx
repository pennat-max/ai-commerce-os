import Link from "next/link";
import { AlertTriangle, PackageCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { StatusBadge, platformLabel } from "@/components/status";
import { listProducts } from "@/lib/repositories";
import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";

export default async function ProductsPage() {
  const { data: products, source, error } = await listProducts();
  const lowStock = products.filter((product) => product.stock <= 10).length;
  const risky = products.filter((product) => calculateProfit(product).status !== "GOOD").length;
  const sourceLabel = source === "supabase" ? "ข้อมูลร้านจาก Supabase" : "ข้อมูลเดโมพร้อมทดลอง";

  return (
    <AppShell title="สินค้าต้องเฝ้าระวัง" subtitle="ดูราคาขาย ต้นทุน กำไร และสต็อกที่ควรจัดการก่อน">
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="SKU ทั้งหมด" value={`${products.length}`} helper="ทุกช่องทาง" />
        <StatBox label="SKU เสี่ยง" value={`${risky}`} helper="ต่ำกว่าเกณฑ์" tone="orange" />
        <StatBox label="สต็อกต่ำ" value={`${lowStock}`} helper="เหลือไม่เกิน 10" tone="red" />
        <StatBox label="ช่องทางขาย" value="3" helper="Shopee, Lazada, TikTok" tone="green" />
      </div>
      {error ? (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          ตอนนี้ใช้ข้อมูลเดโมแทนข้อมูลร้านจริง: {error}
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-sky-100 bg-white p-3.5 text-sm font-black text-slate-600 shadow-sm">
          {sourceLabel}
        </div>
      )}

      <CommerceCard
        title="รายการสินค้า"
        action={
          <Link
            href="/app/products/new"
            className="flex min-h-12 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white"
          >
            + เพิ่มสินค้า
          </Link>
        }
      >
        <div className="grid gap-3">
          {products.map((product) => {
            const profit = calculateProfit(product);

            return (
              <article key={product.id} className="rounded-xl border border-sky-100 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-blue-600">
                      {platformLabel(product.platform)}
                    </p>
                    <h3 className="mt-1 truncate text-base font-black text-slate-950">
                      {product.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">{product.sku}</p>
                  </div>
                  <StatusBadge status={profit.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
                  <StatBox label="ราคาขาย" value={formatBaht(product.sellingPrice)} />
                  <StatBox label="ต้นทุน" value={formatBaht(product.cost)} />
                  <StatBox
                    label="กำไร"
                    value={formatBaht(profit.netProfit)}
                    tone={profit.netProfit <= 0 ? "red" : "green"}
                  />
                  <StatBox label="มาร์จิน" value={formatPercent(profit.marginPercent)} />
                  <StatBox
                    label="สต็อก"
                    value={`${product.stock}`}
                    tone={product.stock <= 10 ? "orange" : "blue"}
                  />
                  <StatBox label="กำไรขั้นต่ำ" value={formatBaht(product.minProfit)} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sky-50 px-3 py-3 text-xs font-bold text-slate-600">
                  <span className="flex min-w-0 items-center gap-2 leading-5">
                    {profit.status === "GOOD" ? (
                      <PackageCheck size={16} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-orange-500" />
                    )}
                    ค่าโฆษณา {formatBaht(product.adsCost)} · ค่าธรรมเนียม {formatPercent(product.platformFeePercent)}
                  </span>
                  <Link
                    href={`/app/products/${product.id}`}
                    className="flex min-h-11 shrink-0 items-center rounded-lg bg-slate-900 px-4 text-sm font-black text-white"
                  >
                    รายละเอียด
                  </Link>
                </div>
              </article>
            );
          })}

          {products.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
              <PackageCheck className="mx-auto text-emerald-700" size={28} />
              <p className="mt-3 text-base font-black text-slate-900">ยังไม่มีสินค้าในร้านนี้</p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
                เพิ่มสินค้าตัวอย่างเพื่อให้ระบบช่วยคำนวณกำไรและแจ้งเตือน SKU เสี่ยง
              </p>
            </div>
          ) : null}
        </div>
      </CommerceCard>
    </AppShell>
  );
}
