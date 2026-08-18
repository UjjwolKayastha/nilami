"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import type { PropertyImage } from "@/lib/types";

/**
 * The photo area of an auction card: a slide track with the card's own badges
 * and caption layered over it as `children`.
 *
 * Only the dots are lifted above the card's stretched link, so tapping the
 * photograph still opens the listing while the dots page through the images in
 * place.
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
          {/* The dots are the only control, so each carries generous padding
              as its hit area — the visible pill alone would be far too small a
              target on a touch screen. z-20 clears the card's stretched link,
              which would otherwise swallow the click. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-center">
            {images.map((im, i) => (
              <button
                key={im.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={t.goToPhoto(i + 1)}
                aria-current={i === active}
                className="group/dot pointer-events-auto grid place-items-center px-1.5 py-2.5"
              >
                <span
                  className={`block h-2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,.65)] transition-all duration-300 ${
                    i === active
                      ? "w-5 bg-brass-300"
                      : "w-2 bg-ivory/80 group-hover/dot:bg-ivory"
                  }`}
                />
              </button>
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
