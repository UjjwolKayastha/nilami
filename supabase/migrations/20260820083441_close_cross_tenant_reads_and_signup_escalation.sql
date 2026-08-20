-- Security pass. Each item below was demonstrated against the database before
-- being changed, and the probes are repeatable.

-- 1. Signup could mint a platform admin.
--
-- The client passes organization_id and signup_role as user metadata and this
-- trigger copied both verbatim. The anon key is public, so the signup form is
-- not the boundary: calling auth.signUp directly with no organization_id
-- produced a profile with organization_id NULL, and is_platform_admin() is
-- "organization_id IS NULL AND approved" — one approval away from full access
-- to every institution. It also rendered in the approval queue as
-- "Platform / Platform Admin", the most legitimate-looking row on the page.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_org  uuid := nullif(new.raw_user_meta_data->>'organization_id', '')::uuid;
  v_role text := coalesce(new.raw_user_meta_data->>'signup_role', 'officer');
begin
  if v_org is null then
    raise exception 'An institution is required to register.';
  end if;
  if not exists (select 1 from organizations where id = v_org) then
    raise exception 'Unknown institution.';
  end if;
  if v_role not in ('officer', 'manager', 'valuer') then
    v_role := 'officer';
  end if;

  insert into public.profiles (id, full_name, email, role, organization_id, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    v_role,
    v_org,
    false
  );
  return new;
end;
$$;

-- 2. Any approved staff member could read every other institution's auctions,
--    including drafts. Demonstrated: a rival read an unpublished draft's
--    minimum bid before it was announced. Mirrors the properties policy now.
drop policy if exists "public read auctions of published properties" on public.auctions;
create policy "public read auctions of published properties"
  on public.auctions for select
  using (
    (status <> 'draft'::auction_status
     and exists (select 1 from properties p
                  where p.id = auctions.property_id and p.is_published))
    or (is_admin() and (is_platform_admin() or exists (
          select 1 from properties p
           where p.id = auctions.property_id
             and p.organization_id = current_org())))
  );

-- 3. Any approved staff member could read every staff profile in the system —
--    names, emails, roles, across all institutions.
drop policy if exists "admin read profiles" on public.profiles;
create policy "admin read profiles"
  on public.profiles for select
  using (
    is_platform_admin()
    or (is_admin() and organization_id = current_org())
  );

-- 4. Same OR is_admin() shape on images.
drop policy if exists "public read images of published properties" on public.property_images;
create policy "public read images of published properties"
  on public.property_images for select
  using (
    exists (select 1 from properties p
             where p.id = property_images.property_id and p.is_published)
    or (is_admin() and (is_platform_admin() or exists (
          select 1 from properties p
           where p.id = property_images.property_id
             and p.organization_id = current_org())))
  );

-- 5. Storage had no path scoping: any approved staff could delete or overwrite
--    any institution's photographs and logos. The application only ever
--    uploads and reads, so removing these from institution staff costs nothing.
drop policy if exists "admin delete property media" on storage.objects;
create policy "admin delete property media"
  on storage.objects for delete
  using (bucket_id = 'property-media' and is_platform_admin());

drop policy if exists "admin update property media" on storage.objects;
create policy "admin update property media"
  on storage.objects for update
  using (bucket_id = 'property-media' and is_platform_admin());

-- 6. request_organization is called from the signup form before the account
--    exists, so it has to stay reachable unauthenticated. Bound the damage
--    instead: a real email shape, and a ceiling on how many unapproved
--    institutions can be queued at once.
create or replace function public.request_organization(
  p_name text,
  p_name_np text default '',
  p_contact_email text default '',
  p_contact_phone text default '',
  p_address text default ''
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  oid uuid;
  base_slug text;
  final_slug text;
  n int := 1;
begin
  if length(trim(coalesce(p_name, ''))) < 3 then
    raise exception 'Institution name is too short.';
  end if;
  if trim(coalesce(p_contact_email, '')) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-z]{2,}$' then
    raise exception 'A valid contact email is required.';
  end if;
  if (select count(*) from organizations where not approved) >= 25 then
    raise exception 'Too many institution requests are awaiting review. Please try again later.';
  end if;

  base_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    raise exception 'Institution name is invalid.';
  end if;
  final_slug := base_slug;
  while exists (select 1 from organizations where slug = final_slug) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  insert into organizations (slug, name, name_np, contact_email, contact_phone, address, approved)
  values (final_slug, trim(p_name), trim(coalesce(p_name_np, '')),
          trim(p_contact_email), trim(coalesce(p_contact_phone, '')),
          trim(coalesce(p_address, '')), false)
  returning id into oid;
  return oid;
end $$;

-- 7. Staff approval was callable by anon. The is_platform_admin() guard held,
--    but nothing anonymous has business reaching it. The is_admin /
--    is_platform_admin / current_org helpers keep their grants: policy
--    expressions evaluate them as the querying role.
revoke execute on function public.approve_staff(uuid) from anon;
revoke execute on function public.reject_staff(uuid) from anon;
revoke execute on function public.handle_new_user() from anon, authenticated;
