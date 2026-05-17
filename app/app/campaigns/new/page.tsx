import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommerceCard } from "@/components/commerce-card";
import { CampaignCreateForm } from "@/components/campaign-create-form";
import { listProducts } from "@/lib/repositories";

export default async function NewCampaignPage() {
  const { data: products, source } = await listProducts();

  return (
    <AppShell title="เพิ่มแคมเปญ" subtitle={`สร้างแคมเปญใหม่ · ${source}`}>
      <div className="mb-4">
        <Link
          href="/app/campaigns"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-black text-slate-700"
        >
          <ArrowLeft size={16} />
          กลับ
        </Link>
      </div>
      <CommerceCard title="ฟอร์มแคมเปญ">
        <CampaignCreateForm products={products} />
      </CommerceCard>
    </AppShell>
  );
}
