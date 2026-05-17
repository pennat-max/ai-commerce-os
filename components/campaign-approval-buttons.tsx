"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { saveCampaignDecisionAction } from "@/lib/client-db";
import type { DecisionAction } from "@/types/domain";

export function CampaignApprovalButtons({ campaignId }: { campaignId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<DecisionAction | null>(null);

  async function decide(action: DecisionAction) {
    setLoading(action);
    setMessage(null);
    const result = await saveCampaignDecisionAction(campaignId, action);
    setLoading(null);
    setMessage(
      result.ok
        ? `บันทึกแล้ว: ${action === "approve" ? "อนุมัติ" : action === "reject" ? "ปฏิเสธ" : "เฝ้าดู"}`
        : result.error ?? "บันทึกไม่สำเร็จ",
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {(
          [
            ["approve", "อนุมัติ", "border-emerald-200 bg-emerald-600 text-white"],
            ["watch", "เฝ้าดู", "border-orange-200 bg-orange-500 text-white"],
            ["reject", "ปฏิเสธ", "border-rose-200 bg-rose-600 text-white"],
          ] as const
        ).map(([action, label, className]) => (
          <button
            key={action}
            type="button"
            disabled={loading !== null}
            onClick={() => decide(action)}
            className={`min-h-12 rounded-xl border text-sm font-black active:scale-[0.98] disabled:opacity-60 ${className}`}
          >
            {loading === action ? "กำลังบันทึก..." : label}
          </button>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm font-bold text-emerald-700">{message}</p> : null}
      <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-100 p-4">
        <LockKeyhole className="shrink-0 text-slate-500" size={22} />
        <p className="text-sm font-bold text-slate-600">
          Phase 1 ไม่ส่งคำสั่งไป marketplace จริง — บันทึกการตัดสินใจลง Supabase เท่านั้น
        </p>
      </div>
    </>
  );
}
