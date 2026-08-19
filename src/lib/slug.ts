/**
 * Slugs, and the one thing that is easy to get wrong about them here.
 *
 * Next does not percent-decode a dynamic route segment: `params.slug` for
 * /auctions/Banepa%20ma arrives as the literal "Banepa%20ma". Comparing that
 * against the stored slug silently misses, so every listing whose slug needs
 * encoding 404s. Anything that reads a slug from the URL must decode it first.
 */

/** The slug as it is stored, from a route segment as it arrives. */
export function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    // A malformed escape would throw; fall back to the raw value so the
    // caller still gets a clean miss rather than a 500.
    return raw;
  }
}

/**
 * Normalise text into a slug.
 *
 * Letters, numbers and combining marks survive; everything else becomes a
 * separator. Marks matter: Devanagari vowel signs are marks, and dropping them
 * turns "जग्गामा" into "जग-ग-म". A Nepali title therefore slugifies to Nepali
 * rather than to an empty string, which is what an ASCII-only rule produced.
 */
export function slugify(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/(^-+|-+$)/g, "");
}
