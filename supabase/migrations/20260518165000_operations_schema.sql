-- AI Commerce OS operations schema
-- Additive migration for orders, packing, returns, claims, and operations analytics.
-- This migration does not connect marketplace APIs and does not remove mock/demo mode.

create extension if not exists "pgcrypto";

do $$
begin
  create type operation_order_status as enum (
    'pending_label',
    'picking',
    'packing',
    'ready_to_ship',
    'carrier_collected',
    'in_transit',
    'delivered',
    'issue',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type operation_priority as enum ('normal', 'urgent', 'risk');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type operation_event_type as enum (
    'imported',
    'manual_created',
    'label_printed',
    'picking_started',
    'packing_started',
    'packing_completed',
    'ready_to_ship',
    'carrier_collected',
    'status_synced',
    'issue_reported',
    'cancelled',
    'note_added'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type packing_status as enum ('not_started', 'scanning', 'packed', 'ready_to_ship', 'blocked');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type packing_event_type as enum (
    'label_printed',
    'scan_matched',
    'scan_mismatch',
    'packed',
    'ready_to_ship',
    'blocked',
    'note_added'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type return_case_type as enum ('return', 'refund', 'refused_delivery', 'wrong_item', 'damaged_item');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type return_case_status as enum (
    'opened',
    'awaiting_evidence',
    'in_review',
    'return_in_transit',
    'received',
    'restocked',
    'refund_pending',
    'resolved',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type claim_case_type as enum (
    'carrier_damage',
    'marketplace_dispute',
    'wrong_item',
    'missing_item',
    'goodwill_compensation'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type claim_case_status as enum (
    'opened',
    'evidence_needed',
    'submitted',
    'approved',
    'rejected',
    'paid',
    'written_off'
  );
exception when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create unique index if not exists stores_org_id_unique on stores (organization_id, id);
create unique index if not exists products_org_id_unique on products (organization_id, id);

create table if not exists operation_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  store_id uuid,
  platform marketplace_platform not null,
  external_order_id text,
  order_number text not null,
  customer_name text not null default '',
  status operation_order_status not null default 'pending_label',
  priority operation_priority not null default 'normal',
  paid_at timestamptz,
  pack_by timestamptz,
  ship_by timestamptz,
  carrier text,
  tracking_number text,
  currency text not null default 'THB',
  subtotal_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  note text,
  source text not null default 'mock',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint operation_orders_org_id_unique unique (organization_id, id),
  constraint operation_orders_org_order_number_unique unique (organization_id, order_number),
  constraint operation_orders_store_tenant_fk foreign key (organization_id, store_id)
    references stores(organization_id, id)
);

create unique index if not exists operation_orders_org_platform_external_unique
  on operation_orders (organization_id, platform, external_order_id)
  where external_order_id is not null;
create index if not exists idx_operation_orders_org_status_pack_by
  on operation_orders (organization_id, status, pack_by);
create index if not exists idx_operation_orders_org_platform_created
  on operation_orders (organization_id, platform, created_at desc);
create index if not exists idx_operation_orders_org_tracking
  on operation_orders (organization_id, tracking_number)
  where tracking_number is not null;

create trigger operation_orders_set_updated_at
  before update on operation_orders
  for each row execute function public.set_updated_at();

create table if not exists operation_order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  order_id uuid not null,
  product_id uuid,
  sku text not null,
  name text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  unit_cost numeric(12,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint operation_order_items_order_tenant_fk foreign key (organization_id, order_id)
    references operation_orders(organization_id, id) on delete cascade,
  constraint operation_order_items_product_tenant_fk foreign key (organization_id, product_id)
    references products(organization_id, id)
);

create index if not exists idx_operation_order_items_org_sku
  on operation_order_items (organization_id, sku);
create index if not exists idx_operation_order_items_org_order
  on operation_order_items (organization_id, order_id);

create table if not exists operation_status_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  order_id uuid not null,
  event_type operation_event_type not null,
  from_status operation_order_status,
  to_status operation_order_status,
  actor_profile_id uuid references commerce_profiles(id),
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint operation_status_events_order_tenant_fk foreign key (organization_id, order_id)
    references operation_orders(organization_id, id) on delete cascade
);

create index if not exists idx_operation_status_events_org_order_created
  on operation_status_events (organization_id, order_id, created_at);
create index if not exists idx_operation_status_events_org_type_created
  on operation_status_events (organization_id, event_type, created_at desc);

create table if not exists packing_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  order_id uuid not null,
  status packing_status not null default 'not_started',
  assigned_to uuid references commerce_profiles(id),
  started_at timestamptz,
  completed_at timestamptz,
  checked_item_count int not null default 0,
  issue_count int not null default 0,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint packing_tasks_org_id_unique unique (organization_id, id),
  constraint packing_tasks_org_order_unique unique (organization_id, order_id),
  constraint packing_tasks_order_tenant_fk foreign key (organization_id, order_id)
    references operation_orders(organization_id, id) on delete cascade
);

create index if not exists idx_packing_tasks_org_status_updated
  on packing_tasks (organization_id, status, updated_at desc);

create trigger packing_tasks_set_updated_at
  before update on packing_tasks
  for each row execute function public.set_updated_at();

create table if not exists packing_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  packing_task_id uuid not null,
  order_id uuid not null,
  event_type packing_event_type not null,
  sku text,
  quantity int,
  actor_profile_id uuid references commerce_profiles(id),
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint packing_events_task_tenant_fk foreign key (organization_id, packing_task_id)
    references packing_tasks(organization_id, id) on delete cascade,
  constraint packing_events_order_tenant_fk foreign key (organization_id, order_id)
    references operation_orders(organization_id, id) on delete cascade
);

create index if not exists idx_packing_events_org_task_created
  on packing_events (organization_id, packing_task_id, created_at);
create index if not exists idx_packing_events_org_order_created
  on packing_events (organization_id, order_id, created_at);
create index if not exists idx_packing_events_org_type_created
  on packing_events (organization_id, event_type, created_at desc);

create table if not exists return_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  order_id uuid,
  case_number text not null,
  platform marketplace_platform not null,
  external_case_id text,
  case_type return_case_type not null default 'return',
  status return_case_status not null default 'opened',
  customer_name text not null default '',
  reason text not null default '',
  cost_impact numeric(12,2) not null default 0,
  evidence_label text,
  suggested_action text,
  opened_at timestamptz not null default now(),
  due_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint return_cases_org_id_unique unique (organization_id, id),
  constraint return_cases_org_case_number_unique unique (organization_id, case_number),
  constraint return_cases_order_tenant_fk foreign key (organization_id, order_id)
    references operation_orders(organization_id, id)
);

create unique index if not exists return_cases_org_platform_external_unique
  on return_cases (organization_id, platform, external_case_id)
  where external_case_id is not null;
create index if not exists idx_return_cases_org_status_updated
  on return_cases (organization_id, status, updated_at desc);
create index if not exists idx_return_cases_org_order
  on return_cases (organization_id, order_id);

create trigger return_cases_set_updated_at
  before update on return_cases
  for each row execute function public.set_updated_at();

create table if not exists claim_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  return_case_id uuid,
  order_id uuid,
  claim_number text not null,
  claim_type claim_case_type not null,
  status claim_case_status not null default 'opened',
  carrier text,
  requested_amount numeric(12,2) not null default 0,
  approved_amount numeric(12,2) not null default 0,
  evidence_status text not null default 'not_started',
  owner_profile_id uuid references commerce_profiles(id),
  opened_at timestamptz not null default now(),
  submitted_at timestamptz,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint claim_cases_org_claim_number_unique unique (organization_id, claim_number),
  constraint claim_cases_return_tenant_fk foreign key (organization_id, return_case_id)
    references return_cases(organization_id, id),
  constraint claim_cases_order_tenant_fk foreign key (organization_id, order_id)
    references operation_orders(organization_id, id)
);

create index if not exists idx_claim_cases_org_status_updated
  on claim_cases (organization_id, status, updated_at desc);
create index if not exists idx_claim_cases_org_return
  on claim_cases (organization_id, return_case_id);
create index if not exists idx_claim_cases_org_order
  on claim_cases (organization_id, order_id);

create trigger claim_cases_set_updated_at
  before update on claim_cases
  for each row execute function public.set_updated_at();

alter table operation_orders enable row level security;
alter table operation_order_items enable row level security;
alter table operation_status_events enable row level security;
alter table packing_tasks enable row level security;
alter table packing_events enable row level security;
alter table return_cases enable row level security;
alter table claim_cases enable row level security;

create policy "operation_orders_org_select"
on operation_orders for select
to authenticated
using (is_super_admin() or is_org_member(organization_id));

create policy "operation_orders_owner_staff_insert"
on operation_orders for insert
to authenticated
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "operation_orders_owner_staff_update"
on operation_orders for update
to authenticated
using (is_super_admin() or is_org_owner_or_staff(organization_id))
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "operation_order_items_org_select"
on operation_order_items for select
to authenticated
using (is_super_admin() or is_org_member(organization_id));

create policy "operation_order_items_owner_staff_insert"
on operation_order_items for insert
to authenticated
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "operation_order_items_owner_staff_update"
on operation_order_items for update
to authenticated
using (is_super_admin() or is_org_owner_or_staff(organization_id))
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "operation_status_events_org_select"
on operation_status_events for select
to authenticated
using (is_super_admin() or is_org_member(organization_id));

create policy "operation_status_events_owner_staff_insert"
on operation_status_events for insert
to authenticated
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "packing_tasks_org_select"
on packing_tasks for select
to authenticated
using (is_super_admin() or is_org_member(organization_id));

create policy "packing_tasks_owner_staff_insert"
on packing_tasks for insert
to authenticated
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "packing_tasks_owner_staff_update"
on packing_tasks for update
to authenticated
using (is_super_admin() or is_org_owner_or_staff(organization_id))
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "packing_events_org_select"
on packing_events for select
to authenticated
using (is_super_admin() or is_org_member(organization_id));

create policy "packing_events_owner_staff_insert"
on packing_events for insert
to authenticated
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "return_cases_org_select"
on return_cases for select
to authenticated
using (is_super_admin() or is_org_member(organization_id));

create policy "return_cases_owner_staff_insert"
on return_cases for insert
to authenticated
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "return_cases_owner_staff_update"
on return_cases for update
to authenticated
using (is_super_admin() or is_org_owner_or_staff(organization_id))
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "claim_cases_org_select"
on claim_cases for select
to authenticated
using (is_super_admin() or is_org_member(organization_id));

create policy "claim_cases_owner_staff_insert"
on claim_cases for insert
to authenticated
with check (is_super_admin() or is_org_owner_or_staff(organization_id));

create policy "claim_cases_owner_staff_update"
on claim_cases for update
to authenticated
using (is_super_admin() or is_org_owner_or_staff(organization_id))
with check (is_super_admin() or is_org_owner_or_staff(organization_id));
