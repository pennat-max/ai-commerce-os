"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { sendTestNotificationAction } from "@/app/app/actions";
import type { AlertChannel } from "@/types/domain";

export function SendNotificationButton({
  channel = "line",
  title,
  message,
}: {
  channel?: AlertChannel;
  title: string;
  message: string;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setStatus(null);
    const result = await sendTestNotificationAction(channel, title, message);
    setLoading(false);
    const mode = "mode" in result && result.mode === "live" ? "จริง" : "mock";
    setStatus(result.ok ? `ส่งแล้ว (${mode})` : result.error ?? "ส่งไม่สำเร็จ");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-black text-white disabled:opacity-60"
      >
        <Send size={15} />
        {loading ? "กำลังส่ง..." : "ทดสอบส่ง"}
      </button>
      {status ? <span className="text-[11px] font-bold text-slate-500">{status}</span> : null}
    </div>
  );
}
