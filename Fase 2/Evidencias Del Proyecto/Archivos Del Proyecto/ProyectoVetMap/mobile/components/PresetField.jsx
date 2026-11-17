import { useEffect, useMemo, useState } from "react";

import Input from "./_PresetInputCompat";
import SelectField from "./SelectField";

const CUSTOM_VALUE = "__vetmap_custom__";

export default function PresetField({
  label,
  options = [],
  value = "",
  onChange,
  placeholder = "Escribe una opción",
  customLabel = "Otro / escribir",
  multiline = false,
}) {
  const normalized = useMemo(() => {
    const result = [];
    const seen = new Set();

    for (const raw of options || []) {
      const text = String(raw ?? "").trim();

      if (!text) continue;

      const key = text.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        result.push(text);
      }
    }

    return result;
  }, [options]);

  const isKnown = normalized.some(
    (item) =>
      String(item).toLowerCase() ===
      String(value || "").trim().toLowerCase()
  );

  const [custom, setCustom] = useState(
    Boolean(value) && !isKnown
  );

  useEffect(() => {
    if (!value) {
      setCustom(false);
      return;
    }

    setCustom(!isKnown);
  }, [value, isKnown]);

  function choose(next) {
    if (next === CUSTOM_VALUE) {
      setCustom(true);

      if (isKnown) {
        onChange("");
      }

      return;
    }

    setCustom(false);
    onChange(next);
  }

  const choices = [
    ...normalized.map((item) => ({
      value: item,
      label: item,
    })),
    {
      value: CUSTOM_VALUE,
      label: customLabel,
    },
  ];

  return (
    <>
      <SelectField
        label={label}
        options={choices}
        value={custom ? CUSTOM_VALUE : value}
        onChange={choose}
        placeholder={`Selecciona ${String(label || "una opción").toLowerCase()}`}
      />

      {custom || normalized.length === 0 ? (
        <Input
          label={`${label} personalizado`}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          multiline={multiline}
        />
      ) : null}
    </>
  );
}
