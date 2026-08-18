"use client";

import { useState } from "react";
import { formatRopaniAana, parseLandArea } from "@/lib/nepal/land-area";

/**
 * Accepts either a plain aana figure or ropani-aana-paisa-daam ("1-0-0-0"),
 * and shows what the entry resolves to as it is typed.
 */
export function LandAreaField({
  value,
  inputCls,
  labelCls,
}: {
  value: number | null | undefined;
  inputCls: string;
  labelCls: string;
}) {
  const [text, setText] = useState(value == null ? "" : String(value));
  const aana = parseLandArea(text);
  const invalid = text.trim() !== "" && aana === null;

  return (
    <label className="block space-y-1.5">
      <span className={labelCls}>Land area</span>
      <input
        name="land_area_aana"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="8.5 aana or 1-0-0-0"
        aria-invalid={invalid}
        className={inputCls}
      />
      <span className="block text-[11px] text-ink-soft">
        {invalid ? (
          <span className="text-danger">
            Enter aana (8.5) or ropani-aana-paisa-daam (1-0-0-0).
          </span>
        ) : aana === null ? (
          "Aana, or ropani-aana-paisa-daam."
        ) : (
          `${aana} aana · ${formatRopaniAana(aana)} (ropani-aana-paisa-daam)`
        )}
      </span>
    </label>
  );
}
