import { AppShell, SectionTitle } from "@/components/app-shell";
import { plans } from "@/lib/mock-data";
import { formatBaht } from "@/lib/profit";

export default function PlansPage() {
  return (
    <AppShell mode="admin" title="แพ็กเกจ" subtitle="บริหารแพ็กเกจ ราคา quota และสิทธิ์ใช้งาน">
      <SectionTitle title="แพ็กเกจ SaaS" />
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-black">{plan.name}</h2>
            <p className="mt-2 text-3xl font-black text-emerald-700">{formatBaht(plan.price)}</p>
            <p className="mt-1 text-sm text-slate-500">ต่อเดือน</p>
            <div className="mt-5 space-y-2 text-sm font-bold text-slate-700">
              <p>{plan.stores} ร้าน</p>
              <p>{plan.decisions.toLocaleString("th-TH")} การตัดสินใจแคมเปญ</p>
              <p>แจ้งเตือน LINE / Email / Dashboard</p>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
