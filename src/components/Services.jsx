const services = [
  {
    title: "Local Transport",
    icon: "🚆",
    desc: "Use local trains for fastest travel. Avoid rush hours (8–11 AM, 6–9 PM).",
  },
  {
    title: "Street Food",
    icon: "🍴",
    desc: "Try vada pav, bhel puri, pav bhaji. Always eat from busy stalls.",
  },
  {
    title: "Healthcare",
    icon: "☂️",
    desc: "Carry umbrella during monsoons. Best time to visit is Oct–Mar.",
  },
];

export default function Services() {
  return (
    <section id="services" className="section gray">
         <div className="section-header">
      <h2>Local Places & Services</h2>
     <button className="view-all">
      View all <span>→</span>
    </button>
    </div>
      <div className="grid">
        {services.map((s, i) => (
          <div className="info-card" key={i}>
            <div className="icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
