import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secret = process.env.LINE_WEBHOOK_SECRET;
  const headerSecret = request.headers.get("x-line-webhook-secret");

  if (secret && headerSecret !== secret) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  const payload = await request.json();
  const supabase = await createClient();

  if (supabase) {
    await supabase.from("audit_logs").insert({
      action: "line_webhook_received",
      entity_type: "webhook",
      metadata: { payload },
    });
  }

  return NextResponse.json({ ok: true });
}
