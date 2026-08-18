-- Map pin and walkthrough video for a listing.
--
-- `latitude`/`longitude` are written by the OpenStreetMap picker in the admin
-- property form and read by the read-only map on the public detail page. Both
-- stay nullable: a listing without a pin simply renders no map section.
--
-- `video_url` holds a YouTube, Vimeo or direct media link. It is resolved and
-- validated in application code (src/lib/video.ts) rather than constrained
-- here, so an unrecognised host renders nothing instead of reaching an iframe.
alter table public.properties
  add column if not exists latitude  numeric,
  add column if not exists longitude numeric;

alter table public.properties
  add column if not exists video_url text;
