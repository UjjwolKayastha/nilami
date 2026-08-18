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
    <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-evergreen-800 font-display text-lg font-semibold text-ivory">
      {initials || "•"}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9.25" fill="currentColor" />
      <path
        d="m8.5 12.4 2.3 2.3 4.7-5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="m4 7 8 5.5L20 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 11v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="7.75" r="1.05" fill="currentColor" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
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

/** Who is selling, how to reach them, and where to see the rest of their lots. */
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

  return (
    <section className="rounded-3xl border border-ink/8 bg-white p-6 shadow-card">
      <div className="flex items-center gap-4">
        {org.logo_url ? (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-ink/8 bg-white">
            <Image src={org.logo_url} alt={name} fill sizes="56px" className="object-contain p-1" />
          </div>
        ) : (
          <Monogram name={name} />
        )}
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold leading-snug text-evergreen-900">
            {name}
          </h2>
          {org.approved && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-evergreen-700">
              <CheckIcon />
              {c.verified}
            </p>
          )}
        </div>
      </div>

      <hr className="my-5 border-ink/8" />

      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
        {c.contactToBid}
        <span title={c.contactHint} className="text-ink-soft/70">
          <InfoIcon />
        </span>
      </p>

      <p className="mt-3 font-semibold text-ink">{c.headOffice}</p>
      {address && <p className="mt-0.5 text-sm text-ink-soft">{address}</p>}

      <div className="mt-3 space-y-2 text-sm">
        {org.contact_phone && (
          <a
            href={`tel:${org.contact_phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-2.5 text-ink transition-colors hover:text-evergreen-800"
          >
            <PhoneIcon />
            {org.contact_phone}
          </a>
        )}
        {org.contact_email && mailto && (
          <a
            href={mailto}
            className="flex items-center gap-2.5 break-all text-ink transition-colors hover:text-evergreen-800"
          >
            <MailIcon />
            {org.contact_email}
          </a>
        )}
      </div>

      {org.website ? (
        <a
          href={org.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-evergreen-800 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-evergreen-700"
        >
          <ExternalIcon />
          {c.visitBank}
        </a>
      ) : (
        mailto && (
          <a
            href={mailto}
            className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-evergreen-800 py-3.5 text-sm font-semibold text-ivory transition-colors hover:bg-evergreen-700"
          >
            <MailIcon />
            {c.enquire}
          </a>
        )
      )}

      <Link
        href={`/auctions?org=${encodeURIComponent(org.slug)}`}
        className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-evergreen-800 hover:underline"
      >
        {c.allFromBank}
        <span aria-hidden>›</span>
      </Link>
    </section>
  );
}
