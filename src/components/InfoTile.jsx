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

      <div className="info-tile-content" style={{ marginTop: 20 }}>
        {items?.length ? (
          <ul className="info-tile-list">
            {items.slice(0, 3).map((x) => (
              <li key={x.id} className="info-tile-item">
                <a 
                  href={x.url} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="info-tile-link"
                >
                  <span className="info-tile-bullet">•</span>
                  {x.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="info-tile-loading">Loading latest updates…</p>
        )}

        {updatedAt && (
          <div className="info-tile-updated">
            Updated: {new Date(updatedAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

