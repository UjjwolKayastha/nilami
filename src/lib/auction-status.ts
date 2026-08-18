import type { Auction, AuctionStatus } from "@/lib/types";

/**
 * The status a bidder should see.
 *
 * `auctions.status` is set by staff and nothing flips it on its own, so a row
 * can still read "open" long after its submission deadline. Showing that badge
 * next to an expired countdown invites bids nobody can place — treat a passed
 * deadline as closed everywhere the public site reads a status.
 */
export function displayStatus(
  auction: Pick<Auction, "status" | "submission_deadline">,
  now: number = Date.now()
): AuctionStatus {
  if (auction.status !== "open") return auction.status;
  return new Date(auction.submission_deadline).getTime() <= now
    ? "closed"
    : "open";
}
