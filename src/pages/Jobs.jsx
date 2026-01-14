import { useNavigate } from "react-router-dom";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    location: "Sudbury, ON",
    salary: "$70,000",
  },
   {
    id: 2,
    title: "Frontend Developer",
    location: "Sudbury, ON",
    salary: "$70,000",
  },
   {
    id: 3,
    title: "Frontend Developer",
    location: "Sudbury, ON",
    salary: "$70,000",
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
              <span>Part-time</span>
              <span>Remote</span>
            </div>

            <p>📍 {job.location}</p>
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
  );
}

