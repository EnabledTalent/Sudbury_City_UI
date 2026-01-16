import "../App.css";

export default function InfoTile({ icon, title, subtitle, items, updatedAt, onClick }) {
  return (
    <div 
      className="hub-card" 
      role="button" 
      tabIndex={0} 
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="hub-card-icon">{icon}</div>
      <h3 className="hub-card-title">{title}</h3>
      <p className="hub-card-description">{subtitle}</p>

      <div style={{ marginTop: 12 }}>
        {items?.length ? (
          <ul style={{ paddingLeft: 16, margin: 0, listStyle: "none" }}>
            {items.slice(0, 3).map((x) => (
              <li key={x.id} style={{ marginBottom: 6 }}>
                <a 
                  href={x.url} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    fontSize: "14px",
                    display: "block",
                    padding: "4px 0",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#2563eb"}
                  onMouseLeave={(e) => e.target.style.color = "var(--text-primary)"}
                >
                  {x.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ margin: 0, opacity: 0.7, fontSize: "14px", color: "var(--text-secondary)" }}>Loading…</p>
        )}

        {updatedAt ? (
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6, color: "var(--text-secondary)" }}>
            Updated: {new Date(updatedAt).toLocaleString()}
          </div>
        ) : null}
      </div>
    </div>
  );
}

