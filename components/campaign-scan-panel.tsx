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
      `สแกนแล้ว · ใหม่ ${result.imported} · อัปเดต ${result.updated} · แจ้งเตือน ${result.alertsCreated}`,
    );
    window.location.reload();
  }

  const lastLabel = lastScan
    ? new Date(lastScan.scannedAt).toLocaleString("th-TH")
    : "ยังไม่เคยสแกน";

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-emerald-900">สแกนแคมเปญอัตโนมัติ</p>
          <p className="text-xs font-bold text-emerald-800">ทุก 15 นาที · สแกนล่าสุด {lastLabel}</p>
          {lastScan ? (
            <p className="mt-1 text-[11px] font-bold text-emerald-700">
              ใหม่ {lastScan.imported} · อัปเดต {lastScan.updated} · คำนวณใหม่ {lastScan.decisionsUpdated}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={scanNow}
          disabled={loading}
          className="flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-xs font-black text-white disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "กำลังสแกน..." : "สแกนตอนนี้"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs font-bold text-emerald-900">{message}</p> : null}
    </div>
  );
}

