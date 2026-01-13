const events = [
  {
    title: "Summer Music Festival",
    image: "/images/events1.png",
  },
  {
    title: "Community Art Workshop",
    image: "/images/event2.png",
  },
  {
    title: "Local Food Fair",
    image: "/images/event3.png",
  },
  
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
            <div className="event-img">
              <img src={e.image} alt={e.title} />
            </div>
            <h3>{e.title}</h3>
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
