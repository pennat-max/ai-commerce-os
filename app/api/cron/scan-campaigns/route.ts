import { NextResponse } from "next/server";
import { scanAllOrganizations } from "@/lib/campaigns/scanner";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for cron scans" },
      { status: 500 },
    );
  }

  const summaries = await scanAllOrganizations(supabase);

  return NextResponse.json({
    ok: true,
    scannedOrganizations: summaries.length,
    summaries,
    scannedAt: new Date().toISOString(),
  });
}
