"use client";

import { supabase } from "@/lib/supabase";
import type { DecisionAction } from "@/types/domain";

type CampaignDecisionActionRow = {
  campaign_id: string;
  action: DecisionAction;
};

export async function loadCampaignDecisionActions(campaignIds: string[]) {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase" || !supabase) {
    return {
      ok: false,
      source: "mock" as const,
      actions: {} as Record<string, DecisionAction>,
      error: "Supabase is not enabled.",
    };
  }

  if (campaignIds.length === 0) {
    return { ok: true, source: "supabase" as const, actions: {} as Record<string, DecisionAction> };
  }

  const { data, error } = await supabase
    .from("campaign_decisions")
    .select("campaign_id, action")
    .in("campaign_id", campaignIds);

  if (error) {
    return {
      ok: false,
      source: "supabase" as const,
      actions: {} as Record<string, DecisionAction>,
      error: error.message,
    };
  }

  const actions = Object.fromEntries(
    ((data ?? []) as CampaignDecisionActionRow[]).map((row) => [row.campaign_id, row.action]),
  ) as Record<string, DecisionAction>;

  return { ok: true, source: "supabase" as const, actions };
}

export async function saveCampaignDecisionAction(campaignId: string, action: DecisionAction) {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase" || !supabase) {
    return { ok: false, source: "mock" as const, error: "Supabase is not enabled." };
  }

  const { data, error } = await supabase
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
    .eq("campaign_id", campaignId)
    .select("campaign_id, action")
    .maybeSingle();

  if (error) {
    return { ok: false, source: "supabase" as const, error: error.message };
  }

  if (!data) {
    return {
      ok: false,
      source: "supabase" as const,
      error: "ไม่พบ decision row หรือ Supabase RLS ยังไม่อนุญาตให้อัปเดต",
    };
  }

  return { ok: true, source: "supabase" as const, error: undefined };
}
