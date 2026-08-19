-- Lets an institution maintain its own logo, website and contact details.
--
-- RLS is row-level, so a policy granting staff UPDATE on their own row would
-- also let them rename the institution or set approved = true. This function
-- writes only the branding and contact columns instead, leaving name, slug and
-- approved under the platform admin's existing policy.
create or replace function public.update_organization_branding(
  p_org           uuid,
  p_logo_url      text,
  p_website       text,
  p_contact_email text,
  p_contact_phone text,
  p_address       text,
  p_address_np    text
)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if not is_admin() then
    raise exception 'Only approved staff can edit an institution.';
  end if;

  -- A platform admin may edit any institution; everyone else only their own.
  if not (is_platform_admin() or p_org = current_org()) then
    raise exception 'You can only edit your own institution.';
  end if;

  update organizations
     set logo_url      = nullif(btrim(coalesce(p_logo_url, '')), ''),
         website       = nullif(btrim(coalesce(p_website, '')), ''),
         contact_email = btrim(coalesce(p_contact_email, '')),
         contact_phone = btrim(coalesce(p_contact_phone, '')),
         address       = btrim(coalesce(p_address, '')),
         address_np    = btrim(coalesce(p_address_np, ''))
   where id = p_org;

  if not found then
    raise exception 'No such institution.';
  end if;
end;
$$;

revoke all on function public.update_organization_branding(
  uuid, text, text, text, text, text, text
) from public, anon;

grant execute on function public.update_organization_branding(
  uuid, text, text, text, text, text, text
) to authenticated;
