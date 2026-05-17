-- Allow campaign scanner to write audit logs and alerts for member orgs.

create policy "audit_logs_org_insert"
on audit_logs for insert
to authenticated
with check (
  organization_id is null
  or is_super_admin()
  or is_org_member(organization_id)
);

create policy "alerts_org_insert"
on alerts for insert
to authenticated
with check (is_super_admin() or is_org_member(organization_id));
