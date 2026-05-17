-- FOR ALL policy also applies to SELECT and re-introduces recursion via self-referencing subquery.

drop policy if exists "organization_members_owner_or_super_admin_manage" on organization_members;

create policy "organization_members_super_admin_manage"
on organization_members for all
to authenticated
using (is_super_admin())
with check (is_super_admin());

create policy "organization_members_update_self"
on organization_members for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());
