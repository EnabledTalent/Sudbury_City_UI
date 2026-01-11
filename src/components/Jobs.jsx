const jobs = Array(3).fill({
  title: "Java Developer",
  location: "Sudbury",
  salary: "$60,000",
});

export default function Jobs() {
  return (
    <section id="jobs" className="section">
      <h2>Jobs & Opportunities</h2>

      <div className="grid">
        {jobs.map((job, i) => (
          <div className="job-card" key={i}>
            <div className="icon blue">💼</div>
            <h3>{job.title}</h3>

            <div className="tags">
              <span>Part-time</span>
              <span>Hybrid</span>
            </div>

            <p>📍 {job.location}</p>
            <p>💳 {job.salary}</p>

            <p className="muted">
              Job Description: Looking for Java Full Stack Developer with Node JS…
            </p>

            <button className="primary">Apply</button>
          </div>
        ))}
      </div>
    </section>
  );
}
