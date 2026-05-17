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

  return (
    <AppShell title="สินค้าและ SKU Risk" subtitle="ตรวจต้นทุน ราคา สต็อก และกำไรขั้นต่ำต่อ SKU">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatBox label="SKU ทั้งหมด" value={`${products.length}`} helper="ทุกช่องทาง" />
        <StatBox label="SKU เสี่ยง" value={`${risky}`} helper="ต่ำกว่าเกณฑ์" tone="orange" />
        <StatBox label="สต็อกต่ำ" value={`${lowStock}`} helper="เหลือไม่เกิน 10" tone="red" />
        <StatBox label="Marketplace" value="3" helper="Shopee, Lazada, TikTok" tone="green" />
      </div>
      {error ? (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          Supabase query failed, falling back to mock data: {error}
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-sky-100 bg-white p-3 text-xs font-black text-slate-500 shadow-sm">
          Data source: {source}
        </div>
      )}

      <CommerceCard
        title="รายการสินค้า"
        action={
          <Link
            href="/app/products/new"
            className="flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-xs font-black text-white"
          >
            + เพิ่มสินค้า
          </Link>
        }
      >
        <div className="grid gap-3">
          {products.map((product) => {
            const profit = calculateProfit(product);

            return (
              <article key={product.id} className="rounded-xl border border-sky-100 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                      {platformLabel(product.platform)}
                    </p>
                    <h3 className="mt-1 truncate text-base font-black text-slate-950">
                      {product.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">{product.sku}</p>
                  </div>
                  <StatusBadge status={profit.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-6">
                  <StatBox label="ราคาขาย" value={formatBaht(product.sellingPrice)} />
                  <StatBox label="ต้นทุน" value={formatBaht(product.cost)} />
                  <StatBox
                    label="กำไร"
                    value={formatBaht(profit.netProfit)}
                    tone={profit.netProfit <= 0 ? "red" : "green"}
                  />
                  <StatBox label="Margin" value={formatPercent(profit.marginPercent)} />
                  <StatBox
                    label="สต็อก"
                    value={`${product.stock}`}
                    tone={product.stock <= 10 ? "orange" : "blue"}
                  />
                  <StatBox label="กำไรขั้นต่ำ" value={formatBaht(product.minProfit)} />
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-2">
                    {profit.status === "GOOD" ? (
                      <PackageCheck size={16} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-orange-500" />
                    )}
                    Ads {formatBaht(product.adsCost)} · Fee {formatPercent(product.platformFeePercent)}
                  </span>
                  <Link
                    href={`/app/products/${product.id}`}
                    className="rounded-md bg-slate-900 px-3 py-2 text-white"
                  >
                    รายละเอียด
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </CommerceCard>
    </AppShell>
  );
}
