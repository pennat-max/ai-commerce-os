"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { runCampaignScanAction } from "@/app/app/actions";
import { PremiumPanel } from "@/components/premium-mobile";

export function CampaignScanPanel({
  lastScan,
}: {
  lastScan: {
    scannedAt: string;
    imported: number;
    updated: number;
    decisionsUpdated: number;
    alertsCreated: number;
  } | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function scanNow() {
    setLoading(true);
    setMessage(null);

    const result = await runCampaignScanAction();
    setLoading(false);

    if (!result.ok) {
      setMessage(result.error ?? "สแกนไม่สำเร็จ");
      return;
    }

    setMessage(
      `อัปเดตแล้ว · ใหม่ ${result.imported} · แก้ไข ${result.updated} · แจ้งเตือน ${result.alertsCreated}`,
    );
    window.location.reload();
  }

  const lastLabel = lastScan
    ? new Date(lastScan.scannedAt).toLocaleString("th-TH")
    : "ยังไม่เคยสแกน";

  return (
    <PremiumPanel tone="sky">
      <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-black text-slate-950">อัปเดตแคมเปญล่าสุด</p>
          <p className="mt-1 text-sm font-bold leading-6 text-sky-800">รอบล่าสุด {lastLabel}</p>
          {lastScan ? (
            <p className="mt-1 text-xs font-bold leading-5 text-sky-700">
              ใหม่ {lastScan.imported} · แก้ไข {lastScan.updated} · คำนวณใหม่ {lastScan.decisionsUpdated}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={scanNow}
          disabled={loading}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "กำลังอัปเดต..." : "อัปเดตตอนนี้"}
        </button>
      </div>
      {message ? <p className="mt-3 text-xs font-bold text-sky-900">{message}</p> : null}
    </PremiumPanel>
  );
}

