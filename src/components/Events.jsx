const events = [
  "Summer Music Festival",
  "Community Art Workshop",
  "Community Art Workshop",
];

export default function Events() {
  return (
    <section id="events" className="section">
        <div className="section-header">

      <h2>
        Happening in <span className="highlight">Sudbury</span>
      </h2>
 <button className="view-all">
      View all <span>→</span>
    </button>
  </div>
      <div className="grid">
        {events.map((e, i) => (
          <div className="event-card" key={i}>
            <div className="event-img"></div>
            <h3>{e}</h3>
            <p>
              Write an amazing description in this dedicated card section.
              Each word counts.
            </p>
            <button className="primary">View Details</button>
          </div>
        ))}
      </div>
    </section>
  );
}
