import { AppShell, SectionTitle } from "@/components/app-shell";
import { organizations } from "@/lib/mock-data";

export default function UsagePage() {
  return (
    <AppShell mode="admin" title="การใช้งาน" subtitle="ติดตาม quota แจ้งเตือน ร้านค้า และปริมาณการตัดสินใจแคมเปญ">
      <SectionTitle title="การใช้งานตามองค์กร" />
      <div className="grid gap-3">
        {organizations.map((organization, index) => {
          const usage = [72, 44, 86][index];
          return (
            <article key={organization.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">{organization.name}</h2>
                  <p className="text-sm text-slate-600">{organization.plan} · {organization.stores} ร้าน</p>
                </div>
                <p className="text-xl font-black">{usage}%</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${usage > 80 ? "bg-rose-600" : usage > 60 ? "bg-amber-400" : "bg-emerald-600"}`}
                  style={{ width: `${usage}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
