import Link from "next/link";
import { CardCarousel } from "@/components/CardCarousel";
import { Countdown } from "@/components/Countdown";
import { StatusBadge } from "@/components/StatusBadge";
import { displayStatus } from "@/lib/auction-status";
import { formatDate, nprCompact, typeLabel } from "@/lib/format";
import { dictionaries, orgName, type Lang } from "@/lib/i18n/dictionaries";
import type { Auction, Property } from "@/lib/types";

type IconProps = { className?: string };

function PinIcon({ className }: IconProps) {
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
      <path d="M12 21.5s7-6.4 7-11.5a7 7 0 1 0-14 0c0 5.1 7 11.5 7 11.5Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function MapIcon({ className }: IconProps) {
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
      <path d="M9 3.5 3.5 5.8v14.7L9 18.2l6 2.3 5.5-2.3V3.5L15 5.8 9 3.5Z" />
      <path d="M9 3.5v14.7M15 5.8v14.7" />
    </svg>
  );
}

export function AuctionCard({
  auction,
  property,
  index = 0,
  lang = "en",
}: {
  auction: Auction;
  property: Property;
  index?: number;
  lang?: Lang;
}) {
  const t = dictionaries[lang];
  // Staff-set status, corrected for a deadline that has already passed.
  const status = displayStatus(auction);
  const hasPin = property.latitude != null && property.longitude != null;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift rise rise-${(index % 3) + 1}`}
    >
      <CardCarousel
        images={property.images ?? []}
        title={property.title}
        lang={lang}
      >
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <StatusBadge status={status} lang={lang} variant="image" />
          <span className="rounded-full bg-ink/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ivory backdrop-blur-sm">
            {typeLabel(property.type, lang)}
          </span>
        </div>
        {/* Scrim so the caption stays legible over a pale photograph. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/85 via-ink/45 to-transparent p-3 pt-12">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-ivory">
            <PinIcon className="size-4 shrink-0 text-brass-300" />
            <span className="truncate">
              {property.municipality}, {property.district}
            </span>
          </p>
          {hasPin && (
            <Link
              href={`/auctions/${property.slug}#location`}
              aria-label={t.common.viewOnMap}
              title={t.common.viewOnMap}
              className="pointer-events-auto relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ivory/90 text-evergreen-900 shadow-card backdrop-blur-sm transition-colors hover:bg-ivory"
            >
              <MapIcon className="size-4.5" />
            </Link>
          )}
        </div>
      </CardCarousel>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-xl font-semibold leading-snug text-evergreen-900 group-hover:text-evergreen-700">
            {/* Stretched link: the whole card is clickable, bar the map button. */}
            <Link
              href={`/auctions/${property.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {property.title}
            </Link>
          </h3>
          {property.organization && (
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-evergreen-50 px-3 py-1 text-xs font-semibold text-evergreen-800">
              <span className="size-1.5 shrink-0 rounded-full bg-brass-500" />
              {orgName(property.organization, lang)}
            </p>
          )}
        </div>
        <div className="rule" />
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">
              {t.common.minimumBid}
            </p>
            <p className="font-display text-2xl font-semibold text-evergreen-800">
              {nprCompact(auction.minimum_bid, lang)}
              <span className="ml-1 text-xs font-normal text-ink-soft">
                {t.common.npr}
              </span>
            </p>
          </div>
          {status === "open" ? (
            <Countdown deadline={auction.submission_deadline} lang={lang} />
          ) : status === "sold" && auction.winning_amount ? (
            <span className="text-sm font-medium text-brass-600">
              {t.common.soldDot} · {nprCompact(auction.winning_amount, lang)}
            </span>
          ) : status === "closed" ? (
            <span className="text-right text-sm font-medium text-ink-soft">
              {t.common.closedOn(formatDate(auction.submission_deadline, lang))}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
