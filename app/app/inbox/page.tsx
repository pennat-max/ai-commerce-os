import { AppShell } from "@/components/app-shell";
import { UnifiedInbox } from "@/components/unified-inbox";

export default function InboxPage() {
  return (
    <AppShell
      title="กล่องแชทรวม"
      subtitle="รวมข้อความลูกค้าหลายช่องทาง พร้อมคำตอบแนะนำสำหรับทีมขาย"
    >
      <UnifiedInbox />
    </AppShell>
  );
}
