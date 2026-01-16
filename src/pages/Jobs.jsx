import { useNavigate } from "react-router-dom";

const jobs = [
  {
    id: 1,
    title: "Registered Nurse",
    location: "Health Sciences North, Sudbury",
    salary: "$75,000 - $95,000",
    tags: ["Full-time", "Healthcare"],
  },
  {
    id: 2,
    title: "Software Developer",
    location: "Tech Startup, Greater Sudbury",
    salary: "$65,000 - $85,000",
    tags: ["Full-time", "Remote/Hybrid"],
  },
  {
    id: 3,
    title: "Elementary Teacher",
    location: "Rainbow District School Board",
    salary: "$55,000 - $95,000",
    tags: ["Full-time", "Education"],
  },
];

export default function Jobs() {
  const navigate = useNavigate();

  return (
    <section id="jobs" className="section">
  <div className="section-header">
    <h2>Jobs & Opportunities</h2>

    <button className="view-all"  onClick={() => navigate("/jobs")}>
      View all <span>→</span>
    </button>
  </div>

      <div className="grid">
        {jobs.map((job) => (
          <div className="job-card" key={job.id}>
            <div className="icon blue">💼</div>
            <h3>{job.title}</h3>

            <div className="tags">
              {job.tags.map((tag, i) => (
                <span key={i}>{tag}</span>
              ))}
            </div>

            <p>📍 {job.location}</p>
            <p>💳 {job.salary}</p>

            <button
              className="primary"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

