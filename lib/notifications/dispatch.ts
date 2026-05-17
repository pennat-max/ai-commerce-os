import { sendEmail } from "@/lib/email";
import { sendLineNotify } from "@/lib/line-notify";
import type { AlertChannel } from "@/types/domain";

export type DispatchPayload = {
  channel: AlertChannel;
  title: string;
  message: string;
  organizationId?: string;
};

export type DispatchResult = {
  channel: AlertChannel;
  ok: boolean;
  mode: "live" | "mock";
  error?: string;
};

export async function dispatchNotification(payload: DispatchPayload): Promise<DispatchResult> {
  const text = `${payload.title}\n${payload.message}`;

  if (payload.channel === "line") {
    const result = await sendLineNotify(text);
    return { channel: "line", ok: result.ok, mode: result.mode, error: result.error };
  }

  if (payload.channel === "email") {
    const to = process.env.ALERT_EMAIL_TO ?? "owner@example.com";
    const result = await sendEmail({ to, subject: payload.title, text });
    return { channel: "email", ok: result.ok, mode: result.mode, error: result.error };
  }

  return { channel: "dashboard", ok: true, mode: "mock" };
}
