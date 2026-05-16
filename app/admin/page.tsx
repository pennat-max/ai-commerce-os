import { AdminSummary, AppShell, SectionTitle } from "@/components/app-shell";
import { alerts, organizations } from "@/lib/mock-data";

export default function AdminPage() {
  return (
    <AppShell
      mode="admin"
      title="แดชบอร์ดเจ้าของระบบ"
      subtitle="ดูภาพรวมลูกค้า แพ็กเกจ ร้านค้า การใช้งาน และแจ้งเตือนทั้งระบบ"
    >
      <div className="space-y-6">
        <AdminSummary />
        <section>
          <SectionTitle title="ลูกค้าที่ต้องติดตาม" />
          <div className="grid gap-3">
            {organizations.map((organization) => (
              <article key={organization.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black">{organization.name}</h2>
                    <p className="text-sm text-slate-600">Owner: {organization.owner}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                    {organization.plan}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700">{organization.stores} stores · subscription active</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <SectionTitle title="แจ้งเตือนระบบ" />
          <div className="grid gap-3">
            {alerts.map((alert) => (
              <article key={alert.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <h2 className="font-black">{alert.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
