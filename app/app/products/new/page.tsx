import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommerceCard } from "@/components/commerce-card";
import { ProductCreateForm } from "@/components/product-create-form";
import { listStores } from "@/lib/repositories";

export default async function NewProductPage() {
  const { data: stores, source } = await listStores();

  return (
    <AppShell title="เพิ่มสินค้า" subtitle={`สร้าง SKU ใหม่ · ${source}`}>
      <div className="mb-4">
        <Link
          href="/app/products"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black text-slate-700"
        >
          <ArrowLeft size={16} />
          กลับ
        </Link>
      </div>
      <CommerceCard title="ฟอร์มสินค้า">
        <ProductCreateForm stores={stores} />
      </CommerceCard>
    </AppShell>
  );
}
