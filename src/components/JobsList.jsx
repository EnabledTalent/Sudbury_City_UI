import { useNavigate } from "react-router-dom";
import AiCtaFooter from "./AiCtaFooter";

const jobs = [
  {
    id: 1,
    title: "Java Developer",
    company: "TechCorp",
    location: "Toronto, ON",
    salary: "$80,000",
    tags: ["Full-time", "Hybrid"],
  },
  {
    id: 2,
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "Sudbury, ON",
    salary: "$70,000",
    tags: ["Part-time", "Remote"],
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "Analytics Co",
    location: "Greater Sudbury",
    salary: "$65,000",
    tags: ["Full-time", "On-site"],
  },
];

export default function JobsList() {
  const navigate = useNavigate();

  return (
    <>
    <section className="section">
         {/* BACK NAVIGATION */}
      <button
        className="back-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Jobs
      </button>
      {/* PAGE HEADER */}
      <h1>Jobs in Sudbury</h1>
      <p className="muted">
        Find employment opportunities across the city.
      </p>

     <div className="jobs-filters">
  {/* SEARCH */}
  <div className="filter-search">
    <span className="search-icon">🔍</span>
    <input placeholder="Search..." />
  </div>

  {/* TOP FILTER ROW */}
  <div className="filter-row">
    <button className="filter-pill">
      All Categories ▾
    </button>

    <button className="filter-pill">
      📅 Date
    </button>

    <button className="filter-pill">
      📍 All...
    </button>

    <button className="filter-pill">
      🎚 More Filters ▴
    </button>
  </div>

  {/* OPTIONS */}
  <div className="filter-options">
    <label><input type="radio" /> Full-time</label>
    <label><input type="radio" /> Part-time</label>
    <label><input type="radio" /> Contract</label>
    <label><input type="radio" /> Student-friendly</label>
    <label><input type="radio" /> Accessible</label>
    <label><input type="radio" /> Remote</label>
  </div>

  {/* SORT */}
  <div className="filter-sort">
    <span>Sort by:</span>
    <button className="filter-pill">
      Relevance ▾
    </button>
  </div>
</div>


      {/* JOBS GRID */}
      <div className="grid">
        {jobs.map((job) => (
          <div className="job-card" key={job.id}>
            <div className="icon">💼</div>

            <h3>{job.title}</h3>

            <div className="tags">
              {job.tags.map((tag, i) => (
                <span key={i}>{tag}</span>
              ))}
            </div>

            <p>📍 {job.company}, {job.location}</p>
            <p>💳 {job.salary}</p>

            <button
              className="primary"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              Apply
            </button>
          </div>
        ))}
      </div>
    </section>
    <AiCtaFooter />
    </>
  );
}
