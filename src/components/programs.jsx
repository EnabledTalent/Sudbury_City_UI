import { useNavigate } from "react-router-dom";

const programs = [
  {
    title: "Digital Skills Bootcamp",
    college: "Cambrian College",
    duration: "12 weeks",
  },
  {
    title: "Data Analytics Certificate",
    college: "Laurentian University",
    duration: "8 weeks",
  },
  {
    title: "Web Development Fundamentals",
    college: "Cambrian College",
    duration: "16 weeks",
  },
];

export default function Programs() {
  const navigate = useNavigate();

  return (
    <section id="programs" className="section">
        <div className="section-header">
      <h2 className="section-title">Training & Programs</h2>
      <button className="view-all" onClick={() => navigate("/training")}>
      View all <span>→</span>
      </button>
      </div>
      <div className="program-grid">
        {programs.map((p, i) => (
          <div className="program-card" key={i} onClick={() => navigate("/training")} style={{ cursor: "pointer" }}>
            <div className="program-icon">💼</div>

            <h3>{p.title}</h3>
            <p className="college">{p.college}</p>

            <div className="duration">
              <span>⏱</span> {p.duration}
            </div>

            <span className="free-pill">FREE</span>

            <button type="button" className="learn-more" onClick={(e) => { e.stopPropagation(); navigate("/training"); }}>
              Learn more
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
