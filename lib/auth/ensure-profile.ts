import type { UserRole } from "@/types/domain";

const DEMO_ORGANIZATION_ID = "10000000-0000-0000-0000-000000000001";
import type { SupabaseClient, User } from "@supabase/supabase-js";

function defaultRoleForEmail(email: string): UserRole {
  if (email === "admin@example.com") return "SUPER_ADMIN";
  return "CUSTOMER_OWNER";
}

export async function ensureCommerceProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<{ role: UserRole; error?: string } | null> {
  const { data: existing, error: readError } = await supabase
    .from("commerce_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return { role: "CUSTOMER_STAFF", error: readError.message };
  }

  if (existing?.role) {
    return { role: existing.role as UserRole };
  }

  if (!user.email) {
    return { role: "CUSTOMER_STAFF", error: "User has no email" };
  }

  const role =
    (user.user_metadata?.role as UserRole | undefined) ?? defaultRoleForEmail(user.email);

  const { data: created, error: insertError } = await supabase
    .from("commerce_profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        user.email.split("@")[0],
      role,
    })
    .select("role")
    .single();

  if (insertError || !created) {
    return { role: "CUSTOMER_STAFF", error: insertError?.message ?? "Could not create profile" };
  }

  if (role !== "SUPER_ADMIN") {
    await supabase.from("organization_members").upsert(
      {
        organization_id: DEMO_ORGANIZATION_ID,
        profile_id: user.id,
        role,
      },
      { onConflict: "organization_id,profile_id" },
    );
  }

  return { role: created.role as UserRole };
}
