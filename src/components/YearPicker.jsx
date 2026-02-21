import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";

export default function YearPicker({
  value,
  onChange,
  placeholder = "Select year",
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  const years = useMemo(() => {
    const start = Number.isFinite(minYear) ? minYear : 1900;
    const end = Number.isFinite(maxYear) ? maxYear : new Date().getFullYear();
    const out = [];
    for (let y = end; y >= start; y -= 1) out.push(String(y));
    return out;
  }, [minYear, maxYear]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMouseDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  const styles = {
    wrapper: {
      position: "relative",
      width: "100%",
    },
    field: {
      width: "100%",
      padding: "12px 44px 12px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      background: disabled ? "#f9fafb" : "#ffffff",
      color: value ? "#111827" : "#6b7280",
      boxSizing: "border-box",
      cursor: disabled ? "not-allowed" : "default",
      userSelect: "none",
    },
    iconBtn: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      color: "#374151",
    },
    popover: {
      position: "absolute",
      top: "calc(100% + 8px)",
      left: 0,
      width: "100%",
      maxHeight: "240px",
      overflowY: "auto",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
      zIndex: 1000,
      padding: "6px",
    },
    yearRow: (active) => ({
      padding: "10px 10px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: active ? 700 : 500,
      color: active ? "#111827" : "#374151",
      background: active ? "#ecfdf5" : "transparent",
    }),
    hint: {
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "6px",
    },
  };

  return (
    <div style={styles.wrapper} ref={rootRef}>
      <button
        type="button"
        style={styles.field}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
      >
        {value || placeholder}
      </button>
      <button
        type="button"
        aria-label="Select year"
        style={styles.iconBtn}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) setOpen((v) => !v);
        }}
      >
        <CalendarDays size={16} strokeWidth={2.5} />
      </button>

      {open && (
        <div
          id={listId}
          style={styles.popover}
          role="listbox"
          aria-label="Year options"
        >
          {years.map((y) => (
            <div
              key={y}
              role="option"
              aria-selected={y === value}
              style={styles.yearRow(y === value)}
              onClick={() => {
                onChange?.(y);
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                if (y !== value) e.currentTarget.style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                if (y !== value) e.currentTarget.style.background = "transparent";
              }}
            >
              {y}
            </div>
          ))}
          <div style={styles.hint}>Tip: press Esc to close.</div>
        </div>
      )}
    </div>
  );
}

