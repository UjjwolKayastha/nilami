import Image from "next/image";
import Link from "next/link";
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
  const cover = property.images?.[0];
  // Staff-set status, corrected for a deadline that has already passed.
  const status = displayStatus(auction);
  const hasPin = property.latitude != null && property.longitude != null;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift rise rise-${(index % 3) + 1}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-parchment">
        {cover && (
          <Image
            src={cover.url}
            alt={cover.alt || property.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <StatusBadge status={status} lang={lang} />
          <span className="rounded-full bg-ink/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-ivory backdrop-blur-sm">
            {typeLabel(property.type, lang)}
          </span>
        </div>
      </div>
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
          <div className="mt-2 flex items-center gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-sm text-ink-soft">
              <PinIcon className="size-4 shrink-0 text-brass-500" />
              <span className="truncate">
                {property.municipality}, {property.district}
              </span>
            </p>
            {hasPin && (
              <Link
                href={`/auctions/${property.slug}#location`}
                aria-label={t.common.viewOnMap}
                title={t.common.viewOnMap}
                className="relative z-10 ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-evergreen-800/20 text-evergreen-800 transition-colors hover:bg-evergreen-800 hover:text-ivory"
              >
                <MapIcon className="size-4" />
              </Link>
            )}
          </div>
          {property.organization && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-evergreen-50 px-3 py-1 text-xs font-semibold text-evergreen-800">
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
