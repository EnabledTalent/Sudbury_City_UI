export default function Hero() {
  return (
    <section className="hero">
      {/* Overlay */}
      <div className="hero-overlay" />

      {/* Content */}
      <div className="hero-content">
        <h1>
          Everything you need to know about{" "}
          <span>Sudbury</span>
          <br />— in one place
        </h1>

        <p>
          Find jobs, events, local services, training programs, and
          community resources across the city.
        </p>

        {/* AI Search Card */}
        <div className="hero-card">
          <div className="hero-card-header">
            <span className="hero-ai-icon" style={{marginBottom:"2px"}}>✨</span>
            <div>
              <strong>AI City Assistant</strong>
              <p style={{color:"black"}}>Ask anything about Sudbury</p>
            </div>
          </div>

          <div className="hero-search">
            <input placeholder="Ask anything about Sudbury..." />
            <button style={{width:"15%"}}>Ask</button>
          </div>

          <div className="hero-suggestions">
            <button>What events are happening this weekend?</button>
            <button>Jobs available for students?</button>
            <button>Things to do today</button>
            <button>Training programs near me</button>
          </div>
        </div>
      </div>
    </section>
  );
}
