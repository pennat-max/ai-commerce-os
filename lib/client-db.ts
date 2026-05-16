"use client";

import { supabase } from "@/lib/supabase";
import type { DecisionAction } from "@/types/domain";

export async function saveCampaignDecisionAction(campaignId: string, action: DecisionAction) {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase" || !supabase) {
    return { ok: false, source: "mock" as const, error: "Supabase is not enabled." };
  }

  const { error } = await supabase
    .from("campaign_decisions")
    .update({
      action,
      note:
        action === "approve"
          ? "อนุมัติจากหน้าเว็บ Phase 1"
          : action === "reject"
            ? "ปฏิเสธจากหน้าเว็บ Phase 1"
            : "เฝ้าดูต่อจากหน้าเว็บ Phase 1",
      decided_at: new Date().toISOString(),
    })
    .eq("campaign_id", campaignId);

  return { ok: !error, source: "supabase" as const, error: error?.message };
}
