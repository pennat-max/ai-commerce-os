-- Fix infinite recursion: organization_members policies must not query organization_members.

drop policy if exists "organization_members_member_or_super_admin_select" on organization_members;

create policy "organization_members_select_self"
on organization_members for select
to authenticated
using (profile_id = auth.uid());

create policy "organization_members_super_admin_select"
on organization_members for select
to authenticated
using (is_super_admin());

-- Allow users to attach themselves to an org on first login (ensureCommerceProfile).
drop policy if exists "organization_members_insert_self" on organization_members;

create policy "organization_members_insert_self"
on organization_members for insert
to authenticated
with check (profile_id = auth.uid());
