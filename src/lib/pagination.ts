/** Page sizes offered on the listings page. Multiples of 2 and 3 so the last
 *  row of the responsive grid is never left ragged. */
export const PAGE_SIZES = [6, 12, 24, 48] as const;
export const DEFAULT_PAGE_SIZE = 6;

export type ListingParams = Record<string, string | undefined>;

/** Clamp whatever arrived in ?size= to one of the offered sizes. */
export function parsePageSize(raw: string | undefined): number {
  const n = Number(raw);
  return (PAGE_SIZES as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

/** Clamp ?page= into 1…totalPages, so a stale or hand-typed page still renders. */
export function parsePage(raw: string | undefined, totalPages: number): number {
  const n = Math.trunc(Number(raw));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(totalPages, 1));
}

/**
 * The current URL with some params replaced. Empty values are dropped, so
 * `{ page: undefined }` returns to a clean first-page link.
 */
export function listingHref(
  basePath: string,
  params: ListingParams,
  overrides: ListingParams = {}
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Page numbers to render, "gap" where the run is broken. The ends keep a run of
 * three so the control's width stays steady as you move through the pages.
 */
export function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => wanted.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => wanted.add(p));

  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let previous = 0;
  for (const page of pages) {
    if (previous && page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
}
