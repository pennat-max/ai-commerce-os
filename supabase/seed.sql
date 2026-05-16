insert into plans (id, name, monthly_price, store_limit, decision_limit) values
('00000000-0000-0000-0000-000000000101', 'Starter', 990, 2, 5000),
('00000000-0000-0000-0000-000000000102', 'Growth', 2490, 6, 25000),
('00000000-0000-0000-0000-000000000103', 'Scale', 6990, 20, 100000);

insert into organizations (id, name) values
('10000000-0000-0000-0000-000000000001', 'บ้านสวยออนไลน์'),
('10000000-0000-0000-0000-000000000002', 'Gadget Hub TH');

insert into subscriptions (organization_id, plan_id, status, current_period_start, current_period_end) values
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'active', '2026-05-01', '2026-05-31'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000101', 'active', '2026-05-01', '2026-05-31');

insert into stores (id, organization_id, name, platform) values
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Shopee บ้านสวย', 'shopee'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Lazada บ้านสวย', 'lazada'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'TikTok บ้านสวย', 'tiktok');

insert into platform_connections (organization_id, store_id, platform, status, external_shop_id) values
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'shopee', 'mock_connected', 'mock-shopee-001'),
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'lazada', 'mock_connected', 'mock-lazada-001'),
('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'tiktok', 'mock_connected', 'mock-tiktok-001');

insert into products (
  id, organization_id, store_id, sku, name, platform, cost, selling_price, stock,
  shipping_cost, platform_fee_percent, ads_cost, affiliate_commission_percent,
  packaging_cost, other_cost, min_profit, min_margin_percent
) values
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'HOME-LED-01', 'โคมไฟ LED ตั้งโต๊ะ', 'shopee', 130, 299, 18, 22, 6, 18, 3, 9, 4, 45, 16),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'HOME-BOX-02', 'กล่องเก็บของพับได้', 'lazada', 85, 159, 8, 18, 5, 12, 2, 7, 3, 25, 15),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 'HOME-MOP-03', 'ม็อบรีดน้ำ 360 องศา', 'tiktok', 210, 329, 42, 30, 7, 35, 5, 12, 6, 40, 14);

insert into campaigns (
  id, organization_id, product_id, name, campaign_discount, shop_voucher,
  coins_cashback, shipping_subsidy, starts_at, ends_at
) values
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Shopee Flash Sale 6.6', 20, 10, 4, 12, '2026-06-06', '2026-06-07'),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Lazada Payday Boost', 18, 8, 3, 10, '2026-05-25', '2026-05-26'),
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'TikTok Live Mega Deal', 45, 20, 8, 18, '2026-05-20', '2026-05-22');

insert into profit_rules (organization_id, product_id, min_profit, min_margin_percent)
select organization_id, id, min_profit, min_margin_percent from products;

insert into campaign_decisions (
  organization_id, campaign_id, product_id, recommendation, action, net_profit, margin_percent, note
) values
('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'GOOD', 'approve', 77.09, 25.79, 'กำไรและมาร์จินผ่านเกณฑ์'),
('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'WARNING', 'watch', 13.87, 8.72, 'ยังมีกำไร แต่ต่ำกว่าเกณฑ์'),
('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'DANGER', 'watch', -38.48, -11.70, 'แคมเปญนี้ทำให้ขาดทุน');

insert into alerts (organization_id, channel, severity, title, message) values
('10000000-0000-0000-0000-000000000001', 'line', 'DANGER', 'LINE mock: SKU เสี่ยงขาดทุน', 'HOME-MOP-03 มีแคมเปญที่กำไรติดลบ'),
('10000000-0000-0000-0000-000000000001', 'email', 'WARNING', 'Email mock: สต็อกต่ำ', 'HOME-BOX-02 เหลือ 8 ชิ้น'),
('10000000-0000-0000-0000-000000000001', 'dashboard', 'GOOD', 'Dashboard: รออนุมัติ', 'มี 2 แคมเปญรอการตัดสินใจ');
