const programs = [
  {
    title: "Digital Skills Bootcamp",
    college: "Cambrian College",
    duration: "12 weeks",
  },
  {
    title: "Digital Skills Bootcamp",
    college: "Cambrian College",
    duration: "12 weeks",
  },
  {
    title: "Digital Skills Bootcamp",
    college: "Cambrian College",
    duration: "12 weeks",
  },
];

export default function Programs() {
  return (
    <section id="programs" className="section">
      <h2 className="section-title">Training & Programs</h2>

      <div className="program-grid">
        {programs.map((p, i) => (
          <div className="program-card" key={i}>
            <div className="program-icon">💼</div>

            <h3>{p.title}</h3>
            <p className="college">{p.college}</p>

            <div className="duration">
              <span>⏱</span> {p.duration}
            </div>

            <span className="free-pill">FREE</span>

            <a href="#" className="learn-more">
              Learn more
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
