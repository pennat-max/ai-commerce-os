alter table campaigns
  add column if not exists source_platform marketplace_platform,
  add column if not exists external_campaign_id text;

create unique index if not exists idx_campaigns_external_scan
  on campaigns (organization_id, source_platform, external_campaign_id)
  where external_campaign_id is not null;
