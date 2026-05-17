import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { ProfitRulesForm } from "@/components/profit-rules-form";
import { listProducts } from "@/lib/repositories";

export default async function ProfitRulesPage() {
  const { data: products, source } = await listProducts();
  const avgMinProfit =
    products.length > 0
      ? Math.round(products.reduce((sum, product) => sum + product.minProfit, 0) / products.length)
      : 0;

  return (
    <AppShell title="กฎกำไร" subtitle={`ตั้งกำไรขั้นต่ำและ Margin · ${source}`}>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatBox label="กฎทั้งหมด" value={`${products.length}`} helper="ต่อ SKU" />
        <StatBox label="ค่าเฉลี่ยกำไรขั้นต่ำ" value={`฿${avgMinProfit}`} helper={source} tone="green" />
        <StatBox label="Manual Mode" value="เปิด" helper="Auto Mode ยังปิด" tone="blue" />
      </div>

      <CommerceCard title="กฎกำไร Phase 1">
        <ProfitRulesForm products={products} source={source} />
      </CommerceCard>
    </AppShell>
  );
}
