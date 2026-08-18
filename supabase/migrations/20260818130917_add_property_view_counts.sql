-- Per-listing view counters.
--
-- Kept in their own table rather than as a column on `properties` so that
-- counting a view never touches the listing row itself: `properties` carries a
-- BEFORE UPDATE trigger (set_updated_at) that would stamp updated_at on every
-- page hit, and the admin panel's upsert would contend with the counter.
create table if not exists public.property_view_stats (
  property_id uuid primary key
    references public.properties (id) on delete cascade,
  view_count bigint not null default 0,
  last_viewed_at timestamptz
);

alter table public.property_view_stats enable row level security;

-- Same visibility rule as the listing itself: anyone may read the counter of a
-- published property; staff additionally see their own institution's rows.
drop policy if exists "public read view stats of published properties"
  on public.property_view_stats;
create policy "public read view stats of published properties"
  on public.property_view_stats
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_view_stats.property_id
        and p.is_published
    )
    or is_admin()
  );

-- Writes go exclusively through this function. It is SECURITY DEFINER so an
-- anonymous visitor can record a view without holding UPDATE on the table, and
-- it can only ever increment an existing, published listing by one.
create or replace function public.record_property_view(p_slug text)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_property_id uuid;
  v_count bigint;
begin
  select id
    into v_property_id
    from public.properties
   where slug = p_slug
     and is_published;

  if v_property_id is null then
    return null;
  end if;

  insert into public.property_view_stats as s (property_id, view_count, last_viewed_at)
       values (v_property_id, 1, now())
  on conflict (property_id) do update
          set view_count = s.view_count + 1,
              last_viewed_at = now()
    returning s.view_count into v_count;

  return v_count;
end;
$$;

revoke all on function public.record_property_view(text) from public;
grant execute on function public.record_property_view(text) to anon, authenticated;

grant select on public.property_view_stats to anon, authenticated;
revoke insert, update, delete on public.property_view_stats from anon, authenticated;
