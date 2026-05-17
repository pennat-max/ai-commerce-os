import { Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlertsList } from "@/components/alerts-list";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { listAlerts } from "@/lib/repositories";

export default async function AlertsPage() {
  const { data: alerts, source } = await listAlerts();
  const dangerCount = alerts.filter((alert) => alert.severity === "DANGER").length;
  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  return (
    <AppShell title="แจ้งเตือน" subtitle={`LINE, Email และ Dashboard · ${source}`}>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <StatBox label="แจ้งเตือนทั้งหมด" value={`${alerts.length}`} helper={source} />
        <StatBox label="อันตราย" value={`${dangerCount}`} helper="ต้องดูทันที" tone="red" />
        <StatBox label="ยังไม่อ่าน" value={`${unreadCount}`} helper="รอดำเนินการ" tone="orange" />
      </div>

      <CommerceCard
        title="การแจ้งเตือนล่าสุด"
        action={
          <span className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-200 px-3 text-xs font-black text-slate-500">
            <Send size={15} />
            LINE จริง — Phase 2
          </span>
        }
      >
        <AlertsList alerts={alerts} />
      </CommerceCard>
    </AppShell>
  );
}
