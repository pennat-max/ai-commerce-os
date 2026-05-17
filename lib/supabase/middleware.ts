import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminPath, isProtectedPath } from "@/lib/auth/routes";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { UserRole } from "@/types/domain";

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  const pathname = request.nextUrl.pathname;

  if (!env) {
    if (isProtectedPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Do not redirect away from /login here — getAppSession() in the login page
  // is the source of truth. Redirecting on auth user alone caused ERR_TOO_MANY_REDIRECTS
  // when cookies were valid but commerce_profiles / session resolution failed.

  if (user && isAdminPath(pathname)) {
    const role = await getUserRole(supabase, user.id);
    if (role && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return response;
}

async function getUserRole(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<UserRole | null> {
  const { data } = await supabase.from("commerce_profiles").select("role").eq("id", userId).maybeSingle();
  return (data?.role as UserRole | undefined) ?? null;
}
