import { PackageCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PackingWorkflow } from "@/components/packing-workflow";
import { PremiumIntro } from "@/components/premium-mobile";

export default function PackingPage() {
  return (
    <AppShell
      title="แพ็กและสแกน"
      subtitle="สแกนออเดอร์ SKU และ tracking แบบ mock เพื่อกันหยิบผิดก่อนส่ง"
    >
      <div className="grid gap-5">
        <PremiumIntro
          eyebrow="Packing station"
          title="สแกนทีละขั้นก่อนปิดกล่อง"
          description="หน้าจอนี้เป็น workflow เดโมสำหรับมือถือ ใช้ซ้อมการแพ็กและเตือนเมื่อ SKU ไม่ตรงกับออเดอร์"
          icon={PackageCheck}
          tone="sky"
        />
        <PackingWorkflow />
      </div>
    </AppShell>
  );
}
