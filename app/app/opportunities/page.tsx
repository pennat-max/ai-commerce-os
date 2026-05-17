import Link from "next/link";
import {
  BadgeDollarSign,
  Boxes,
  Megaphone,
  PackagePlus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  KpiCard,
  PremiumFeedCard,
  PremiumIntro,
  PremiumSection,
  type PremiumTone,
} from "@/components/premium-mobile";
import { StatusBadge } from "@/components/status";
import type { DecisionStatus } from "@/types/domain";

type Opportunity = {
  id: string;
  title: string;
  reason: string;
  impact: string;
  risk: DecisionStatus;
  href: string;
  icon: LucideIcon;
};

const opportunities: Opportunity[] = [
  {
    id: "push-product",
    title: "สินค้าควรดัน",
    reason: "โคมไฟขายดี ยังมีกำไรดีและสต็อกพอสำหรับแคมเปญสั้น",
    impact: "คาดเพิ่มกำไรวันนี้ +฿1,800",
    risk: "GOOD",
    href: "/app/products/30000000-0000-0000-0000-000000000001",
    icon: TrendingUp,
  },
  {
    id: "restock",
    title: "ควรเติมสต๊อก",
    reason: "ชั้นวางของเหลือน้อย ถ้าขายต่อเนื่องอาจเสียอันดับสินค้า",
    impact: "ลดความเสี่ยงพลาดยอดขาย 12 ออเดอร์",
    risk: "WARNING",
    href: "/app/products/30000000-0000-0000-0000-000000000004",
    icon: PackagePlus,
  },
  {
    id: "raise-price",
    title: "ควรขึ้นราคา",
    reason: "กล่องเก็บของมาร์จินต่ำหลังหักคูปองและค่าโฆษณา",
    impact: "ขึ้นราคา 5 บาท อาจเพิ่มกำไร +฿420 ต่อวัน",
    risk: "WARNING",
    href: "/app/products/30000000-0000-0000-0000-000000000002",
    icon: BadgeDollarSign,
  },
  {
    id: "ads-waste",
    title: "โฆษณาเริ่มไม่คุ้ม",
    reason: "ชุดม็อบใช้งบโฆษณาสูง แต่กำไรหลังแคมเปญติดลบ",
    impact: "หยุดก่อนอาจลดการขาดทุน ฿950",
    risk: "DANGER",
    href: "/app/campaigns/40000000-0000-0000-0000-000000000003",
    icon: ShieldAlert,
  },
  {
    id: "good-campaign",
    title: "แคมเปญน่าเข้า",
    reason: "Shopee Flash Sale 6.6 ยังผ่านเกณฑ์กำไรขั้นต่ำ",
    impact: "เหมาะให้เจ้าของร้านอนุมัติรอบนี้",
    risk: "GOOD",
    href: "/app/campaigns/40000000-0000-0000-0000-000000000001",
    icon: Megaphone,
  },
  {
    id: "risky-campaign",
    title: "แคมเปญเสี่ยง",
    reason: "ส่วนลดรวมกับค่าส่งที่ร้านช่วยจ่ายสูงเกินกำไรเผื่อของสินค้า",
    impact: "ควรปฏิเสธหรือปรับส่วนลดก่อนเข้าแคมเปญ",
    risk: "DANGER",
    href: "/app/campaigns",
    icon: ShieldAlert,
  },
  {
    id: "bundle",
    title: "ชุดสินค้าที่ควรทำ",
    reason: "กล่องเก็บของกับชั้นวางของมีโอกาสซื้อคู่กันสูง",
    impact: "ขายเป็นชุดอาจเพิ่มยอดต่อออเดอร์ +18%",
    risk: "GOOD",
    href: "/app/products",
    icon: Boxes,
  },
  {
    id: "creator",
    title: "ครีเอเตอร์ที่น่าดัน",
    reason: "กลุ่มบ้านและครัวให้ยอดคลิกดี แต่ยังต้องคุมค่าคอมมิชชัน",
    impact: "เหมาะกับการทดลองงบเล็ก ฿300",
    risk: "WARNING",
    href: "/app/campaigns",
    icon: Users,
  },
];

const riskCopy: Record<DecisionStatus, string> = {
  GOOD: "ทำได้เลย",
  WARNING: "เช็กตัวเลขก่อน",
  DANGER: "เสี่ยงสูง",
};

export default function OpportunitiesPage() {
  const goodCount = opportunities.filter((item) => item.risk === "GOOD").length;
  const warningCount = opportunities.filter((item) => item.risk === "WARNING").length;
  const dangerCount = opportunities.filter((item) => item.risk === "DANGER").length;
  const toneByRisk: Record<DecisionStatus, PremiumTone> = {
    GOOD: "emerald",
    WARNING: "amber",
    DANGER: "rose",
  };

  return (
    <AppShell
      title="โอกาสทำกำไร"
      subtitle="งานที่ระบบแนะนำจากกำไร สต็อก และแคมเปญตัวอย่าง"
    >
      <div className="grid gap-5">
        <PremiumIntro
          eyebrow="โอกาสทำกำไรวันนี้"
          title="เลือกงานที่คุ้มที่สุดก่อน"
          description="สรุปจากกำไร สต็อก ค่าโฆษณา และแคมเปญ เพื่อช่วยเจ้าของร้านตัดสินใจเร็วขึ้น"
          icon={Sparkles}
          tone="violet"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <KpiCard label="ทำได้" value={`${goodCount}`} tone="emerald" />
            <KpiCard label="ต้องเช็ก" value={`${warningCount}`} tone="amber" />
            <KpiCard label="เสี่ยง" value={`${dangerCount}`} tone="rose" />
          </div>
        </PremiumIntro>

        <PremiumSection title="รายการแนะนำ" helper="แตะดูรายละเอียดหรือเลือกทำงานจากการ์ดได้ทันที">
          {opportunities.map((item) => {
            const Icon = item.icon;

            return (
              <PremiumFeedCard
                key={item.id}
                icon={Icon}
                title={item.title}
                description={item.reason}
                tone={toneByRisk[item.risk]}
                badge={<StatusBadge status={item.risk} />}
              >
                <div className="mt-4 rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
                  <p className="text-xs font-black text-slate-500">ผลที่คาดว่าจะได้</p>
                  <p className="mt-1 text-sm font-black text-emerald-950">{item.impact}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-700">{riskCopy[item.risk]}</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link
                    href={item.href}
                    className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-black text-slate-700"
                  >
                    ดูรายละเอียด
                  </Link>
                  <Link
                    href={item.href}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-3 text-center text-sm font-black text-white"
                  >
                    ทำเลย
                  </Link>
                  <button
                    className="min-h-12 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-400"
                    type="button"
                    aria-disabled="true"
                    disabled
                  >
                    ไว้ก่อน
                  </button>
                </div>
              </PremiumFeedCard>
            );
          })}
        </PremiumSection>
      </div>
    </AppShell>
  );
}
