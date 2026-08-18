"use client";

import { useRouter } from "next/navigation";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { listingHref, type ListingParams } from "@/lib/pagination";

/**
 * Rows-per-page control. Changing the size returns to page 1 — the old page
 * number would point somewhere else once the pages are re-cut.
 */
export function PageSizeSelect({
  basePath,
  params,
  size,
  sizes,
  lang = "en",
}: {
  basePath: string;
  params: ListingParams;
  size: number;
  sizes: readonly number[];
  lang?: Lang;
}) {
  const router = useRouter();
  const l = dictionaries[lang].listing;

  return (
    <label className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white py-1.5 pl-4 pr-1.5 shadow-card">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {l.perPage}
      </span>
      <span className="relative">
        <select
          value={size}
          onChange={(e) =>
            router.push(
              listingHref(basePath, params, {
                size: e.target.value,
                page: undefined,
              })
            )
          }
          className="h-8 cursor-pointer appearance-none rounded-full bg-cream pl-3.5 pr-8 text-sm font-semibold tabular-nums text-evergreen-900 outline-none transition-colors hover:bg-evergreen-50 focus-visible:ring-2 focus-visible:ring-evergreen-600"
        >
          {sizes.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}
