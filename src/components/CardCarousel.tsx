"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import type { PropertyImage } from "@/lib/types";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

/**
 * The photo area of an auction card: a slide track with the card's own badges
 * and caption layered over it as `children`.
 *
 * Only the controls are lifted above the card's stretched link, so tapping the
 * photograph still opens the listing while the arrows and dots page through the
 * images in place.
 */
export function CardCarousel({
  images,
  title,
  lang = "en",
  children,
}: {
  images: PropertyImage[];
  title: string;
  lang?: Lang;
  children?: ReactNode;
}) {
  const t = dictionaries[lang].common;
  const [active, setActive] = useState(0);
  const count = images.length;
  // Wraps in both directions, so neither arrow is ever a dead end.
  const go = (i: number) => setActive((i + count) % count);

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-parchment">
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {images.map((im, i) => (
          <div key={im.id} className="relative h-full w-full shrink-0">
            {/* Only the current slide and its neighbours are mounted: a grid of
                cards would otherwise fetch every photograph of every listing
                on first paint. */}
            {Math.abs(i - active) <= 1 && (
              <Image
                src={im.url}
                alt={im.alt || title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
        ))}
      </div>

      {children}

      {count > 1 && (
        <>
          {/* z-20 clears the card's stretched link, which would otherwise
              swallow these clicks; the arrows stay visible rather than
              appearing on hover, as a touch device never hovers. */}
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label={t.previousPhoto}
            className="pointer-events-auto absolute left-2 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/80 text-evergreen-900 shadow-card backdrop-blur-sm transition-colors hover:bg-ivory focus-visible:bg-ivory"
          >
            <ChevronIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label={t.nextPhoto}
            className="pointer-events-auto absolute right-2 top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/80 text-evergreen-900 shadow-card backdrop-blur-sm transition-colors hover:bg-ivory focus-visible:bg-ivory"
          >
            <ChevronIcon className="size-4 rotate-180" />
          </button>

          {/* Sits above the caption row rather than beside it, so a long
              municipality name never collides with the dots. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center gap-1.5">
            {images.map((im, i) => (
              <button
                key={im.id}
                type="button"
                onClick={() => go(i)}
                aria-label={t.goToPhoto(i + 1)}
                aria-current={i === active}
                className={`pointer-events-auto h-1.5 rounded-full shadow-[0_1px_3px_rgba(0,0,0,.65)] transition-all duration-300 ${
                  i === active ? "w-4 bg-brass-300" : "w-1.5 bg-ivory/80 hover:bg-ivory"
                }`}
              />
            ))}
          </div>

          <span className="sr-only" aria-live="polite">
            {t.photoOf(active + 1, count)}
          </span>
        </>
      )}
    </div>
  );
}
