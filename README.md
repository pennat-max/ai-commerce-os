# AI Commerce OS

AI Commerce OS is a multi-tenant SaaS MVP for online sellers to manage SKU risk, profit rules, campaign decisions, manual approvals, and mock LINE/email/dashboard alerts for Shopee, Lazada, and TikTok Shop.

Phase 1 uses mock marketplace data only. It does not connect to real Shopee, Lazada, or TikTok Shop APIs yet.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase client integration
- Supabase SQL schema, seed data, and RLS policies
- Mobile-first SaaS dashboard UI

## What Is Built

- Mock login page with admin and customer entry points
- Super admin dashboard:
  - `/admin`
  - `/admin/customers`
  - `/admin/plans`
  - `/admin/usage`
- Customer seller dashboard:
  - `/app`
  - `/app/products`
  - `/app/campaigns`
  - `/app/profit-rules`
  - `/app/alerts`
  - `/app/settings`
- Product/SKU management UI
- Profit calculator utility
- Campaign recommendation utility
- Manual approval mock flow with stateful Approve, Watch, and Reject buttons
- LocalStorage-backed mock login/session and persisted mock campaign decisions
- Supabase-aware login/logout fallback: if Supabase env vars are configured, login attempts Supabase Auth first; otherwise it runs as a mock role picker.
- Mock quick actions for apply campaign, price update, and stop campaign
- LINE, email, and dashboard alert mock UI
- Supabase multi-tenant schema using `organization_id`
- Supabase RLS policies for super admin and organization-scoped customer users

## Local Setup

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

For Phase 1, the app can run without real Supabase values because the UI uses mock data. Add real values when you create a Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_DATA_SOURCE=mock
```

`NEXT_PUBLIC_DATA_SOURCE=mock` is the default for the MVP. Use it while marketplace and database write flows are still being validated. The Supabase client and data access helpers are already present for the next integration step.

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/login
```

If port `3000` is busy, run another port:

```bash
npm run dev -- --port 3001
```

## Build Checks

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Start production server after a successful build:

```bash
npm run start
```

## Supabase Setup

Create a Supabase project, then run these SQL files in order from the Supabase SQL editor:

1. `supabase/schema.sql`
2. `supabase/rls.sql`
3. `supabase/seed.sql`

Schema includes:

- `profiles`
- `organizations`
- `organization_members`
- `plans`
- `subscriptions`
- `stores`
- `platform_connections`
- `products`
- `campaigns`
- `profit_rules`
- `campaign_decisions`
- `alerts`
- `audit_logs`

RLS design:

- `SUPER_ADMIN` can see and manage platform-level data.
- Customer users can only see rows for organizations where they are members.
- `CUSTOMER_OWNER` can manage stores, members, platform connections, and profit rules for their organization.
- `CUSTOMER_OWNER` and `CUSTOMER_STAFF` can update products and campaign decisions inside their organization.

## Profit Logic

Net Profit:

```text
selling_price
- cost
- platform_fee
- campaign_discount
- shop_voucher
- coins_cashback
- ads_cost
- affiliate_commission
- shipping_subsidy
- packaging_cost
- other_cost
```

Decision status:

- `GOOD`: profit >= min_profit and margin >= min_margin_percent
- `WARNING`: profit > 0 but below min_profit or below min_margin_percent
- `DANGER`: profit <= 0

Core files:

- `lib/profit.ts`
- `lib/campaign-decisions.ts`
- `lib/mock-data.ts`
- `lib/supabase.ts`

## Vercel Deployment

1. Push this repository to GitHub.
2. Create a new Vercel project and import the repository.
3. Use the default Next.js framework settings.
4. Add environment variables in Vercel Project Settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

5. Deploy.

The MVP will deploy and run using mock data even before real marketplace integrations are added.

## Remaining Next Steps

- Replace mock auth with Supabase Auth.
- Read and write products, campaigns, alerts, and decisions from Supabase.
- Add role-aware route protection for admin and customer dashboards.
- Add product and campaign detail pages with full profit breakdown.
- Add real LINE notification integration.
- Add real marketplace API integrations after manual workflows are stable.
