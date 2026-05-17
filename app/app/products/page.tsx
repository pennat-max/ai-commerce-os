import Link from "next/link";
import { AlertTriangle, Boxes, PackageCheck, Plus, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  KpiCard,
  PremiumChip,
  PremiumEmptyState,
  PremiumFeedCard,
  PremiumIntro,
  PremiumSection,
} from "@/components/premium-mobile";
import { StatusBadge, platformLabel } from "@/components/status";
import { listProducts } from "@/lib/repositories";
import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";

export default async function ProductsPage() {
  const { data: products, source, error } = await listProducts();
  const lowStock = products.filter((product) => product.stock <= 10).length;
  const risky = products.filter((product) => calculateProfit(product).status !== "GOOD").length;
  const sourceLabel = source === "supabase" ? "ข้อมูลร้านล่าสุด" : "ข้อมูลตัวอย่างพร้อมทดลอง";

  return (
    <AppShell title="สินค้าต้องเฝ้าระวัง" subtitle="ดูราคาขาย ต้นทุน กำไร และสต็อกที่ควรจัดการก่อน">
      <div className="grid gap-5">
        <PremiumIntro
          eyebrow="รายการสินค้า"
          title={`${risky} รายการควรเช็กกำไรวันนี้`}
          description="ดูสินค้าที่กำไรบาง สต็อกใกล้หมด และค่าขายที่ควรปรับก่อนเข้าแคมเปญ"
          icon={Boxes}
          tone="sky"
        >
          <div className="flex flex-wrap gap-2">
            <PremiumChip tone="sky">{sourceLabel}</PremiumChip>
            {error ? <PremiumChip tone="amber">ใช้ข้อมูลสำรองชั่วคราว</PremiumChip> : null}
          </div>
        </PremiumIntro>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="สินค้าทั้งหมด" value={`${products.length}`} helper="รวมทุกช่องทาง" icon={ShoppingBag} tone="sky" />
          <KpiCard label="กำไรน่าห่วง" value={`${risky}`} helper="ควรดูตัวเลข" icon={AlertTriangle} tone="amber" />
          <KpiCard label="สต็อกต่ำ" value={`${lowStock}`} helper="เหลือไม่เกิน 10" icon={PackageCheck} tone="rose" />
          <KpiCard label="ช่องทางขาย" value="3" helper="3 ช่องทางหลัก" icon={Boxes} tone="emerald" />
        </div>

        <PremiumSection
          title="รายการสินค้า"
          helper="แตะดูรายละเอียดเพื่อปรับราคา ต้นทุน หรือกฎกำไร"
          action={
          <Link
            href="/app/products/new"
            className="flex min-h-12 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
          >
            <Plus size={17} />
            เพิ่มสินค้า
          </Link>
        }
        >
          <div className="grid gap-3">
          {products.map((product) => {
            const profit = calculateProfit(product);
            const tone =
              profit.status === "DANGER" ? "rose" : profit.status === "WARNING" ? "amber" : "emerald";

            return (
              <PremiumFeedCard
                key={product.id}
                icon={ShoppingBag}
                title={product.name}
                description={`${platformLabel(product.platform)} · รหัสสินค้า ${product.sku}`}
                tone={tone}
                badge={<StatusBadge status={profit.status} />}
              >
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/70 p-3">
                    <p className="text-xs font-black text-slate-500">ราคาขาย</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{formatBaht(product.sellingPrice)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-3">
                    <p className="text-xs font-black text-slate-500">กำไรต่อชิ้น</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{formatBaht(profit.netProfit)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-3">
                    <p className="text-xs font-black text-slate-500">มาร์จิน</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{formatPercent(profit.marginPercent)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 p-3">
                    <p className="text-xs font-black text-slate-500">สต็อก</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{product.stock}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-3 text-xs font-bold text-slate-600">
                  <span className="flex min-w-0 items-center gap-2 leading-5">
                    {profit.status === "GOOD" ? (
                      <PackageCheck size={16} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-orange-500" />
                    )}
                    โฆษณา {formatBaht(product.adsCost)} · ค่าธรรมเนียม {formatPercent(product.platformFeePercent)}
                  </span>
                  <Link
                    href={`/app/products/${product.id}`}
                    className="flex min-h-11 shrink-0 items-center rounded-xl bg-slate-950 px-4 text-sm font-black text-white"
                  >
                    รายละเอียด
                  </Link>
                </div>
              </PremiumFeedCard>
            );
          })}

          {products.length === 0 ? (
            <PremiumEmptyState
              title="ยังไม่มีสินค้าในร้านนี้"
              description="เพิ่มสินค้าตัวอย่างเพื่อให้ระบบช่วยคำนวณกำไรและแจ้งเตือนสินค้าที่ควรดู"
              icon={PackageCheck}
            />
          ) : null}
          </div>
        </PremiumSection>
      </div>
    </AppShell>
  );
}
