-- Now that the admin panel reads view counters, mirror the SELECT policy on
-- `properties` exactly: published listings are public, and an unpublished
-- listing's counter is visible only to its own institution's staff (or a
-- platform admin). The previous policy allowed any signed-in admin to read any
-- counter, which is wider than the listing it describes.
drop policy if exists "public read view stats of published properties"
  on public.property_view_stats;

create policy "read view stats with the listing"
  on public.property_view_stats
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_view_stats.property_id
        and (
          p.is_published
          or (
            is_admin()
            and (is_platform_admin() or p.organization_id = current_org())
          )
        )
    )
  );
