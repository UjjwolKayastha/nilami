"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Item = { href: string; label: string };

/**
 * The narrow-screen half of the site nav. The bar has room for the logo, the
 * language switcher and this button — the links and the staff sign-in live
 * behind it rather than overflowing off the right edge.
 */
export function MobileMenu({
  links,
  cta,
  label,
}: {
  links: Item[];
  cta: Item;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (!holder.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={holder} className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="site-mobile-nav"
        aria-label={label}
        className="grid size-9 place-items-center rounded-full border border-evergreen-800/25 text-evergreen-800 transition-colors hover:bg-evergreen-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden
          className="size-5"
        >
          {open ? (
            <path d="m6 6 12 12M18 6 6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        // Anchored to the sticky header, so the panel hangs under the bar
        // across the full width of the screen.
        <nav
          id="site-mobile-nav"
          className="absolute inset-x-0 top-16 border-b border-ink/8 bg-ivory/95 p-3 shadow-lift backdrop-blur-md"
        >
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-evergreen-50 hover:text-evergreen-800"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={cta.href}
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl bg-evergreen-800 px-3 py-3 text-center text-sm font-semibold text-ivory transition-colors hover:bg-evergreen-700"
          >
            {cta.label}
          </Link>
        </nav>
      )}
    </div>
  );
}
