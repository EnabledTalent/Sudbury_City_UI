import { useParams, useNavigate } from "react-router-dom";

const jobData = {
  1: {
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "Sudbury, ON",
    salary: "$70,000",
    description:
      "Build beautiful web applications using React and TypeScript.",
    requirements: [
      "3+ years of experience",
      "Strong communication skills",
      "React & TypeScript knowledge",
      "Problem-solving mindset",
    ],
  },
  2: {
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "Sudbury, ON",
    salary: "$70,000",
    description:
      "Build beautiful web applications using React and TypeScript.",
    requirements: [
      "3+ years of experience",
      "Strong communication skills",
      "React & TypeScript knowledge",
      "Problem-solving mindset",
    ],
  },
  3: {
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "Sudbury, ON",
    salary: "$70,000",
    description:
      "Build beautiful web applications using React and TypeScript.",
    requirements: [
      "3+ years of experience",
      "Strong communication skills",
      "React & TypeScript knowledge",
      "Problem-solving mindset",
    ],
  },
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = jobData[id];

  if (!job) return <p>Job not found</p>;

  return (
    <section className="section job-detail">
      <div className="page-navigation">
        <div className="page-navigation-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back to Jobs
          </button>
        </div>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠 Home
        </button>
      </div>

      <div className="job-detail-layout">
        {/* LEFT */}
        <div>
          <h1>{job.title}</h1>
          <p className="company">{job.company}</p>

          <div className="job-meta">
            <span>📍 {job.location}</span>
            <span>💳 {job.salary}</span>
            <span>⏱ Part-time</span>
          </div>

          <h3>About the Role</h3>
          <p>{job.description}</p>

          <h3>Requirements</h3>
          <ul>
            {job.requirements.map((r, i) => (
              <li key={i}>✔ {r}</li>
            ))}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="salary-box">
          <p>Salary</p>
          <h2>{job.salary}</h2>
          <button className="primary full" onClick={() => navigate("/sign-in")}>Apply Now</button>
        </div>
      </div>
    </section>
  );
}
