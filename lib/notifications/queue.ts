import { createClient } from "@/lib/supabase/server";
import { dispatchNotification, type DispatchPayload } from "@/lib/notifications/dispatch";
import type { AlertChannel } from "@/types/domain";

export type QueuedNotification = {
  id: string;
  channel: AlertChannel;
  title: string;
  message: string;
  organizationId: string | null;
  status: "pending" | "sent" | "failed";
  error: string | null;
  createdAt: string;
};

export async function enqueueNotification(payload: DispatchPayload & { organizationId: string }) {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Supabase not configured" };
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      organization_id: payload.organizationId,
      action: "notification_queued",
      entity_type: "alert",
      metadata: {
        channel: payload.channel,
        title: payload.title,
        message: payload.message,
        status: "pending",
      },
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, jobId: data.id as string };
}

export async function processPendingNotifications(limit = 10) {
  const supabase = await createClient();
  if (!supabase) return { processed: 0, results: [] as { id: string; ok: boolean }[] };

  const { data: rows } = await supabase
    .from("audit_logs")
    .select("id, organization_id, metadata")
    .eq("action", "notification_queued")
    .order("created_at", { ascending: true })
    .limit(limit);

  const pending = (rows ?? []).filter((row) => {
    const meta = row.metadata as { status?: string } | null;
    return meta?.status === "pending";
  });

  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const row of pending) {
    const meta = row.metadata as {
      channel: AlertChannel;
      title: string;
      message: string;
      status: string;
    };

    const dispatch = await dispatchNotification({
      channel: meta.channel,
      title: meta.title,
      message: meta.message,
      organizationId: row.organization_id as string,
    });

    const nextStatus = dispatch.ok ? "sent" : "failed";
    await supabase
      .from("audit_logs")
      .update({
        metadata: { ...meta, status: nextStatus, error: dispatch.error ?? null, mode: dispatch.mode },
      })
      .eq("id", row.id);

    results.push({ id: row.id as string, ok: dispatch.ok, error: dispatch.error });
  }

  return { processed: results.length, results };
}
