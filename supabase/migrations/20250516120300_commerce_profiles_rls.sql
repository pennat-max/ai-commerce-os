-- AI Commerce OS: separate profiles table (shared project has legacy `profiles` table)

drop policy if exists "demo_public_products_read_seed_org" on products;
drop policy if exists "demo_public_stores_read_seed_org" on stores;
drop policy if exists "demo_public_campaigns_read_seed_org" on campaigns;
drop policy if exists "demo_public_campaign_decisions_read_seed_org" on campaign_decisions;
drop policy if exists "demo_public_campaign_decisions_update_seed_org" on campaign_decisions;
drop policy if exists "demo_public_alerts_read_seed_org" on alerts;

drop policy if exists "organizations_member_or_super_admin_select" on organizations;
drop policy if exists "organizations_super_admin_manage" on organizations;
drop policy if exists "organization_members_member_or_super_admin_select" on organization_members;
drop policy if exists "organization_members_owner_or_super_admin_manage" on organization_members;
drop policy if exists "plans_visible_to_authenticated" on plans;
drop policy if exists "plans_super_admin_manage" on plans;
drop policy if exists "subscriptions_org_or_super_admin" on subscriptions;
drop policy if exists "subscriptions_super_admin_manage" on subscriptions;
drop policy if exists "stores_org_select" on stores;
drop policy if exists "stores_owner_manage" on stores;
drop policy if exists "tenant_tables_select" on platform_connections;
drop policy if exists "tenant_products_select" on products;
drop policy if exists "tenant_campaigns_select" on campaigns;
drop policy if exists "tenant_profit_rules_select" on profit_rules;
drop policy if exists "tenant_campaign_decisions_select" on campaign_decisions;
drop policy if exists "tenant_alerts_select" on alerts;
drop policy if exists "tenant_audit_logs_select" on audit_logs;
drop policy if exists "owner_staff_product_updates" on products;
drop policy if exists "owner_staff_campaign_decision_updates" on campaign_decisions;
drop policy if exists "owner_profit_rules_manage" on profit_rules;
drop policy if exists "owner_manage_connections" on platform_connections;
drop policy if exists "alerts_update_read_state" on alerts;

create table if not exists commerce_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'CUSTOMER_STAFF',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.commerce_profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER_STAFF')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table commerce_profiles enable row level security;

create policy "commerce_profiles_self_or_super_admin_select"
on commerce_profiles for select
using (
  id = auth.uid()
  or exists (
    select 1 from commerce_profiles cp
    where cp.id = auth.uid() and cp.role = 'SUPER_ADMIN'
  )
);

create policy "commerce_profiles_insert_self"
on commerce_profiles for insert
to authenticated
with check (id = auth.uid());

create policy "commerce_profiles_update_self"
on commerce_profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

alter table organization_members drop constraint if exists organization_members_profile_id_fkey;

alter table organization_members
  add constraint organization_members_profile_id_fkey
  foreign key (profile_id) references auth.users(id) on delete cascade;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from commerce_profiles
    where id = auth.uid()
      and role = 'SUPER_ADMIN'
  );
$$;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = target_organization_id
  );
$$;

create or replace function public.is_org_owner_or_staff(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = target_organization_id
      and role in ('CUSTOMER_OWNER', 'CUSTOMER_STAFF')
  );
$$;

alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table stores enable row level security;
alter table platform_connections enable row level security;
alter table products enable row level security;
alter table campaigns enable row level security;
alter table profit_rules enable row level security;
alter table campaign_decisions enable row level security;
alter table alerts enable row level security;
alter table audit_logs enable row level security;

drop policy if exists "profiles_self_or_super_admin_select" on profiles;
drop policy if exists "profiles_super_admin_manage" on profiles;
drop policy if exists "profiles_insert_self" on profiles;
drop policy if exists "profiles_update_self" on profiles;

create policy "organizations_member_or_super_admin_select"
on organizations for select
using (is_super_admin() or is_org_member(id));

create policy "organizations_super_admin_manage"
on organizations for all
using (is_super_admin())
with check (is_super_admin());

create policy "organization_members_member_or_super_admin_select"
on organization_members for select
using (is_super_admin() or is_org_member(organization_id));

create policy "organization_members_owner_or_super_admin_manage"
on organization_members for all
using (
  is_super_admin()
  or exists (
    select 1 from organization_members owner_member
    where owner_member.profile_id = auth.uid()
      and owner_member.organization_id = organization_members.organization_id
      and owner_member.role = 'CUSTOMER_OWNER'
  )
)
with check (
  is_super_admin()
  or exists (
    select 1 from organization_members owner_member
    where owner_member.profile_id = auth.uid()
      and owner_member.organization_id = organization_members.organization_id
      and owner_member.role = 'CUSTOMER_OWNER'
  )
);

create policy "plans_visible_to_authenticated"
on plans for select
to authenticated
using (true);

create policy "plans_super_admin_manage"
on plans for all
using (is_super_admin())
with check (is_super_admin());

create policy "subscriptions_org_or_super_admin"
on subscriptions for select
using (is_super_admin() or is_org_member(organization_id));

create policy "subscriptions_super_admin_manage"
on subscriptions for all
using (is_super_admin())
with check (is_super_admin());

create policy "stores_org_select"
on stores for select
using (is_super_admin() or is_org_member(organization_id));

create policy "stores_owner_manage"
on stores for all
using (
  is_super_admin()
  or exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = stores.organization_id
      and role = 'CUSTOMER_OWNER'
  )
)
with check (
  is_super_admin()
  or exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = stores.organization_id
      and role = 'CUSTOMER_OWNER'
  )
);

create policy "tenant_tables_select"
on platform_connections for select
using (is_super_admin() or is_org_member(organization_id));

create policy "tenant_products_select"
on products for select
using (is_super_admin() or is_org_member(organization_id));

create policy "tenant_campaigns_select"
on campaigns for select
using (is_super_admin() or is_org_member(organization_id));

create policy "tenant_profit_rules_select"
on profit_rules for select
using (is_super_admin() or is_org_member(organization_id));

create policy "tenant_campaign_decisions_select"
on campaign_decisions for select
using (is_super_admin() or is_org_member(organization_id));

create policy "tenant_alerts_select"
on alerts for select
using (is_super_admin() or is_org_member(organization_id));

create policy "tenant_audit_logs_select"
on audit_logs for select
using (is_super_admin() or is_org_member(organization_id));

create policy "owner_staff_product_updates"
on products for all
using (is_super_admin() or is_org_owner_or_staff(organization_id))
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "owner_staff_campaign_decision_updates"
on campaign_decisions for all
using (is_super_admin() or is_org_owner_or_staff(organization_id))
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "owner_profit_rules_manage"
on profit_rules for all
using (
  is_super_admin()
  or exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = profit_rules.organization_id
      and role = 'CUSTOMER_OWNER'
  )
)
with check (
  is_super_admin()
  or exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = profit_rules.organization_id
      and role = 'CUSTOMER_OWNER'
  )
);

create policy "owner_manage_connections"
on platform_connections for all
using (
  is_super_admin()
  or exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = platform_connections.organization_id
      and role = 'CUSTOMER_OWNER'
  )
)
with check (
  is_super_admin()
  or exists (
    select 1 from organization_members
    where profile_id = auth.uid()
      and organization_id = platform_connections.organization_id
      and role = 'CUSTOMER_OWNER'
  )
);

create policy "alerts_update_read_state"
on alerts for update
using (is_super_admin() or is_org_member(organization_id))
with check (is_super_admin() or is_org_member(organization_id));
