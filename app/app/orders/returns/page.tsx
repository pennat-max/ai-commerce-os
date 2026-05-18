import Link from "next/link";
import {
  AlertTriangle,
  ArchiveRestore,
  ArrowRight,
  Camera,
  PackageX,
  ReceiptText,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  KpiCard,
  PremiumChip,
  PremiumEmptyState,
  PremiumFeedCard,
  PremiumIntro,
  PremiumSection,
  type PremiumTone,
} from "@/components/premium-mobile";
import {
  type MockReturnCase,
  type OperationPlatform,
  type ReturnCaseStatus,
} from "@/lib/operations-mock";
import { listOrders, listReturnCases } from "@/lib/operations-repository";
import { formatBaht } from "@/lib/profit";

const statusTone: Record<ReturnCaseStatus, PremiumTone> = {
  "ลูกค้าไม่รับสินค้า": "amber",
  "สินค้าตีกลับ": "sky",
  "เคลมสินค้าเสียหาย": "rose",
  "ส่งผิดสินค้า": "rose",
  "ขอคืนเงิน": "amber",
  "รอคืนเข้าสต็อก": "violet",
  "คืนเข้า stock แล้ว": "emerald",
  "เสียหายขายต่อไม่ได้": "rose",
};

const platformClass: Record<OperationPlatform, string> = {
  Shopee: "bg-orange-50 text-orange-700 ring-orange-100",
  Lazada: "bg-violet-50 text-violet-700 ring-violet-100",
  "TikTok Shop": "bg-slate-950 text-white ring-slate-200",
};

function iconForStatus(status: ReturnCaseStatus) {
  if (status === "คืนเข้า stock แล้ว") return ArchiveRestore;
  if (status === "เสียหายขายต่อไม่ได้" || status === "เคลมสินค้าเสียหาย") return PackageX;
  if (status === "ส่งผิดสินค้า") return ShieldAlert;
  return RotateCcw;
}

function ReturnCaseCard({
  item,
  relatedOrderNumbers,
}: {
  item: MockReturnCase;
  relatedOrderNumbers: Set<string>;
}) {
  const Icon = iconForStatus(item.status);
  const relatedOrderExists = relatedOrderNumbers.has(item.orderNumber);

  return (
    <PremiumFeedCard
      icon={Icon}
      title={item.caseNumber}
      description={`${item.orderNumber} · ${item.customer} · ${item.updatedAt}`}
      tone={statusTone[item.status]}
      badge={<PremiumChip tone={statusTone[item.status]}>{item.status}</PremiumChip>}
    >
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${platformClass[item.platform]}`}>
          {item.platform}
        </span>
        <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-100">
          เหตุผล: {item.reason}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
          <p className="text-xs font-black text-slate-500">ผลกระทบต้นทุน</p>
          <p className="mt-1 text-lg font-black text-rose-600">{formatBaht(item.costImpact)}</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
          <p className="text-xs font-black text-slate-500">หลักฐาน</p>
          <p className="mt-1 text-sm font-black text-slate-950">{item.evidenceLabel}</p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-dashed border-slate-200 bg-white/75 p-3 text-xs font-bold leading-5 text-slate-600">
        <Camera className="mt-0.5 shrink-0 text-slate-500" size={17} />
        ช่องอัปโหลดหลักฐานเดโม: รูปสินค้า วิดีโอเปิดกล่อง หรือสถานะขนส่ง
      </div>

      <div className="mt-3 rounded-2xl border border-white/80 bg-white/75 p-3 shadow-sm">
        <p className="text-xs font-black text-slate-500">Suggested action</p>
        <p className="mt-1 text-sm font-bold leading-6 text-slate-800">{item.suggestedAction}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/app/orders?order=${encodeURIComponent(item.orderNumber)}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-3 text-center text-sm font-black text-white shadow-sm"
        >
          ดูออเดอร์
          <ArrowRight size={17} />
        </Link>
        <span
          className={`flex min-h-12 items-center justify-center rounded-2xl border px-3 text-center text-xs font-black ${
            relatedOrderExists
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {relatedOrderExists ? "พบในคิวเดโม" : "อยู่นอกคิวล่าสุด"}
        </span>
      </div>
    </PremiumFeedCard>
  );
}

export default async function ReturnsPage() {
  const [{ data: cases }, { data: orders }] = await Promise.all([
    listReturnCases(),
    listOrders(),
  ]);
  const relatedOrderNumbers = new Set(orders.map((order) => order.orderNumber));
  const activeCases = cases.filter((item) => item.status !== "คืนเข้า stock แล้ว").length;
  const damageCases = cases.filter((item) =>
    ["เคลมสินค้าเสียหาย", "เสียหายขายต่อไม่ได้"].includes(item.status),
  ).length;
  const totalImpact = cases.reduce((sum, item) => sum + item.costImpact, 0);

  return (
    <AppShell
      title="คืนสินค้าและเคลม"
      subtitle="ติดตามตีกลับ เคลม เสียหาย และการคืนเข้าสต็อกแบบเดโม"
    >
      <div className="grid gap-5">
        <PremiumIntro
          eyebrow="Returns & claims"
          title="เห็นทุกเคสคืนสินค้าในจอเดียว"
          description="ใช้สำหรับทีมร้านค้าเช็กต้นทุน หลักฐาน และงานต่อไป โดยยังไม่เชื่อม API ขนส่งหรือ marketplace จริง"
          icon={RotateCcw}
          tone="rose"
        >
          <div className="grid grid-cols-3 gap-2">
            <KpiCard label="เคสเปิดอยู่" value={`${activeCases}`} helper="ต้องติดตาม" tone="rose" />
            <KpiCard label="สินค้าเสียหาย" value={`${damageCases}`} helper="คุมต้นทุน" tone="amber" />
            <KpiCard label="ต้นทุนกระทบ" value={formatBaht(totalImpact)} helper="ยอดเดโมรวม" tone="violet" />
          </div>
          <Link
            href="/app/orders"
            className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white"
          >
            กลับไปดูออเดอร์
            <ArrowRight size={17} />
          </Link>
        </PremiumIntro>

        <PremiumSection title="AI operations insight" helper="จุดที่ควรแก้เพื่อลดคืนสินค้าและเคลม">
          <div className="grid gap-3 md:grid-cols-2">
            <PremiumFeedCard
              icon={AlertTriangle}
              title="SKU นี้ถูกเคลมบ่อย"
              description="HOME-MOP-03 มีเคสเสียหายซ้ำ ควรเพิ่มกันกระแทกและถ่ายรูปก่อนปิดกล่อง"
              tone="rose"
            />
            <PremiumFeedCard
              icon={ReceiptText}
              title="ลูกค้าไม่รับสินค้าเพิ่มขึ้น"
              description="เคส COD ตีกลับเริ่มสูงขึ้น แนะนำส่งข้อความยืนยันก่อนส่งในรอบถัดไป"
              tone="amber"
            />
          </div>
        </PremiumSection>

        <PremiumSection title="รายการคืน/เคลม" helper="แต่ละการ์ดมีต้นทุน หลักฐาน และ action ที่ควรทำต่อ">
          {cases.length === 0 ? (
            <PremiumEmptyState
              title="ยังไม่มีเคสคืนหรือเคลม"
              description="ถ้ามีตีกลับ เคลม หรือขอคืนเงิน ระบบจะแสดงรายการพร้อมหลักฐานและ action ที่ควรทำ"
              icon={RotateCcw}
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {cases.map((item) => (
                <ReturnCaseCard key={item.id} item={item} relatedOrderNumbers={relatedOrderNumbers} />
              ))}
            </div>
          )}
        </PremiumSection>
      </div>
    </AppShell>
  );
}
