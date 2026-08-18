import Link from "next/link";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import { listingHref, pageWindow, type ListingParams } from "@/lib/pagination";

/** Plain links, so pages are crawlable and work before hydration. */

const CELL =
  "inline-flex size-9 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors sm:size-10";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      <path d={dir === "left" ? "M14.5 6 9 12l5.5 6" : "M9.5 6 15 12l-5.5 6"} />
    </svg>
  );
}

function Arrow({
  dir,
  href,
  label,
}: {
  dir: "left" | "right";
  href: string | null;
  label: string;
}) {
  if (!href)
    return (
      <span className={`${CELL} text-ink/20`} aria-hidden>
        <Chevron dir={dir} />
      </span>
    );
  return (
    <Link
      href={href}
      aria-label={label}
      rel={dir === "left" ? "prev" : "next"}
      className={`${CELL} text-ink-soft hover:bg-cream hover:text-evergreen-800`}
    >
      <Chevron dir={dir} />
    </Link>
  );
}

export function Pagination({
  basePath,
  params,
  page,
  totalPages,
  lang = "en",
}: {
  basePath: string;
  /** Current query params; everything but `page` is carried across. */
  params: ListingParams;
  page: number;
  totalPages: number;
  lang?: Lang;
}) {
  if (totalPages <= 1) return null;
  const l = dictionaries[lang].listing;

  // Page 1 is the bare URL rather than ?page=1, so it matches the entry link.
  const hrefFor = (n: number) =>
    listingHref(basePath, params, { page: n === 1 ? undefined : String(n) });

  return (
    <nav aria-label={l.pagination} className="mt-14 flex justify-center">
      <div className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1.5 shadow-card">
        <Arrow
          dir="left"
          href={page > 1 ? hrefFor(page - 1) : null}
          label={l.prevPage}
        />

        {/* Numbers on tablet and up; a phone gets "Page 2 of 5" so a long run
            can never push the control past the screen edge. */}
        <span className="px-3 text-sm font-medium tabular-nums text-ink-soft sm:hidden">
          {l.pageOf(page, totalPages)}
        </span>

        <span className="hidden items-center gap-1 sm:inline-flex">
          {pageWindow(page, totalPages).map((item, i) =>
            item === "gap" ? (
              <span
                key={`gap-${i}`}
                className={`${CELL} text-ink-soft/60`}
                aria-hidden
              >
                …
              </span>
            ) : item === page ? (
              <span
                key={item}
                aria-current="page"
                className={`${CELL} bg-evergreen-900 text-ivory shadow-lift ring-1 ring-brass-500/40`}
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={hrefFor(item)}
                aria-label={l.gotoPage(item)}
                className={`${CELL} text-ink-soft hover:bg-cream hover:text-evergreen-800`}
              >
                {item}
              </Link>
            )
          )}
        </span>

        <Arrow
          dir="right"
          href={page < totalPages ? hrefFor(page + 1) : null}
          label={l.nextPage}
        />
      </div>
    </nav>
  );
}
