"use client";

import { useState } from "react";
import {
  districtsOf,
  municipalitiesOf,
  PROVINCES,
} from "@/lib/nepal/administrative-divisions";

type Option = { value: string; label: string };

function Select({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  inputCls,
  labelCls,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder: string;
  inputCls: string;
  labelCls: string;
}) {
  // A value saved before these fields became dropdowns — or one the dataset
  // spells differently — must stay selectable, or editing an existing property
  // would silently blank it.
  const unlisted = value !== "" && !options.some((o) => o.value === value);

  return (
    <label className="block space-y-1.5">
      <span className={labelCls}>{label}</span>
      <select
        name={name}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {unlisted && <option value={value}>{value} — not in list</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Province → district → municipality, each narrowing the next. Renders three
 * bare <label> blocks so the parent form's grid keeps laying them out.
 */
export function LocationSelects({
  province: initialProvince = "",
  district: initialDistrict = "",
  municipality: initialMunicipality = "",
  inputCls,
  labelCls,
}: {
  province?: string;
  district?: string;
  municipality?: string;
  inputCls: string;
  labelCls: string;
}) {
  const [province, setProvince] = useState(initialProvince);
  const [district, setDistrict] = useState(initialDistrict);
  const [municipality, setMunicipality] = useState(initialMunicipality);

  const opts = (names: string[]) => names.map((n) => ({ value: n, label: n }));
  const shared = { inputCls, labelCls };

  return (
    <>
      <Select
        {...shared}
        name="province"
        label="Province"
        value={province}
        onChange={(v) => {
          setProvince(v);
          setDistrict("");
          setMunicipality("");
        }}
        options={opts(PROVINCES.map((p) => p.name))}
        placeholder="Select province…"
      />
      <Select
        {...shared}
        name="district"
        label="District"
        value={district}
        onChange={(v) => {
          setDistrict(v);
          setMunicipality("");
        }}
        options={opts(districtsOf(province).map((d) => d.name))}
        placeholder={province ? "Select district…" : "Select a province first"}
      />
      <Select
        {...shared}
        name="municipality"
        label="Municipality / rural municipality"
        value={municipality}
        onChange={setMunicipality}
        options={opts(municipalitiesOf(province, district).map((m) => m.name))}
        placeholder={district ? "Select local level…" : "Select a district first"}
      />
    </>
  );
}
