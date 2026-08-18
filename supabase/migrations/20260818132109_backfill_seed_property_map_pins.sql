-- Backfill map pins for the originally seeded listings.
--
-- The seed rows predate the coordinate columns, so `hasPin` was false for every
-- one of them and no listing page rendered a map. Points were resolved from each
-- row's own address via OpenStreetMap's Nominatim geocoder — the same dataset
-- behind the map tiles — and rounded to six decimals to match what the admin
-- panel's map picker writes.
--
-- Guarded on NULL so a re-run can never move a pin that an operator has since
-- placed by hand.
update public.properties as p
   set latitude  = v.lat,
       longitude = v.lng
  from (values
    ('budhanilkantha-residence',    27.756928, 85.349469),
    ('lazimpat-commercial-complex', 27.721508, 85.320765),
    ('bhaktapur-heritage-house',    27.673542, 85.435077),
    ('kupondole-apartment',         27.685361, 85.318428),
    ('pokhara-lakeside-plot',       28.217645, 83.958969),
    ('chitwan-highway-land',        27.695621, 84.423203),
    ('butwal-industrial-shed',      27.688776, 83.465543),
    ('biratnagar-family-home',      26.472829, 87.276565)
  ) as v(slug, lat, lng)
 where p.slug = v.slug
   and p.latitude is null
   and p.longitude is null;
