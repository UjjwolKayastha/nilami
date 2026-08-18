"use client";

import { useEffect, useState } from "react";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";

/**
 * Listings already reported from this browser session. Guards against React's
 * double-invoked effects in development and against re-navigating back to a
 * listing counting a second time.
 */
const reported = new Set<string>();

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

export function ViewCount({
  slug,
  initial,
  lang = "en",
}: {
  slug: string;
  initial: number;
  lang?: Lang;
}) {
  // Server-rendered count, excluding this visit; the beacon returns the total
  // including it, so the reader sees their own view land.
  const [views, setViews] = useState(initial);

  useEffect(() => {
    if (reported.has(slug)) return;
    reported.add(slug);

    let active = true;
    fetch(`/auctions/${encodeURIComponent(slug)}/view`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d?.counted && typeof d.views === "number") setViews(d.views);
      })
      .catch(() => {
        // A dropped beacon just means this view goes uncounted — nothing the
        // visitor needs to hear about.
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
      <EyeIcon className="size-4" />
      <span className="tabular-nums">{dictionaries[lang].detail.views(views)}</span>
    </span>
  );
}
