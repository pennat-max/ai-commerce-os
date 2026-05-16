import { NextResponse } from "next/server";
import { getHomePathForRole } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=supabase_not_configured", requestUrl.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=session_missing", requestUrl.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as UserRole | undefined) ?? "CUSTOMER_STAFF";
  const destination = role === "SUPER_ADMIN" ? getHomePathForRole(role) : next;

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
