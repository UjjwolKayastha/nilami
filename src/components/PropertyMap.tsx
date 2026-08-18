"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { logoPin, pinSize } from "./map-marker";

const PIN = pinSize(40);

/** Read-only OpenStreetMap view of a single property's location. */
export function PropertyMap({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!holder.current) return;
    let cancelled = false;
    let map: import("leaflet").Map | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !holder.current) return;

      map = L.map(holder.current, { scrollWheelZoom: false }).setView(
        [lat, lng],
        15
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.marker([lat, lng], {
        icon: L.divIcon({
          html: logoPin(PIN.width),
          className: "",
          iconSize: [PIN.width, PIN.height],
          // The coordinate sits at the pin's tip, not its centre.
          iconAnchor: [PIN.width / 2, PIN.height],
        }),
        title,
      }).addTo(map);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, title]);

  return (
    <div
      ref={holder}
      className="h-80 w-full overflow-hidden rounded-2xl border border-ink/8"
    />
  );
}
