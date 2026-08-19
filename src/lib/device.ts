import { headers } from "next/headers";

/**
 * Whether the request looks like it came from a phone.
 *
 * Server components have no viewport, so a responsive default — such as how
 * many listings fill a page — has to be decided from the request itself.
 * `Sec-CH-UA-Mobile` is the accurate signal and Chromium sends it unasked;
 * Safari and Firefox do not, so those fall back to the user-agent string.
 *
 * Tablets read as desktop, which suits a grid that is two or three columns
 * wide at that size. This only chooses a default: an explicit ?size= always
 * wins, so a reader is never stuck with the guess.
 */
export async function isMobileRequest(): Promise<boolean> {
  const h = await headers();

  const hint = h.get("sec-ch-ua-mobile");
  if (hint === "?1") return true;
  if (hint === "?0") return false;

  const ua = h.get("user-agent") ?? "";
  return /Android|iPhone|iPod|IEMobile|BlackBerry|Opera Mini|Mobile Safari/i.test(ua);
}
