import { useId, useMemo } from "react";
import "./YearPicker.css";

export default function YearPicker({
  value = "",
  onChange,
  id,
  name = "year",
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  placeholder = "Select year",
  required = false,
  disabled = false,
  className = "",
  ariaLabel = "Select year",
  ariaLabelledBy,
  ariaDescribedBy,
  invalid = false,
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;

  const years = useMemo(() => {
    let start = Number(maxYear);
    let end = Number(minYear);

    if (!Number.isFinite(start)) start = new Date().getFullYear();
    if (!Number.isFinite(end)) end = 1900;
    if (start < end) [start, end] = [end, start];

    const options = [];
    for (let year = start; year >= end; year -= 1) {
      options.push(String(year));
    }
    return options;
  }, [minYear, maxYear]);

  const normalizedValue = value == null ? "" : String(value);
  const rootClass = `year-picker ${className}`.trim();

  return (
    <div className={rootClass}>
      <select
        id={fieldId}
        className="year-picker__select"
        name={name}
        value={normalizedValue}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid ? "true" : undefined}
      >
        <option value="">{placeholder}</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <span className="year-picker__chevron" aria-hidden="true">
        v
      </span>
    </div>
  );
}
