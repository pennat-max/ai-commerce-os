-- Run AFTER creating Supabase Auth users in Authentication > Users.
--
-- Demo accounts:
--   admin@example.com   -> SUPER_ADMIN
--   owner@example.com   -> CUSTOMER_OWNER (org: บ้านสวยออนไลน์)
--   staff@example.com   -> CUSTOMER_STAFF

update public.commerce_profiles
set role = 'SUPER_ADMIN', full_name = 'แอดมินระบบ'
where email = 'admin@example.com';

update public.commerce_profiles
set role = 'CUSTOMER_OWNER', full_name = 'คุณเมย์'
where email = 'owner@example.com';

update public.commerce_profiles
set role = 'CUSTOMER_STAFF', full_name = 'ทีมแพ็กของ'
where email = 'staff@example.com';

insert into public.organization_members (organization_id, profile_id, role)
select
  '10000000-0000-0000-0000-000000000001',
  cp.id,
  cp.role
from public.commerce_profiles cp
where cp.email in ('owner@example.com', 'staff@example.com')
on conflict (organization_id, profile_id) do update
set role = excluded.role;

update public.organizations
set owner_profile_id = (
  select id from public.commerce_profiles where email = 'owner@example.com' limit 1
)
where id = '10000000-0000-0000-0000-000000000001';
