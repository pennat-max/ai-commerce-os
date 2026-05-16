-- Fix infinite recursion: commerce_profiles SELECT policy must not query commerce_profiles again.

drop policy if exists "commerce_profiles_self_or_super_admin_select" on commerce_profiles;

create policy "commerce_profiles_select_self"
on commerce_profiles for select
to authenticated
using (id = auth.uid());
