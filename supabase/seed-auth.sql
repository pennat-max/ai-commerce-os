-- Run AFTER creating Supabase Auth users in Authentication > Users.
--
-- Demo accounts (set passwords in Supabase dashboard):
--   admin@example.com   -> SUPER_ADMIN
--   owner@example.com   -> CUSTOMER_OWNER (บ้านสวยออนไลน์)
--   staff@example.com   -> CUSTOMER_STAFF (บ้านสวยออนไลน์)
--
-- The handle_new_user trigger creates base profiles on signup.
-- This script assigns roles and organization membership.

update public.profiles
set role = 'SUPER_ADMIN', full_name = 'แอดมินระบบ'
where email = 'admin@example.com';

update public.profiles
set role = 'CUSTOMER_OWNER', full_name = 'คุณเมย์'
where email = 'owner@example.com';

update public.profiles
set role = 'CUSTOMER_STAFF', full_name = 'ทีมแพ็กของ'
where email = 'staff@example.com';

insert into public.organization_members (organization_id, profile_id, role)
select
  '10000000-0000-0000-0000-000000000001',
  p.id,
  p.role
from public.profiles p
where p.email in ('owner@example.com', 'staff@example.com')
on conflict (organization_id, profile_id) do update
set role = excluded.role;

update public.organizations
set owner_profile_id = (select id from public.profiles where email = 'owner@example.com' limit 1)
where id = '10000000-0000-0000-0000-000000000001';
