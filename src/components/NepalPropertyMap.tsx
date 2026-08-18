"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { logoPin, logoPinWithCount, pinSize } from "./map-marker";

export type DistrictPoint = {
  district: string;
  count: number;
  lat: number;
  lng: number;
  /** Rendered server-side — functions cannot cross the server/client boundary. */
  label: string;
};

/** Nepal's rough bounding box, used when no district has properties yet. */
const NEPAL_BOUNDS: [[number, number], [number, number]] = [
  [26.3, 80.0],
  [30.5, 88.3],
];

/**
 * A logo pin whose size grows with how many properties the district holds.
 *
 * Kept deliberately small: this map is a ~500px hero panel showing the whole
 * country, and the Kathmandu valley districts sit close enough together that
 * larger pins merge into one blob. A district holding a single property gets no
 * counter — a lone pin already says "one", and stamping "1" on almost every
 * marker was noise rather than information.
 */
function badge(count: number): { html: string; width: number; height: number } {
  const { width, height } = pinSize(
    Math.min(36, 22 + Math.round(Math.log2(count + 1) * 5))
  );
  const html = count > 1 ? logoPinWithCount(width, count) : logoPin(width);
  return { html, width, height };
}

export function NepalPropertyMap({
  points,
  emptyLabel,
  viewLabel,
}: {
  points: DistrictPoint[];
  emptyLabel: string;
  viewLabel: string;
}) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!holder.current) return;
    let cancelled = false;
    let map: import("leaflet").Map | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !holder.current) return;

      map = L.map(holder.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      for (const p of points) {
        const { html, width, height } = badge(p.count);
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            html,
            className: "",
            // The pin must carry a real size, or the marker has no hit area
            // and sits off-centre from its coordinate. Its tip is the anchor.
            iconSize: [width, height],
            iconAnchor: [width / 2, height],
            popupAnchor: [0, -height],
          }),
          title: `${p.district} — ${p.label}`,
          // The valley districts sit close enough to overlap at this zoom;
          // Leaflet stacks markers by latitude, so hovering is the only way to
          // pull one of them forward.
          riseOnHover: true,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${p.district}</strong><br>${p.label}<br>` +
              `<a href="/auctions?district=${encodeURIComponent(p.district)}">${viewLabel}</a>`
          );
      }

      if (points.length) {
        map.fitBounds(
          L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
          { padding: [48, 48], maxZoom: 9 }
        );
      } else {
        map.fitBounds(NEPAL_BOUNDS);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points, viewLabel]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ivory/10 bg-ivory/5 shadow-lift">
      <div ref={holder} className="aspect-[4/3] w-full [&_.leaflet-container]:bg-evergreen-900" />
      {points.length === 0 && (
        <p className="absolute inset-x-0 bottom-4 text-center text-xs text-ivory/60">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}
