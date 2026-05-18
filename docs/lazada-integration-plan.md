# Lazada API Integration Plan

Issue: #21 Prepare Lazada API Integration Plan

Status: planning only. Do not connect real Lazada APIs in this phase.

## Goal

Prepare AI Commerce OS for a controlled Lazada integration after the operations data model, CRUD, analytics, and demo flow are stable.

The first live integration should read data and reconcile it into existing app concepts before any write automation is enabled.

## Current Foundations

- Multi-tenant data model uses `organization_id`.
- Store-level marketplace links already fit `stores` and `platform_connections`.
- Product, campaign, order, packing, return, and claim screens already support mock/demo mode.
- Operations tables exist for order workflow, packing tasks, return cases, and claim cases.
- Existing repository pattern supports mock fallback when Supabase is disabled, not configured, or empty.

## Official Docs Checked

- Lazada Open Platform documentation index and System API sections: https://open.alitrip.com/docs/doc.htm?articleId=108520&docType=1&treeId=499
- Lazada Push Mechanism and webhook documentation: https://open.alitrip.com/docs/doc.htm?articleId=120168&docType=1&treeId=499
- Lazada Getting Started page: https://open.lazada.com/doc/doc.htm?docId=108073&nodeId=10722

Exact endpoint names, scopes, regional hosts, and permission names must be rechecked in the LazOP console/API Explorer immediately before implementation.

## Integration Principles

1. Keep mock/demo mode available at all times.
2. Start read-only.
3. Sync into internal tables first, then let the UI read through repositories.
4. Never trust marketplace payloads without tenant, store, and idempotency checks.
5. Store credentials per store, not globally.
6. Treat write actions as manual approval until Auto Mode is explicitly released.

## Target Architecture

```text
Lazada Seller
  -> OAuth authorize
  -> /api/marketplaces/lazada/callback
  -> platform_connections token metadata
  -> Sync jobs / webhooks
  -> repositories
  -> products, operation_orders, return_cases, claim_cases, alerts
  -> premium mobile UI
```

Recommended modules:

- `lib/marketplaces/lazada/client.ts`: signed request helper, timeout, retry, error normalization.
- `lib/marketplaces/lazada/auth.ts`: OAuth URL builder, code exchange, token refresh.
- `lib/marketplaces/lazada/mappers.ts`: Lazada payload to internal product/order/return shapes.
- `lib/marketplaces/lazada/sync.ts`: idempotent sync orchestration.
- `app/api/marketplaces/lazada/callback/route.ts`: OAuth callback.
- `app/api/marketplaces/lazada/sync/route.ts`: manual or cron sync endpoint.
- `app/api/webhooks/lazada/route.ts`: webhook receiver.

Do not replace existing repositories. Add Lazada as a data source behind the same repository boundaries.

## Auth And Token Plan

Use seller OAuth authorization:

- Owner starts connection from `/app/settings`.
- App redirects seller to Lazada authorization URL.
- Callback receives authorization code and validates signed state.
- Server exchanges code for access token and refresh token.
- Store token metadata against the selected `platform_connections` row.

Production token storage expectations:

- Do not expose tokens to the browser.
- Encrypt access and refresh tokens before storing.
- Store expiry timestamp and Lazada seller/site identifiers.
- Refresh token before sync if close to expiry.
- Write token refresh events to `audit_logs`.

Current schema note:

- `platform_connections.credentials` can hold encrypted token metadata for MVP.
- A future migration should split token ciphertext, expiry, seller id, site, and scope into explicit columns if reporting/querying is needed.
- No schema change is made in this issue.

## Required Environment Variables

Server-only:

- `LAZADA_APP_KEY`
- `LAZADA_APP_SECRET`
- `LAZADA_AUTH_REDIRECT_URI`
- `LAZADA_API_BASE_URL`
- `LAZADA_AUTH_BASE_URL`
- `LAZADA_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

Client-visible only if needed for UI copy, never for secrets:

- `NEXT_PUBLIC_APP_URL`

For local single-store sandbox only:

- `LAZADA_ACCESS_TOKEN`

Production should not rely on a global access token because every customer store needs its own authorization.

## Scope Request Plan

Request the minimum LazOP permissions needed for the MVP:

- Read products and inventory.
- Read orders and order items.
- Read fulfillment/order status.
- Read reverse orders, returns, and refunds.
- Read sponsored/promotion data only after campaign mapping is ready.

Defer write scopes until manual approval is validated:

- Price update.
- Stock update.
- Campaign or promotion action.
- Fulfillment action.

## Data Mapping

Products:

- Lazada SKU -> `products.sku`
- Lazada item name -> `products.name`
- Platform -> `lazada`
- Price -> `products.selling_price`
- Inventory quantity -> `products.stock`
- Cost remains user-owned or imported from existing product settings, not Lazada.

Orders:

- Lazada order id -> `operation_orders.external_order_id`
- Lazada order number -> `operation_orders.order_number`
- Buyer/customer display name -> `operation_orders.customer_name`
- Status -> `operation_orders.status`
- Tracking/carrier -> `operation_orders.tracking_number` and `carrier`
- Line items -> `operation_order_items`

Returns and claims:

- Reverse order id -> `return_cases.external_case_id`
- Related order id -> `return_cases.order_id`
- Reverse order status -> `return_cases.status`
- Reason/evidence -> `reason`, `evidence_label`, `suggested_action`
- Carrier/claim amount -> `claim_cases` when the case is a carrier or marketplace claim

Campaigns:

- Keep Lazada campaign data read-only at first.
- Map campaign candidates to existing profit calculator inputs before creating or updating `campaigns`.
- Manual approval remains required for any seller-facing recommendation.

## Sync Boundaries

Phase A: connection readiness

- Add connection UI state only.
- Validate OAuth and token refresh in a sandbox store.
- No production marketplace writes.

Phase B: read-only product and order sync

- Pull Lazada products and inventory.
- Pull orders updated since the last cursor.
- Upsert by `(organization_id, platform, external_order_id)`.
- Insert status events only when status changes.

Phase C: returns and claims sync

- Pull reverse order updates.
- Link cases to internal orders by external order id.
- Upsert return and claim cases.
- Add dashboard alerts for high-cost or unresolved cases.

Phase D: campaign read model

- Pull eligible Lazada promotion/campaign data if API scope is approved.
- Run `calculateProfit()` and `recommendCampaignDecision()`.
- Keep actions manual.

## Webhook And Polling Strategy

Use Lazada webhooks where approved:

- Trade order notifications.
- Fulfillment order update notifications.
- Reverse order notifications.
- Authorization token expiration alerts.

Webhook handler requirements:

- HTTPS endpoint only.
- Verify Lazada signature/authorization header before processing.
- Store raw event hash for idempotency.
- Enqueue a sync-by-id job instead of trusting webhook payload as the full source of truth.
- Return fast and retry safely.

Polling remains the fallback:

- Cron sync every 15 to 30 minutes for updated orders/products.
- Shorter interval only for stores with active demo sessions or high order volume.
- Respect Lazada rate limits from the current LazOP console.

## Idempotency And Retry

Every sync operation must be idempotent:

- Use external ids plus `organization_id`.
- Avoid duplicate order items by replacing items within a transaction or upserting deterministic keys.
- Insert status events only when `(order_id, status, source timestamp)` is new.
- Use exponential backoff for 429/5xx.
- Do not retry permanent validation or permission errors.

## Audit And Alerts

Write `audit_logs` for:

- Store connected/disconnected.
- Token refreshed.
- Sync started/completed/failed.
- Marketplace payload rejected.
- Manual action created from a Lazada recommendation.

Create dashboard alerts for:

- Token expiring or authorization revoked.
- Sync failed for more than one cycle.
- New high-cost return/claim.
- Order stuck in packing or fulfillment status.

## Security And RLS

- All synced rows must include `organization_id`.
- Server routes must resolve the current user and organization before starting manual sync.
- Cron/server sync may use service role but must scope each job by organization and store.
- Never let a customer request arbitrary organization ids.
- Do not bypass RLS in UI repositories.

## Deployment Readiness

Before enabling live Lazada:

- Vercel env vars are present.
- OAuth callback URL is registered in LazOP.
- Webhook URL is HTTPS and registered in LazOP.
- Supabase RLS passes owner/staff isolation checks.
- Mock/demo mode still works with `NEXT_PUBLIC_DATA_SOURCE=mock`.
- Build, lint, and smoke routes pass:
  - `/login`
  - `/app`
  - `/app/settings`
  - `/app/products`
  - `/app/orders`
  - `/app/orders/returns`

## Rollout Plan

1. Internal sandbox store only.
2. One friendly seller store, read-only sync.
3. Enable order and return alerts.
4. Enable campaign recommendations.
5. Add write scopes behind manual approval.
6. Add Auto Mode only after action logs, rollback rules, and seller consent are complete.

## Open Decisions

- Token encryption approach: Supabase Vault, application-level encryption, or external secret manager.
- Job queue: Vercel cron plus Supabase tables, or a dedicated queue worker.
- Webhook event storage table: reuse `audit_logs` short term or create `marketplace_events` later.
- Explicit external id columns/indexes for products/orders/returns in a future migration.
- Country/site rollout order: Thailand first, then other Lazada regions after endpoint and policy verification.
