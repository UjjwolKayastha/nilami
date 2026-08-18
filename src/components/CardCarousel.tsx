"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";

import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import type { PropertyImage } from "@/lib/types";

/** Ignore the first few pixels, so a tap is never read as a tiny swipe. */
const SLOP = 8;

/**
 * The photo area of an auction card: a slide track with the card's own badges
 * and caption layered over it as `children`.
 *
 * Only the dots are lifted above the card's stretched link, so tapping the
 * photograph still opens the listing while the dots page through the images in
 * place.
 *
 * `href` is the listing the photograph links to. The carousel needs to own that
 * link: the card's stretched link is a sibling's `::after`, so a touch on the
 * photograph lands outside this subtree and no swipe handler here would ever
 * see it. Laying our own link over the slides puts the gesture back in reach.
 */
export function CardCarousel({
  images,
  title,
  href,
  lang = "en",
  children,
}: {
  images: PropertyImage[];
  title: string;
  href?: string;
  lang?: Lang;
  children?: ReactNode;
}) {
  const t = dictionaries[lang].common;
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const holder = useRef<HTMLDivElement>(null);
  // The live gesture, and whether the last one travelled far enough to be a
  // swipe — both are read inside handlers, so neither may trigger a render.
  const gesture = useRef<{ x: number; y: number; axis: "" | "x" | "y"; dx: number } | null>(null);
  const swiped = useRef(false);
  const count = images.length;

  function onTouchStart(e: React.TouchEvent) {
    if (count < 2) return;
    const touch = e.touches[0];
    gesture.current = { x: touch.clientX, y: touch.clientY, axis: "", dx: 0 };
    swiped.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    const g = gesture.current;
    if (!g) return;
    const touch = e.touches[0];
    const dx = touch.clientX - g.x;
    const dy = touch.clientY - g.y;

    // Lock to whichever axis the finger commits to first, so a vertical scroll
    // that drifts sideways never drags the slides. `touch-pan-y` on the root
    // leaves the page free to scroll when the answer is "y".
    if (g.axis === "") {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (g.axis !== "x") return;

    // Past either end there is nothing to pull in, so the slide resists.
    const atEnd = (dx > 0 && active === 0) || (dx < 0 && active === count - 1);
    g.dx = atEnd ? dx * 0.3 : dx;
    setDrag(g.dx);
  }

  function onTouchEnd() {
    const g = gesture.current;
    gesture.current = null;
    setDrag(0);
    if (!g || g.axis !== "x") return;

    swiped.current = Math.abs(g.dx) > SLOP;
    const width = holder.current?.clientWidth ?? 0;
    if (Math.abs(g.dx) > Math.min(60, width * 0.18)) {
      const next = active + (g.dx < 0 ? 1 : -1);
      setActive(Math.max(0, Math.min(count - 1, next)));
    }
  }

  // A swipe that ends over the photograph would otherwise open the listing.
  function onClickCapture(e: React.MouseEvent) {
    if (!swiped.current) return;
    swiped.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      ref={holder}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onClickCapture={onClickCapture}
      className="relative aspect-[16/10] touch-pan-y overflow-hidden bg-parchment"
    >
      <div
        className={`flex h-full w-full ${
          drag === 0 ? "transition-transform duration-500 ease-out" : ""
        }`}
        style={{ transform: `translateX(calc(${-active * 100}% + ${drag}px))` }}
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

      {/* Above the card's stretched link so the gesture starts inside this
          subtree; behind everything the card layers on top of it. */}
      {href && (
        <Link
          href={href}
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 z-10"
        />
      )}

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
