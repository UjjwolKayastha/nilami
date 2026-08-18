import type { Property } from "@/lib/types";

/**
 * PostgREST embed that joins a listing's view counter onto a `properties` row.
 * Recorded by POST /auctions/[slug]/view; see the property_view_stats table.
 */
export const VIEW_STATS_SELECT = "view_stats:property_view_stats(view_count)";

type ViewStatsRow = { view_count: number };

type WithViewStats = Partial<Pick<Property, "view_count">> & {
  view_stats?: ViewStatsRow | ViewStatsRow[] | null;
};

/**
 * Flatten the joined counter onto `view_count` and drop the embed. A listing
 * nobody has opened yet has no row in property_view_stats, so it counts as 0.
 */
export function hydrateViewCount(property: WithViewStats): void {
  const stats = Array.isArray(property.view_stats)
    ? property.view_stats[0]
    : property.view_stats;
  property.view_count = Number(stats?.view_count ?? 0);
  delete property.view_stats;
}

/** Grouped view total for a table cell, e.g. "1,204". */
export function formatViews(n: number | undefined): string {
  return (n ?? 0).toLocaleString("en-IN");
}
