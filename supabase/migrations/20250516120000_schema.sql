create extension if not exists "pgcrypto";

create type user_role as enum ('SUPER_ADMIN', 'CUSTOMER_OWNER', 'CUSTOMER_STAFF');
create type marketplace_platform as enum ('shopee', 'lazada', 'tiktok');
create type decision_status as enum ('GOOD', 'WARNING', 'DANGER');
create type decision_action as enum ('approve', 'reject', 'watch');
create type alert_channel as enum ('line', 'email', 'dashboard');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'CUSTOMER_STAFF',
  created_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_profile_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role user_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  monthly_price numeric(12,2) not null,
  store_limit int not null,
  decision_limit int not null,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan_id uuid not null references plans(id),
  status text not null default 'active',
  current_period_start date not null,
  current_period_end date not null,
  created_at timestamptz not null default now()
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  platform marketplace_platform not null,
  created_at timestamptz not null default now()
);

create table platform_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  platform marketplace_platform not null,
  status text not null default 'mock_connected',
  external_shop_id text,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  sku text not null,
  name text not null,
  platform marketplace_platform not null,
  cost numeric(12,2) not null,
  selling_price numeric(12,2) not null,
  stock int not null,
  shipping_cost numeric(12,2) not null default 0,
  platform_fee_percent numeric(5,2) not null default 0,
  ads_cost numeric(12,2) not null default 0,
  affiliate_commission_percent numeric(5,2) not null default 0,
  packaging_cost numeric(12,2) not null default 0,
  other_cost numeric(12,2) not null default 0,
  min_profit numeric(12,2) not null default 0,
  min_margin_percent numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (organization_id, sku)
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  campaign_discount numeric(12,2) not null default 0,
  shop_voucher numeric(12,2) not null default 0,
  coins_cashback numeric(12,2) not null default 0,
  shipping_subsidy numeric(12,2) not null default 0,
  starts_at date not null,
  ends_at date not null,
  created_at timestamptz not null default now()
);

create table profit_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  min_profit numeric(12,2) not null,
  min_margin_percent numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table campaign_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  recommendation decision_status not null,
  action decision_action not null default 'watch',
  net_profit numeric(12,2) not null,
  margin_percent numeric(5,2) not null,
  note text,
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  channel alert_channel not null,
  severity decision_status not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  actor_profile_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_members_profile on organization_members(profile_id);
create index idx_products_org on products(organization_id);
create index idx_campaigns_org on campaigns(organization_id);
create index idx_decisions_org on campaign_decisions(organization_id);
create index idx_alerts_org on alerts(organization_id);
