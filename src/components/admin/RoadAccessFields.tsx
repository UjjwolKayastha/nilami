"use client";

import { useState } from "react";
import { splitRoadAccess } from "@/lib/nepal/road-access";

/**
 * Width in feet and a surface description, submitted as two fields and
 * recombined server-side into the single road_access column.
 */
export function RoadAccessFields({
  value,
  inputCls,
  labelCls,
}: {
  value: string | null | undefined;
  inputCls: string;
  labelCls: string;
}) {
  const initial = splitRoadAccess(value);
  const [feet, setFeet] = useState(initial.feet);
  const [description, setDescription] = useState(initial.description);

  return (
    <>
      <label className="block space-y-1.5">
        <span className={labelCls}>Road access (feet)</span>
        <input
          name="road_access_ft"
          type="number"
          min={0}
          step="0.5"
          value={feet}
          onChange={(e) => setFeet(e.target.value)}
          placeholder="20"
          className={inputCls}
        />
      </label>
      <label className="block space-y-1.5">
        <span className={labelCls}>Road surface / note</span>
        <input
          name="road_access_note"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="blacktopped"
          className={inputCls}
        />
      </label>
    </>
  );
}
