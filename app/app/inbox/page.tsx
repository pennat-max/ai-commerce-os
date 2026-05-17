import { AppShell } from "@/components/app-shell";
import { UnifiedInbox } from "@/components/unified-inbox";

export default function InboxPage() {
  return (
    <AppShell
      title="กล่องแชทรวม"
      subtitle="รวม Shopee, Lazada, TikTok Shop, Facebook, LINE และ WhatsApp แบบ mock"
    >
      <UnifiedInbox />
    </AppShell>
  );
}
