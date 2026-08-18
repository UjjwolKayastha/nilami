import Image from "next/image";
import Link from "next/link";
import { orgName, type Dict, type Lang } from "@/lib/i18n/dictionaries";
import type { Organization } from "@/lib/types";

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-zऀ-ॿ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-evergreen-800 font-display text-base font-semibold text-ivory">
      {initials || "•"}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="9.25" fill="currentColor" />
      <path d="m8.5 12.4 2.3 2.3 4.7-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M6.5 4h3l1.5 3.8-2 1.4a11.4 11.4 0 0 0 5.3 5.3l1.4-2L19.5 14v3a1.9 1.9 0 0 1-2.1 1.9A15.6 15.6 0 0 1 4.6 6.1 1.9 1.9 0 0 1 6.5 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4 7 8 5.5L20 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M14 4.75h5.25V10M19 5l-7.5 7.5M18 13.5v4.75a1.75 1.75 0 0 1-1.75 1.75H5.75A1.75 1.75 0 0 1 4 18.25V7.75A1.75 1.75 0 0 1 5.75 6h4.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Who is selling this lot, sitting directly under the listing title where the
 * institution's name used to be a bare pill. Deliberately in the page flow and
 * not the sticky sidebar: that column already overflows the viewport, so
 * anything placed at its foot cannot be scrolled to.
 */
export function InstitutionCard({
  org,
  lang,
  t,
  enquirySubject,
}: {
  org: Organization;
  lang: Lang;
  t: Dict;
  enquirySubject: string;
}) {
  const c = t.institution;
  const name = orgName(org, lang);
  const address = lang === "ne" && org.address_np ? org.address_np : org.address;
  const mailto = org.contact_email
    ? `mailto:${org.contact_email}?subject=${encodeURIComponent(enquirySubject)}`
    : null;

  const linkCls =
    "inline-flex items-center gap-1.5 text-ink transition-colors hover:text-evergreen-800";

  return (
    <section className="rounded-2xl border border-ink/8 bg-white p-4 shadow-card">
      <div className="flex items-start gap-4">
        {org.logo_url ? (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-ink/8 bg-white">
            <Image src={org.logo_url} alt={name} fill sizes="48px" className="object-contain p-1" />
          </div>
        ) : (
          <Monogram name={name} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-display text-base font-semibold leading-snug text-evergreen-900">
              {name}
            </h2>
            {org.approved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-evergreen-700">
                <CheckIcon />
                {c.verified}
              </span>
            )}
          </div>

          <p className="mt-0.5 text-sm text-ink-soft">
            <span className="font-medium text-ink">{c.headOffice}</span>
            {address && ` · ${address}`}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {org.contact_phone && (
              <a href={`tel:${org.contact_phone.replace(/\s+/g, "")}`} className={linkCls}>
                <PhoneIcon />
                {org.contact_phone}
              </a>
            )}
            {mailto && (
              <a href={mailto} className={`${linkCls} break-all`}>
                <MailIcon />
                {org.contact_email}
              </a>
            )}
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkCls} font-medium text-evergreen-800`}
              >
                <ExternalIcon />
                {c.visitBank}
              </a>
            )}
            <Link
              href={`/auctions?org=${encodeURIComponent(org.slug)}`}
              className="inline-flex items-center gap-1 font-medium text-evergreen-800 hover:underline"
            >
              {c.allFromBank}
              <span aria-hidden>›</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
