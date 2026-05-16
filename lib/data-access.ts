import { createClient } from "@/lib/supabase/server";
import type { DecisionAction } from "@/types/domain";

export async function getProductsForOrganization(organizationId: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: "Supabase env vars are not configured." };

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function getCampaignDecisionsForOrganization(organizationId: string) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: "Supabase env vars are not configured." };

  const { data, error } = await supabase
    .from("campaign_decisions")
    .select("*, campaigns(*), products(*)")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message ?? null };
}

export async function updateCampaignDecisionAction(
  decisionId: string,
  action: DecisionAction,
  profileId?: string,
) {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: "Supabase env vars are not configured." };

  const { data, error } = await supabase
    .from("campaign_decisions")
    .update({
      action,
      decided_by: profileId ?? null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", decisionId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}
