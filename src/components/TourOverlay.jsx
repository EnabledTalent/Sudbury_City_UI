import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import "./TourOverlay.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getFocusableElements = (container) => {
  if (!container) return [];

  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return [...container.querySelectorAll(selector)].filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
};

export default function TourOverlay({
  open,
  steps,
  storageKey,
  onClose,
  onComplete,
}) {
  const [idx, setIdx] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const dialogRef = useRef(null);
  const primaryButtonRef = useRef(null);
  const previousFocusedRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  const step = useMemo(() => steps?.[idx], [steps, idx]);
  const total = steps?.length || 0;

  const markDone = useCallback(
    (status) => {
      if (storageKey) {
        localStorage.setItem(storageKey, status);
      }
    },
    [storageKey]
  );

  const handleSkip = useCallback(() => {
    markDone("skipped");
    onClose?.();
  }, [markDone, onClose]);

  const handleNext = useCallback(() => {
    if (idx >= total - 1) {
      markDone("done");
      onComplete?.();
      onClose?.();
      return;
    }
    setIdx((v) => v + 1);
  }, [idx, total, markDone, onComplete, onClose]);

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

  useEffect(() => {
    if (!open) return undefined;

    previousFocusedRef.current = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = setTimeout(() => {
      if (primaryButtonRef.current) {
        primaryButtonRef.current.focus();
      } else if (dialogRef.current) {
        dialogRef.current.focus();
      }
    }, 0);

    const onKeyDown = (e) => {
      if (!dialogRef.current) return;

      if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (
        previousFocusedRef.current &&
        typeof previousFocusedRef.current.focus === "function"
      ) {
        previousFocusedRef.current.focus();
      }
    };
  }, [open, handleSkip]);

  if (!open || !step || total === 0) return null;

  const margin = 16;
  const modalWidth = 360;
  const modalHeightEstimate = 170;

  let modalTop = Math.max(margin, (window.innerHeight - modalHeightEstimate) / 2);
  let modalLeft = Math.max(margin, (window.innerWidth - modalWidth) / 2);

  if (targetRect) {
    const preferredTop = targetRect.top + targetRect.height + 12;
    const preferredBottom = preferredTop + modalHeightEstimate;
    const placeAbove = preferredBottom > window.innerHeight - margin;
    modalTop = placeAbove ? targetRect.top - modalHeightEstimate - 12 : preferredTop;
    modalTop = clamp(modalTop, margin, window.innerHeight - margin - modalHeightEstimate);
    modalLeft = clamp(targetRect.left, margin, window.innerWidth - margin - modalWidth);
  }

  return (
    <>
      <div
        className="tour-overlay__backdrop"
        onClick={handleSkip}
        aria-hidden="true"
      />
      <div
        className="tour-overlay__highlight"
        style={{
          top: targetRect?.top ?? 0,
          left: targetRect?.left ?? 0,
          width: targetRect?.width ?? 0,
          height: targetRect?.height ?? 0,
          opacity: targetRect ? 1 : 0,
        }}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="tour-overlay__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        style={{
          top: modalTop,
          left: modalLeft,
        }}
        tabIndex={-1}
      >
        <p className="tour-overlay__step-count" aria-live="polite">
          Step {idx + 1} of {total}
        </p>
        <h2 id={titleId} className="tour-overlay__title">
          {step.title}
        </h2>
        <p id={descriptionId} className="tour-overlay__body">
          {step.body}
        </p>
        <div className="tour-overlay__actions">
          <button type="button" className="tour-overlay__skip" onClick={handleSkip}>
            Skip tour
          </button>
          <button
            ref={primaryButtonRef}
            type="button"
            className="tour-overlay__next"
            onClick={handleNext}
          >
            {idx >= total - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
}
