"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

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

function badge(count: number): { html: string; size: number } {
  const size = Math.min(52, 30 + Math.round(Math.log2(count + 1) * 8));
  const html = `
    <div style="
      width:${size}px;height:${size}px;
      display:grid;place-items:center;
      border-radius:9999px;
      background:#c8a049;color:#0b2e22;
      font:600 ${size > 40 ? 15 : 13}px/1 ui-sans-serif,system-ui,sans-serif;
      box-shadow:0 0 0 4px rgba(200,160,73,.28),0 2px 8px rgba(0,0,0,.35);
    ">${count}</div>`;
  return { html, size };
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
        const { html, size } = badge(p.count);
        L.marker([p.lat, p.lng], {
          icon: L.divIcon({
            html,
            className: "",
            // The badge must carry a real size, or the marker has no hit area
            // and sits off-centre from its coordinate.
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2],
          }),
          title: `${p.district} — ${p.label}`,
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
