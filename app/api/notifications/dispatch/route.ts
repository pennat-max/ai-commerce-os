import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { dispatchNotification } from "@/lib/notifications/dispatch";
import { processPendingNotifications } from "@/lib/notifications/queue";

export async function POST(request: Request) {
  const session = await getAppSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: "send" | "process_queue";
    channel?: "line" | "email" | "dashboard";
    title?: string;
    message?: string;
  };

  if (body.action === "process_queue") {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await processPendingNotifications(20);
    return NextResponse.json(result);
  }

  const channel = body.channel ?? "line";
  const title = body.title ?? "AI Commerce OS";
  const message = body.message ?? "ทดสอบการแจ้งเตือน";

  const result = await dispatchNotification({
    channel,
    title,
    message,
    organizationId: session.organizationId ?? undefined,
  });

  return NextResponse.json(result);
}
