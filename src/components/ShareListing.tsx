"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { dictionaries, type Lang } from "@/lib/i18n/dictionaries";

type IconProps = { className?: string };

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.988H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.04 2c-5.5 0-9.97 4.47-9.97 9.97 0 1.76.46 3.47 1.34 4.98L2 22l5.2-1.36a9.94 9.94 0 0 0 4.84 1.23h.01c5.5 0 9.97-4.47 9.97-9.97 0-2.66-1.04-5.17-2.92-7.05A9.9 9.9 0 0 0 12.04 2Zm0 18.15h-.01a8.27 8.27 0 0 1-4.21-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.24 8.24 0 0 1-1.27-4.41c0-4.57 3.72-8.29 8.29-8.29 2.21 0 4.29.86 5.86 2.43a8.24 8.24 0 0 1 2.43 5.87c0 4.57-3.72 8.27-8.3 8.27Zm4.55-6.2c-.25-.12-1.47-.73-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.64.81-.79.98-.14.16-.29.19-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.57c.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

function ViberIcon({ className }: IconProps) {
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
      <path d="M12 2.8c-4.9 0-8.4 3.2-8.4 7.5 0 2.4 1.1 4.5 3 5.9v3.4a.5.5 0 0 0 .8.4l2.7-1.9c.6.1 1.2.2 1.9.2 4.9 0 8.4-3.2 8.4-7.5S16.9 2.8 12 2.8Z" />
      <path d="M9.6 7.7c.3-.3.7-.3.9.1l.7 1.2c.2.3.1.6-.2.8l-.4.3c-.1.1-.2.3-.1.5.2.5.5 1 .9 1.4.4.4.9.7 1.4.9.2.1.4 0 .5-.1l.3-.4c.2-.3.5-.4.8-.2l1.2.7c.4.2.4.6.1.9-.5.6-1.2.9-1.9.7-1.1-.3-2.2-.9-3.1-1.8-.9-.9-1.5-2-1.8-3.1-.2-.7.1-1.4.7-1.9Z" />
    </svg>
  );
}

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.53 3h3.02l-6.6 7.54L21.7 21h-6.08l-4.76-6.22L5.4 21H2.38l7.06-8.07L2.1 3h6.23l4.3 5.69L17.53 3Zm-1.06 16.2h1.67L7.6 4.72H5.81l10.66 14.48Z" />
    </svg>
  );
}

function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.64 6.86-1.56 7.37c-.12.52-.43.65-.86.4l-2.38-1.75-1.15 1.1c-.13.13-.24.24-.48.24l.17-2.42 4.4-3.98c.19-.17-.04-.27-.3-.1l-5.44 3.43-2.34-.73c-.51-.16-.52-.51.11-.76l9.15-3.53c.42-.15.8.1.68.73Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 2H3.55C2.7 2 2 2.68 2 3.52v16.96C2 21.32 2.7 22 3.55 22h16.9c.85 0 1.55-.68 1.55-1.52V3.52C22 2.68 21.3 2 20.45 2ZM8.12 18.9H5.17V9.42h2.95v9.48ZM6.64 8.12a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42ZM18.9 18.9h-2.94v-4.61c0-1.1-.02-2.52-1.53-2.52-1.54 0-1.78 1.2-1.78 2.44v4.69H9.72V9.42h2.82v1.3h.04c.4-.75 1.35-1.53 2.79-1.53 2.98 0 3.53 1.96 3.53 4.51v5.2Z" />
    </svg>
  );
}

function EmailIcon({ className }: IconProps) {
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
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 7 7.34 5.3a2 2 0 0 0 2.32 0L20.5 7" />
    </svg>
  );
}

function LinkIcon({ className }: IconProps) {
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
      <path d="M10.1 13.9a3.6 3.6 0 0 0 5.4.4l2.7-2.7a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5" />
      <path d="M13.9 10.1a3.6 3.6 0 0 0-5.4-.4l-2.7 2.7a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
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
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

function ShareIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="m8.3 10.8 7.4-4.3M8.3 13.2l7.4 4.3" />
    </svg>
  );
}

const subscribeNever = () => () => {};
const readOrigin = () => window.location.origin;
const readCanShare = () => typeof navigator !== "undefined" && !!navigator.share;

const tileClass =
  "flex flex-col items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white px-1 py-3.5 text-[11px] font-medium text-ink-soft transition-colors hover:border-evergreen-700/40 hover:bg-evergreen-50 hover:text-evergreen-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-evergreen-700";

export function ShareListing({
  path,
  title,
  lang = "en",
}: {
  path: string;
  title: string;
  lang?: Lang;
}) {
  const s = dictionaries[lang].detail.share;
  // Both are read from the browser after hydration, so the server-rendered
  // markup stays identical across deployments and devices.
  const origin = useSyncExternalStore(subscribeNever, readOrigin, () => "");
  const canNativeShare = useSyncExternalStore(
    subscribeNever,
    readCanShare,
    () => false
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  const url = origin ? `${origin}${path}` : path;
  const e = encodeURIComponent;
  const text = s.message(title);

  const links: { key: string; label: string; href: string; icon: typeof XIcon }[] = [
    {
      key: "facebook",
      label: s.facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
      icon: FacebookIcon,
    },
    {
      key: "whatsapp",
      label: s.whatsapp,
      href: `https://api.whatsapp.com/send?text=${e(`${text} ${url}`)}`,
      icon: WhatsAppIcon,
    },
    {
      key: "viber",
      label: s.viber,
      href: `viber://forward?text=${e(`${text} ${url}`)}`,
      icon: ViberIcon,
    },
    {
      key: "x",
      label: s.x,
      href: `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(text)}`,
      icon: XIcon,
    },
    {
      key: "telegram",
      label: s.telegram,
      href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}`,
      icon: TelegramIcon,
    },
    {
      key: "linkedin",
      label: s.linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}`,
      icon: LinkedInIcon,
    },
    {
      key: "email",
      label: s.email,
      href: `mailto:?subject=${e(title)}&body=${e(`${text}\n\n${url}`)}`,
      icon: EmailIcon,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
      setCopied(true);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
    } catch {
      /* dismissed by the user — nothing to do */
    }
  }

  return (
    <section className="rounded-3xl border border-ink/8 bg-white p-7 shadow-card">
      <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-evergreen-900">
        {s.title}
      </h2>
      <div className="mt-5 grid grid-cols-4 gap-2.5 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8">
        {links.map(({ key, label, href, icon: Icon }) => (
          <a
            key={key}
            href={href}
            target={key === "email" || key === "viber" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className={tileClass}
          >
            <Icon className="size-5" />
            <span>{label}</span>
          </a>
        ))}
        <button type="button" onClick={copyLink} className={tileClass}>
          {copied ? (
            <CheckIcon className="size-5 text-evergreen-700" />
          ) : (
            <LinkIcon className="size-5" />
          )}
          <span aria-live="polite">{copied ? s.copied : s.copy}</span>
        </button>
      </div>
      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-evergreen-800 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-evergreen-700"
        >
          <ShareIcon className="size-4" />
          {s.more}
        </button>
      )}
    </section>
  );
}
