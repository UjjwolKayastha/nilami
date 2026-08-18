"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { logoPin, pinSize } from "../map-marker";

const PIN = pinSize(30);

/**
 * Click (or drag the pin) to set a property's coordinates. Recentres when the
 * chosen district changes, so the map starts somewhere useful instead of
 * mid-ocean.
 */
export function MapPicker({
  lat,
  lng,
  centre,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  centre: [number, number];
  onPick: (lat: number, lng: number) => void;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  // Kept in a ref so re-renders never re-run the setup effect. Assigned in an
  // effect rather than during render, which concurrent rendering disallows.
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!holder.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !holder.current || mapRef.current) return;
      LRef.current = L;

      const map = L.map(holder.current, { scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        html: logoPin(PIN.width),
        className: "",
        iconSize: [PIN.width, PIN.height],
        // The coordinate sits at the pin's tip, not its centre.
        iconAnchor: [PIN.width / 2, PIN.height],
      });

      const place = (la: number, ln: number) => {
        if (markerRef.current) markerRef.current.setLatLng([la, ln]);
        else {
          markerRef.current = L.marker([la, ln], { icon, draggable: true })
            .addTo(map)
            .on("dragend", (e) => {
              const ll = (e.target as import("leaflet").Marker).getLatLng();
              onPickRef.current(
                Number(ll.lat.toFixed(6)),
                Number(ll.lng.toFixed(6))
              );
            });
        }
      };

      map.on("click", (e) => {
        const { lat: la, lng: ln } = e.latlng;
        place(la, ln);
        onPickRef.current(Number(la.toFixed(6)), Number(ln.toFixed(6)));
      });

      if (lat != null && lng != null) {
        place(lat, lng);
        map.setView([lat, lng], 15);
      } else {
        map.setView(centre, 11);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Set up once; later prop changes are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the district selection while no pin has been dropped yet.
  useEffect(() => {
    if (mapRef.current && lat == null && lng == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current.setView(centre, 11);
    }
  }, [centre, lat, lng]);

  return (
    <div
      ref={holder}
      className="h-72 w-full overflow-hidden rounded-xl border border-ink/15"
    />
  );
}
