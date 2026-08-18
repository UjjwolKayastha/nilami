-- Outbound link for the "Visit Bank Auction" action on the institution card
-- shown on a listing's detail page. Nullable: with no website set, the card
-- falls back to a mailto enquiry as its primary action.
alter table public.organizations
  add column if not exists website text;
