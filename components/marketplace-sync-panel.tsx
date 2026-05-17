"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { platformLabel } from "@/components/status";
import type { Platform } from "@/types/domain";

const platforms: Platform[] = ["shopee", "lazada", "tiktok"];

export function MarketplaceSyncPanel() {
  const [status, setStatus] = useState<Record<string, string>>({});

  async function sync(platform: Platform) {
    setStatus((current) => ({ ...current, [platform]: "กำลังซิงก์..." }));

    const response = await fetch(`/api/marketplaces/${platform}/sync`, { method: "POST" });
    const body = (await response.json()) as { message?: string; error?: string };

    setStatus((current) => ({
      ...current,
      [platform]: response.ok ? (body.message ?? "สำเร็จ") : (body.error ?? "ล้มเหลว"),
    }));
  }

  return (
    <div className="grid gap-3">
      {platforms.map((platform) => (
        <article key={platform} className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white p-3">
          <div>
            <p className="text-sm font-black text-slate-900">{platformLabel(platform)}</p>
            <p className="text-xs font-bold text-slate-500">{status[platform] ?? "พร้อมซิงก์ SKU"}</p>
          </div>
          <button
            type="button"
            onClick={() => sync(platform)}
            className="flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-black text-white"
          >
            <RefreshCw size={14} />
            ซิงก์
          </button>
        </article>
      ))}
    </div>
  );
}
