import { ensureCommerceProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import type { AppSession } from "@/types/auth";
import type { UserRole } from "@/types/domain";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
};

type MembershipRow = {
  organization_id: string;
  role: UserRole;
  organizations: { name: string } | { name: string }[] | null;
};

export async function getAppSession(): Promise<AppSession | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const ensured = await ensureCommerceProfile(supabase, user);
  if (!ensured || ensured.error) return null;

  const { data: profile, error: profileError } = await supabase
    .from("commerce_profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) return null;

  const typedProfile = profile as ProfileRow;

  if (typedProfile.role === "SUPER_ADMIN") {
    return {
      userId: typedProfile.id,
      email: typedProfile.email,
      fullName: typedProfile.full_name,
      role: typedProfile.role,
      organizationId: null,
      organizationName: null,
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(name)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) return null;

  const typedMembership = membership as MembershipRow | null;
  const organization = typedMembership?.organizations;
  const organizationName = Array.isArray(organization)
    ? organization[0]?.name ?? null
    : organization?.name ?? null;

  return {
    userId: typedProfile.id,
    email: typedProfile.email,
    fullName: typedProfile.full_name,
    role: typedProfile.role,
    organizationId: typedMembership?.organization_id ?? null,
    organizationName,
  };
}

export const DEMO_ORGANIZATION_ID = "10000000-0000-0000-0000-000000000001";

export function resolveOrganizationId(session: AppSession | null, override?: string) {
  if (override) return override;
  if (session?.organizationId) return session.organizationId;
  return DEMO_ORGANIZATION_ID;
}
