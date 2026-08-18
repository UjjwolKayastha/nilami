import { displayStatus } from "@/lib/auction-status";
import { createClient } from "@/lib/supabase/server";
import type { Auction, Property } from "@/lib/types";
import { hydrateViewCount, VIEW_STATS_SELECT } from "@/lib/views";

export type AuctionWithProperty = Auction & { property: Property };

const AUCTION_SELECT = `*, property:properties(*, images:property_images(*), organization:organizations(*), ${VIEW_STATS_SELECT})`;

/** Sort the gallery and flatten the view-counter join onto `property.view_count`. */
function hydrate(a: AuctionWithProperty) {
  a.property.images?.sort((x, y) => x.sort_order - y.sort_order);
  hydrateViewCount(a.property);
  return a;
}

export async function getPublicAuctions(filters?: {
  status?: string;
  type?: string;
  district?: string;
  org?: string;
  q?: string;
}): Promise<AuctionWithProperty[]> {
  const supabase = await createClient();
  const query = supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .neq("status", "draft")
    .order("submission_deadline", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data as unknown as AuctionWithProperty[]).filter(
    (a) => a.property
  );
  // Filtered on the displayed status, so "open" never returns an auction
  // whose deadline has already gone by.
  if (filters?.status)
    rows = rows.filter((a) => displayStatus(a) === filters.status);
  if (filters?.type) rows = rows.filter((a) => a.property.type === filters.type);
  if (filters?.district)
    rows = rows.filter(
      (a) => a.property.district.toLowerCase() === filters.district!.toLowerCase()
    );
  if (filters?.org)
    rows = rows.filter((a) => a.property.organization?.slug === filters.org);
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (a) =>
        a.property.title.toLowerCase().includes(q) ||
        a.property.district.toLowerCase().includes(q) ||
        a.property.municipality.toLowerCase().includes(q)
    );
  }
  return rows.map(hydrate);
}

export async function getAuctionBySlug(
  slug: string
): Promise<AuctionWithProperty | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("auctions")
    .select(AUCTION_SELECT)
    .neq("status", "draft")
    .order("round", { ascending: false });
  if (error) throw error;
  const rows = (data as unknown as AuctionWithProperty[]).filter(
    (a) => a.property?.slug === slug
  );
  return rows.length ? hydrate(rows[0]) : null;
}

export async function getDistricts(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("district")
    .eq("is_published", true);
  return [...new Set((data ?? []).map((r) => r.district))].sort();
}

export async function getOrganizations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, slug, name, name_np")
    .order("name");
  return data ?? [];
}
