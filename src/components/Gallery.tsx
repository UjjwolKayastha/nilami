"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";
import type { PropertyImage } from "@/lib/types";

/** Ignore the first few pixels, so a tap is never read as a tiny swipe. */
const SLOP = 8;

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={back ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Gallery({
  images,
  title,
  lang = "en",
}: {
  images: PropertyImage[];
  title: string;
  lang?: Lang;
}) {
  const t = dictionaries[lang].common;
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  // The live gesture is read inside handlers, so it must not trigger a render.
  const gesture = useRef<{ x: number; y: number; axis: "" | "x" | "y"; dx: number } | null>(null);
  const count = images.length;

  const go = (i: number) => setActive(Math.max(0, Math.min(count - 1, i)));

  // Follow the selection in the thumbnail strip, which scrolls once there are
  // more thumbs than fit. Skipped on first paint so opening a listing never
  // moves the page.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    strip.current
      ?.querySelector(`[data-thumb="${active}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [active]);

  if (count === 0) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-3xl bg-parchment text-ink-soft">
        {t.photosPending}
      </div>
    );
  }

  function onTouchStart(e: React.TouchEvent) {
    if (count < 2) return;
    const touch = e.touches[0];
    gesture.current = { x: touch.clientX, y: touch.clientY, axis: "", dx: 0 };
  }

  function onTouchMove(e: React.TouchEvent) {
    const g = gesture.current;
    if (!g) return;
    const touch = e.touches[0];
    const dx = touch.clientX - g.x;
    const dy = touch.clientY - g.y;

    // Lock to whichever axis the finger commits to first, so a vertical scroll
    // that drifts sideways never drags the photographs. `touch-pan-y` leaves
    // the page free to scroll when the answer is "y".
    if (g.axis === "") {
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (g.axis !== "x") return;

    // Past either end there is nothing to pull in, so the frame resists.
    const atEnd = (dx > 0 && active === 0) || (dx < 0 && active === count - 1);
    g.dx = atEnd ? dx * 0.3 : dx;
    setDrag(g.dx);
  }

  function onTouchEnd() {
    const g = gesture.current;
    gesture.current = null;
    setDrag(0);
    if (!g || g.axis !== "x") return;
    const width = frame.current?.clientWidth ?? 0;
    if (Math.abs(g.dx) > Math.min(60, width * 0.18)) {
      go(active + (g.dx < 0 ? 1 : -1));
    }
  }

  const arrowCls =
    "absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-evergreen-950/55 text-ivory backdrop-blur-sm transition hover:bg-evergreen-950/75 disabled:pointer-events-none disabled:opacity-0";

  return (
    <div className="space-y-3">
      <div
        ref={frame}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(active - 1);
          if (e.key === "ArrowRight") go(active + 1);
        }}
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? "group" : undefined}
        aria-roledescription={count > 1 ? "carousel" : undefined}
        aria-label={count > 1 ? title : undefined}
        className="relative aspect-[16/10] touch-pan-y overflow-hidden rounded-3xl bg-parchment shadow-card outline-none focus-visible:ring-2 focus-visible:ring-evergreen-600"
      >
        <div
          className={`flex h-full w-full ${
            drag === 0 ? "transition-transform duration-500 ease-out" : ""
          }`}
          style={{ transform: `translateX(calc(${-active * 100}% + ${drag}px))` }}
        >
          {images.map((im, i) => (
            <div key={im.id} className="relative h-full w-full shrink-0">
              {/* Only the current photograph and its neighbours are mounted. */}
              {Math.abs(i - active) <= 1 && (
                <Image
                  src={im.url}
                  alt={im.alt || title}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label={t.previousPhoto}
              className={`${arrowCls} left-3`}
            >
              <Chevron back />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              disabled={active === count - 1}
              aria-label={t.nextPhoto}
              className={`${arrowCls} right-3`}
            >
              <Chevron />
            </button>
            <span className="sr-only" aria-live="polite">
              {t.photoOf(active + 1, count)}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        // Scrolls rather than widening the page: four 96px thumbs plus gaps is
        // 420px of min-content, which a grid column with the default
        // `min-width:auto` would otherwise have to grow to accommodate.
        <div ref={strip} className="flex gap-3 overflow-x-auto">
          {images.map((im, i) => (
            <button
              key={im.id}
              type="button"
              data-thumb={i}
              onClick={() => go(i)}
              aria-label={t.goToPhoto(i + 1)}
              aria-current={i === active}
              className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                i === active
                  ? "border-brass-500 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={im.url} alt={im.alt} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
