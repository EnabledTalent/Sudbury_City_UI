import { useEffect } from "react";
import "./Toast.css";

/**
 * Toast notification component.
 * Announces error/success messages and supports optional auto-dismiss.
 */
export default function Toast({
  message,
  type = "error",
  onClose,
  duration = 5000,
}) {
  const isError = type === "error";

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  useEffect(() => {
    if (!message || duration <= 0 || typeof onClose !== "function") {
      return undefined;
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`toast-notification ${
        isError ? "toast-notification--error" : "toast-notification--success"
      }`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <span className="toast-notification__icon" aria-hidden="true">
        {isError ? "!" : "i"}
      </span>
      <p className="toast-notification__message">{message}</p>
      <button
        type="button"
        className="toast-notification__close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        x
      </button>
    </div>
  );
}
