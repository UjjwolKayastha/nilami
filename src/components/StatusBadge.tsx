import { statusLabel } from "@/lib/format";
import type { Lang } from "@/lib/i18n/dictionaries";
import type { AuctionStatus } from "@/lib/types";

/** On a pale page or panel, where a tinted wash reads clearly. */
const onSurface: Record<AuctionStatus, string> = {
  draft: "bg-ink/8 text-ink-soft",
  upcoming: "bg-brass-100 text-brass-600",
  open: "bg-evergreen-100 text-evergreen-700",
  closed: "bg-ink/8 text-ink-soft",
  sold: "bg-evergreen-800 text-ivory",
  cancelled: "bg-danger-soft text-danger",
};

/**
 * Over a photograph. The pale grounds above vanish against a light image — a
 * near-transparent one like `closed` disappears altogether — so every status
 * takes an opaque ground and light type here.
 */
const onImage: Record<AuctionStatus, string> = {
  draft: "bg-ink/80 text-ivory backdrop-blur-sm",
  upcoming: "bg-brass-500 text-evergreen-950",
  open: "bg-evergreen-700 text-ivory",
  closed: "bg-ink/80 text-ivory backdrop-blur-sm",
  sold: "bg-evergreen-900 text-ivory",
  cancelled: "bg-danger text-ivory",
};

export function StatusBadge({
  status,
  lang = "en",
  variant = "surface",
}: {
  status: AuctionStatus;
  lang?: Lang;
  variant?: "surface" | "image";
}) {
  const onImageVariant = variant === "image";
  const dot = onImageVariant ? "bg-brass-300" : "bg-evergreen-600";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        (onImageVariant ? onImage : onSurface)[status]
      }`}
    >
      {status === "open" && (
        <span className="relative flex size-1.5">
          <span
            className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${dot}`}
          />
          <span className={`relative inline-flex size-1.5 rounded-full ${dot}`} />
        </span>
      )}
      {statusLabel(status, lang)}
    </span>
  );
}
