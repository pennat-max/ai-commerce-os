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
    reason: "HOME-LED-01 ยังมีกำไรดีและสต็อกพอสำหรับแคมเปญสั้น",
    impact: "คาดเพิ่มกำไรวันนี้ +฿1,800",
    risk: "GOOD",
    href: "/app/products/30000000-0000-0000-0000-000000000001",
    icon: TrendingUp,
  },
  {
    id: "restock",
    title: "ควรเติมสต๊อก",
    reason: "HOME-RACK-04 เหลือน้อย ถ้าขายต่อเนื่องอาจเสียอันดับสินค้า",
    impact: "ลดความเสี่ยงพลาดยอดขาย 12 ออเดอร์",
    risk: "WARNING",
    href: "/app/products/30000000-0000-0000-0000-000000000004",
    icon: PackagePlus,
  },
  {
    id: "raise-price",
    title: "ควรขึ้นราคา",
    reason: "HOME-BOX-02 margin ต่ำหลังหัก voucher และค่า ads",
    impact: "ขึ้นราคา 5 บาท อาจเพิ่มกำไร +฿420 ต่อวัน",
    risk: "WARNING",
    href: "/app/products/30000000-0000-0000-0000-000000000002",
    icon: BadgeDollarSign,
  },
  {
    id: "ads-waste",
    title: "Ads เริ่มไม่คุ้ม",
    reason: "HOME-MOP-03 ใช้งบ ads สูง แต่กำไรหลังแคมเปญติดลบ",
    impact: "หยุดก่อนอาจลดการขาดทุน ฿950",
    risk: "DANGER",
    href: "/app/campaigns/40000000-0000-0000-0000-000000000003",
    icon: ShieldAlert,
  },
  {
    id: "good-campaign",
    title: "แคมเปญน่าเข้า",
    reason: "Shopee Flash Sale 6.6 ยังผ่านเกณฑ์กำไรขั้นต่ำ",
    impact: "เหมาะกับ Manual Approval รอบนี้",
    risk: "GOOD",
    href: "/app/campaigns/40000000-0000-0000-0000-000000000001",
    icon: Megaphone,
  },
  {
    id: "risky-campaign",
    title: "แคมเปญเสี่ยง",
    reason: "ส่วนลดรวมกับ shipping subsidy สูงเกิน buffer ของสินค้า",
    impact: "ควร reject หรือปรับส่วนลดก่อนเข้าแคมเปญ",
    risk: "DANGER",
    href: "/app/campaigns",
    icon: ShieldAlert,
  },
  {
    id: "bundle",
    title: "Bundle ที่ควรทำ",
    reason: "กล่องเก็บของกับชั้นวางของมีโอกาสซื้อคู่กันสูง",
    impact: "Bundle อาจเพิ่ม AOV +18%",
    risk: "GOOD",
    href: "/app/products",
    icon: Boxes,
  },
  {
    id: "creator",
    title: "Creator ที่น่าดัน",
    reason: "TikTok creator mock กลุ่มบ้านและครัวให้ยอด click ดี แต่ยังต้องคุม commission",
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

  return (
    <AppShell
      title="โอกาสทำกำไร"
      subtitle="AI feed แนะนำงานที่ควรทำเพื่อเพิ่มกำไรแบบ mock"
    >
      <div className="grid gap-4">
        <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <Sparkles size={25} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                AI Opportunity Feed
              </p>
              <h2 className="mt-1 text-2xl font-black leading-tight text-slate-950">
                เลือกโอกาสที่คุ้มที่สุดก่อน
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                สรุปจากกำไร สต็อก ads และแคมเปญ mock เพื่อช่วยเจ้าของร้านตัดสินใจเร็วขึ้น
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <SummaryTile label="ทำได้" value={`${goodCount}`} tone="green" />
            <SummaryTile label="ต้องเช็ก" value={`${warningCount}`} tone="yellow" />
            <SummaryTile label="เสี่ยง" value={`${dangerCount}`} tone="red" />
          </div>
        </section>

        <section className="grid gap-3">
          {opportunities.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-black text-slate-950">{item.title}</h3>
                      <StatusBadge status={item.risk} />
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{item.reason}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-xs font-black text-emerald-700">Expected impact</p>
                  <p className="mt-1 text-sm font-black text-emerald-950">{item.impact}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-700">{riskCopy[item.risk]}</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link
                    href={item.href}
                    className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-center text-xs font-black text-slate-700"
                  >
                    ดูรายละเอียด
                  </Link>
                  <button
                    className="min-h-12 rounded-xl bg-emerald-700 px-2 text-xs font-black text-white"
                    type="button"
                  >
                    ทำเลย
                  </button>
                  <button
                    className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-black text-slate-500"
                    type="button"
                  >
                    ไว้ก่อน
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "yellow" | "red";
}) {
  const classes = {
    green: "border-emerald-100 bg-emerald-50 text-emerald-800",
    yellow: "border-amber-100 bg-amber-50 text-amber-800",
    red: "border-rose-100 bg-rose-50 text-rose-800",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${classes}`}>
      <p className="text-[11px] font-black opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
