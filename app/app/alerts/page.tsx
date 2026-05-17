import { AppShell } from "@/components/app-shell";
import { AlertsList } from "@/components/alerts-list";
import { CommerceCard, StatBox } from "@/components/commerce-card";
import { SendNotificationButton } from "@/components/send-notification-button";
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
          <SendNotificationButton
            channel="line"
            title="ทดสอบ AI Commerce OS"
            message="แจ้งเตือนทดสอบจากหน้า Alerts"
          />
        }
      >
        <AlertsList alerts={alerts} />
      </CommerceCard>
    </AppShell>
  );
}
