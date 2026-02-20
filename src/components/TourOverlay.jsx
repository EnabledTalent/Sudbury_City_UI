import { useEffect, useMemo, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function TourOverlay({
  open,
  steps,
  storageKey,
  onClose,
  onComplete,
}) {
  const [idx, setIdx] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const step = useMemo(() => steps?.[idx], [steps, idx]);
  const total = steps?.length || 0;

  useEffect(() => {
    if (!open) return;
    setIdx(0);
  }, [open]);

  useEffect(() => {
    if (!open || !step) return;

    const getRect = () => {
      if (!step.target) {
        setTargetRect(null);
        return;
      }
      const el = document.querySelector(step.target);
      if (!el) {
        setTargetRect(null);
        return;
      }
      el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    const timer = setTimeout(getRect, 50);
    window.addEventListener("resize", getRect);
    window.addEventListener("scroll", getRect, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", getRect);
      window.removeEventListener("scroll", getRect);
    };
  }, [open, step]);

  if (!open || !step || total === 0) return null;

  const markDone = (status) => {
    if (storageKey) {
      localStorage.setItem(storageKey, status);
    }
  };

  const handleSkip = () => {
    markDone("skipped");
    onClose?.();
  };

  const handleNext = () => {
    if (idx >= total - 1) {
      markDone("done");
      onComplete?.();
      onClose?.();
      return;
    }
    setIdx((v) => v + 1);
  };

  const margin = 16;
  const modalWidth = 360;
  const modalHeightEstimate = 170;

  let modalTop = Math.max(margin, (window.innerHeight - modalHeightEstimate) / 2);
  let modalLeft = Math.max(margin, (window.innerWidth - modalWidth) / 2);

  if (targetRect) {
    const preferredTop = targetRect.top + targetRect.height + 12;
    const preferredBottom = preferredTop + modalHeightEstimate;
    const placeAbove = preferredBottom > window.innerHeight - margin;
    modalTop = placeAbove
      ? targetRect.top - modalHeightEstimate - 12
      : preferredTop;
    modalTop = clamp(modalTop, margin, window.innerHeight - margin - modalHeightEstimate);
    modalLeft = clamp(
      targetRect.left,
      margin,
      window.innerWidth - margin - modalWidth
    );
  }

  const styles = {
    backdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(17, 24, 39, 0.55)",
      zIndex: 20000,
    },
    highlight: {
      position: "fixed",
      top: targetRect?.top ?? 0,
      left: targetRect?.left ?? 0,
      width: targetRect?.width ?? 0,
      height: targetRect?.height ?? 0,
      borderRadius: 10,
      boxShadow: "0 0 0 4px rgba(34, 197, 94, 0.9), 0 12px 30px rgba(0,0,0,0.35)",
      pointerEvents: "none",
      zIndex: 20001,
      opacity: targetRect ? 1 : 0,
      transition: "opacity 0.2s ease",
    },
    modal: {
      position: "fixed",
      top: modalTop,
      left: modalLeft,
      width: modalWidth,
      background: "#ffffff",
      borderRadius: 14,
      padding: 16,
      boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
      zIndex: 20002,
      border: "1px solid rgba(0,0,0,0.08)",
    },
    stepCount: {
      fontSize: 12,
      color: "#6b7280",
      marginBottom: 6,
      fontWeight: 600,
    },
    title: {
      margin: 0,
      fontSize: 16,
      fontWeight: 800,
      color: "#111827",
      marginBottom: 6,
    },
    body: {
      margin: 0,
      fontSize: 13,
      lineHeight: 1.5,
      color: "#374151",
    },
    actions: {
      display: "flex",
      gap: 10,
      justifyContent: "space-between",
      marginTop: 14,
      alignItems: "center",
    },
    btnLink: {
      background: "transparent",
      border: "none",
      color: "#6b7280",
      cursor: "pointer",
      padding: 0,
      fontSize: 13,
      fontWeight: 600,
    },
    btnPrimary: {
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      borderRadius: 10,
      padding: "10px 14px",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      minWidth: 86,
    },
  };

  return (
    <>
      <div style={styles.backdrop} onClick={handleSkip} />
      <div style={styles.highlight} />
      <div style={styles.modal} role="dialog" aria-modal="true">
        <div style={styles.stepCount}>
          {idx + 1} / {total}
        </div>
        <h4 style={styles.title}>{step.title}</h4>
        <p style={styles.body}>{step.body}</p>
        <div style={styles.actions}>
          <button type="button" style={styles.btnLink} onClick={handleSkip}>
            Skip
          </button>
          <button type="button" style={styles.btnPrimary} onClick={handleNext}>
            {idx >= total - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}

