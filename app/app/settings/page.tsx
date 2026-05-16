import { LockKeyhole, ShieldCheck, Store, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { platformLabel } from "@/components/status";
import { getDatabaseStatus, listStores } from "@/lib/repositories";

export default async function SettingsPage() {
  const stores = listStores();
  const databaseStatus = await getDatabaseStatus();

  return (
    <AppShell title="Settings" subtitle="จัดการองค์กร ร้านค้า และสิทธิ์ทีมงาน">
      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatBox label="องค์กร" value="บ้านสวยออนไลน์" helper="organization_id: org-1" />
        <StatBox label="Role" value="Owner" helper="CUSTOMER_OWNER" tone="green" />
        <StatBox label="ร้านค้า" value={`${stores.length}`} helper="mock connected" />
        <StatBox
          label="Database"
          value={databaseStatus.connected ? "ต่อแล้ว" : "Mock"}
          helper={databaseStatus.source}
          tone={databaseStatus.connected ? "green" : "orange"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <CommerceCard title="ร้านที่เชื่อมต่อแบบ mock">
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
                      {platformLabel(store.platform)} · ยังไม่เชื่อม API จริง
                    </p>
                  </div>
                  <span className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
                    mock
                  </span>
                </div>
              </article>
            ))}
          </div>
        </CommerceCard>

        <div className="grid gap-4">
          <CommerceCard title="Database Connection">
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

          <CommerceCard title="สิทธิ์ทีมงาน">
            <div className="space-y-3">
              {[
                ["คุณเมย์", "CUSTOMER_OWNER", ShieldCheck],
                ["ทีมแพ็กของ", "CUSTOMER_STAFF", Users],
                ["แอดมินไลฟ์", "CUSTOMER_STAFF", Users],
              ].map(([name, role, Icon]) => (
                <div key={name as string} className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-3">
                  <Icon className="text-blue-700" size={21} />
                  <div>
                    <p className="text-sm font-black text-slate-950">{name as string}</p>
                    <p className="text-xs font-bold text-slate-500">{role as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </CommerceCard>

          <CommerceCard title="Auto Mode">
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
