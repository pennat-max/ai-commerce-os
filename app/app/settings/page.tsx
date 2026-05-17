import { LockKeyhole, ShieldCheck, Store, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { platformLabel } from "@/components/status";
import { getAppSession } from "@/lib/auth/session";
import { getDatabaseStatus, listOrganizationMembers, listStores } from "@/lib/repositories";

export default async function SettingsPage() {
  const session = await getAppSession();
  const [{ data: stores, source: storeSource }, databaseStatus, { data: members, source: memberSource }] =
    await Promise.all([listStores(), getDatabaseStatus(), listOrganizationMembers()]);

  return (
    <AppShell title="ตั้งค่า" subtitle="จัดการองค์กร ร้านค้า และสิทธิ์ทีมงาน">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatBox
          label="องค์กร"
          value={session?.organizationName ?? "—"}
          helper={session?.organizationId ? `org: ${session.organizationId.slice(0, 8)}…` : "ไม่มีองค์กร"}
        />
        <StatBox label="Role" value={session?.role ?? "—"} helper={session?.email ?? ""} tone="green" />
        <StatBox label="ร้านค้า" value={`${stores.length}`} helper={storeSource} />
        <StatBox
          label="Database"
          value={databaseStatus.connected ? "ต่อแล้ว" : "Mock"}
          helper={databaseStatus.source}
          tone={databaseStatus.connected ? "green" : "orange"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <CommerceCard title={`ร้านที่เชื่อมต่อ (${storeSource})`}>
          <div className="grid gap-3">
            {stores.map((store) => (
              <article key={store.id} className="rounded-xl border border-sky-100 bg-white p-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Store size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-black text-slate-950">{store.name}</h3>
                    <p className="text-xs font-bold text-slate-500">
                      {platformLabel(store.platform)} · mock_connected
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
                    {storeSource}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </CommerceCard>

        <div className="grid gap-4">
          <CommerceCard title="การเชื่อมต่อฐานข้อมูล">
            <div
              className={`rounded-xl p-4 text-sm font-bold ${
                databaseStatus.connected
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                  : "bg-amber-50 text-amber-900 ring-1 ring-amber-100"
              }`}
            >
              {databaseStatus.message}
            </div>
          </CommerceCard>

          <CommerceCard title={`สิทธิ์ทีมงาน (${memberSource})`}>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3">
                  {member.role === "CUSTOMER_OWNER" ? (
                    <ShieldCheck className="text-blue-700" size={21} />
                  ) : (
                    <Users className="text-blue-700" size={21} />
                  )}
                  <div>
                    <p className="text-sm font-black text-slate-950">{member.fullName}</p>
                    <p className="text-xs font-bold text-slate-500">
                      {member.role}
                      {member.email ? ` · ${member.email}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CommerceCard>

          <CommerceCard title="โหมด Auto">
            <div className="rounded-xl bg-slate-100 p-4 text-center">
              <LockKeyhole className="mx-auto text-slate-400" size={30} />
              <p className="mt-3 text-sm font-black text-slate-700">ยังไม่เปิดใน Phase 1</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                ระบบแนะนำได้ แต่ยังไม่ส่งคำสั่งไป marketplace จริง
              </p>
            </div>
          </CommerceCard>
        </div>
      </div>
    </AppShell>
  );
}
