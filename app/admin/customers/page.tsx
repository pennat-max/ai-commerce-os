import { AppShell, SectionTitle } from "@/components/app-shell";
import { organizations } from "@/lib/mock-data";

export default function CustomersPage() {
  return (
    <AppShell mode="admin" title="ลูกค้า" subtitle="จัดการองค์กร ลูกค้า ร้านค้า และ subscription">
      <SectionTitle
        title="องค์กรลูกค้า"
        action={<button className="min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white">เพิ่มลูกค้า</button>}
      />
      <div className="grid gap-3">
        {organizations.map((organization) => (
          <article key={organization.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">{organization.name}</h2>
                <p className="text-sm text-slate-600">{organization.owner} · {organization.id}</p>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">
                ใช้งานอยู่
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div><p className="text-slate-500">Plan</p><p className="font-black">{organization.plan}</p></div>
              <div><p className="text-slate-500">Stores</p><p className="font-black">{organization.stores}</p></div>
              <div><p className="text-slate-500">Usage</p><p className="font-black">72%</p></div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
