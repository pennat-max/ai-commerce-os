import Link from "next/link";
import { ArrowLeft, Package, Store } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { ProfitBreakdown } from "@/components/profit-breakdown";
import { platformLabel } from "@/components/status";
import { products, stores } from "@/lib/mock-data";
import { formatBaht, formatPercent } from "@/lib/profit";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  if (!product) notFound();

  const store = stores.find((item) => item.id === product.storeId);

  return (
    <AppShell title="รายละเอียดสินค้า" subtitle="ดูต้นทุน กำไร และความเสี่ยงราย SKU">
      <div className="mb-4">
        <Link
          href="/app/products"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-100 bg-white px-3 text-sm font-black text-slate-700 shadow-sm"
        >
          <ArrowLeft size={16} />
          กลับไปสินค้า
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <CommerceCard title="SKU Profile">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Package size={24} />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-950">{product.name}</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{product.sku}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <StatBox label="Platform" value={platformLabel(product.platform)} />
            <StatBox label="Store" value={store?.name ?? "Mock store"} />
            <StatBox
              label="Stock"
              value={`${product.stock} ชิ้น`}
              tone={product.stock <= 10 ? "orange" : "blue"}
            />
          </div>
        </CommerceCard>

        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-4">
            <StatBox label="ราคาขาย" value={formatBaht(product.sellingPrice)} />
            <StatBox label="ต้นทุน" value={formatBaht(product.cost)} />
            <StatBox label="ค่าธรรมเนียม" value={formatPercent(product.platformFeePercent)} />
            <StatBox label="Ads" value={formatBaht(product.adsCost)} />
          </div>

          <ProfitBreakdown product={product} />

          <CommerceCard title="Mock Marketplace Connection">
            <div className="flex items-start gap-3 rounded-xl bg-sky-50 p-4">
              <Store className="shrink-0 text-blue-700" size={22} />
              <div>
                <p className="text-sm font-black text-slate-900">
                  ยังไม่เชื่อมต่อ API จริงใน Phase 1
                </p>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  หน้านี้ใช้ mock data เพื่อยืนยัน UX, profit logic และ multi-tenant structure ก่อนต่อ marketplace จริง
                </p>
              </div>
            </div>
          </CommerceCard>
        </div>
      </div>
    </AppShell>
  );
}
