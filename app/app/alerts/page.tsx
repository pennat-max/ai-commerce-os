import { Bell, Mail, MessageCircle, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { StatusBadge } from "@/components/status";
import { alerts } from "@/lib/mock-data";
import type { DecisionStatus } from "@/types/domain";

const icons = {
  line: MessageCircle,
  email: Mail,
  dashboard: Bell,
};

const channelLabel = {
  line: "LINE mock",
  email: "Email mock",
  dashboard: "Dashboard",
};

export default function AlertsPage() {
  const dangerCount = alerts.filter((alert) => alert.severity === "DANGER").length;

  return (
    <AppShell title="แจ้งเตือน" subtitle="LINE, Email และ Dashboard notification แบบ mock">
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatBox label="แจ้งเตือนทั้งหมด" value={`${alerts.length}`} helper="mock channel" />
        <StatBox label="อันตราย" value={`${dangerCount}`} helper="ต้องดูทันที" tone="red" />
        <StatBox label="ส่งจริง" value="ปิด" helper="Phase 1 mock only" tone="orange" />
      </div>

      <CommerceCard
        title="การแจ้งเตือนล่าสุด"
        action={
          <button className="flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-black text-white">
            <Send size={15} />
            ทดสอบส่ง
          </button>
        }
      >
        <div className="grid gap-3">
          {alerts.map((alert) => {
            const Icon = icons[alert.channel as keyof typeof icons];

            return (
              <article key={alert.id} className="rounded-xl border border-sky-100 bg-white p-3">
                <div className="flex gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                          {channelLabel[alert.channel as keyof typeof channelLabel]}
                        </p>
                        <h3 className="mt-1 text-base font-black text-slate-950">{alert.title}</h3>
                      </div>
                      <StatusBadge status={alert.severity as DecisionStatus} />
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-600">{alert.message}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </CommerceCard>
    </AppShell>
  );
}
