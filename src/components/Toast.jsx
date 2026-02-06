import { useEffect } from "react";

/**
 * Toast notification component
 * Shows error or success messages at the bottom of the screen
 */
export default function Toast({ message, type = "error", onClose, duration = 5000 }) {
  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    toast: {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      background: type === "error" ? "#ef4444" : "#10b981",
      color: "#ffffff",
      padding: "16px 24px",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: "300px",
      maxWidth: "500px",
      animation: "slideUp 0.3s ease-out",
    },
    icon: {
      fontSize: "20px",
      flexShrink: 0,
    },
    message: {
      flex: 1,
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "1.5",
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: "20px",
      padding: "0",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      transition: "background 0.2s",
    },
  };

  return (
    <div style={styles.toast}>
      <span style={styles.icon}>{type === "error" ? "⚠️" : "✓"}</span>
      <span style={styles.message}>{message}</span>
      <button
        style={styles.closeButton}
        onClick={onClose}
        onMouseEnter={(e) => {
          e.target.style.background = "rgba(255, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
        }}
        aria-label="Close"
      >
        ×
      </button>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
