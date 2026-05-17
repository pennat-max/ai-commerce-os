"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { runCampaignScanAction } from "@/app/app/actions";

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
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
      <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-black text-emerald-900">อัปเดตแคมเปญเดโม</p>
          <p className="mt-1 text-sm font-bold leading-6 text-emerald-800">รอบล่าสุด {lastLabel}</p>
          {lastScan ? (
            <p className="mt-1 text-xs font-bold leading-5 text-emerald-700">
              ใหม่ {lastScan.imported} · แก้ไข {lastScan.updated} · คำนวณใหม่ {lastScan.decisionsUpdated}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={scanNow}
          disabled={loading}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "กำลังอัปเดต..." : "อัปเดตตอนนี้"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs font-bold text-emerald-900">{message}</p> : null}
    </div>
  );
}

