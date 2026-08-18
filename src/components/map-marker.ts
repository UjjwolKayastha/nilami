/**
 * The Nilami mark as a map pin, so markers read as our logo instead of a
 * generic dot. Plain HTML strings — Leaflet's `divIcon` takes markup, not JSX.
 */

const EVERGREEN = "#0e3b2e";
const BRASS = "#c2a24b";

/** Teardrop outline: head centred at (16, 16.5) with r=14.5, tip at (16, 43.5). */
const PIN_BODY =
  "M16 43.5C16 43.5 30.5 27.5 30.5 16.5 30.5 8.5 24 2 16 2S1.5 8.5 1.5 16.5c0 11 14.5 27 14.5 27Z";

/** The gavel-strike from <Logo>, scaled and centred inside the pin head. */
const GAVEL = `
  <g stroke="${BRASS}" stroke-width="1.7" stroke-linecap="round" fill="none"
     transform="translate(7.6 8.4) scale(1.2)">
    <path d="M2 12h6"/><path d="M5 12V7.5"/>
    <path d="M2.5 2.5l4 4"/><path d="M4.5 1.5l4 4"/>
    <path d="M1.5 4.5l4 4"/><path d="M8 6l4.5 4.5"/>
  </g>`;

/** Aspect of the teardrop, used to derive a height from any pin width. */
export const PIN_RATIO = 44 / 32;

export function pinSize(width: number): { width: number; height: number } {
  return { width, height: Math.round(width * PIN_RATIO) };
}

/**
 * A logo pin. The coordinate sits at the tip, so anchor it at
 * `[width / 2, height]`.
 */
export function logoPin(width = 40): string {
  const { width: w, height: h } = pinSize(width);
  return `
    <svg width="${w}" height="${h}" viewBox="0 0 32 44" fill="none"
         xmlns="http://www.w3.org/2000/svg"
         style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))">
      <path d="${PIN_BODY}" fill="${EVERGREEN}" stroke="${BRASS}" stroke-width="2"/>
      ${GAVEL}
    </svg>`;
}

/**
 * A logo pin carrying a property count in a brass bubble. The bubble overflows
 * the pin's box on purpose — `divIcon` does not clip, and letting it spill
 * keeps the pin itself anchored to its true coordinate.
 */
export function logoPinWithCount(width: number, count: number): string {
  const { height: h } = pinSize(width);
  const bubble = Math.max(15, Math.round(width * 0.5));
  return `
    <div style="position:relative;width:${width}px;height:${h}px">
      ${logoPin(width)}
      <div style="
        position:absolute;top:-2px;right:${-Math.round(bubble * 0.3)}px;
        min-width:${bubble}px;height:${bubble}px;padding:0 4px;
        display:grid;place-items:center;box-sizing:border-box;
        border-radius:9999px;border:1.5px solid ${EVERGREEN};
        background:${BRASS};color:${EVERGREEN};
        font:600 ${bubble > 20 ? 11 : 10}px/1 ui-sans-serif,system-ui,sans-serif;
        box-shadow:0 1px 3px rgba(0,0,0,.4);
      ">${count}</div>
    </div>`;
}
