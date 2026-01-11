export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Everything you need to know about{" "}
          <span>Sudbury</span> —<br /> in one place
        </h1>

        <p>
          Find jobs, events, local services, training programs,
          and community resources across the city.
        </p>

        <div className="search-box">
          <input placeholder="Search anything..." />
          <button>Search</button>
        </div>

        <div className="quick-links">
          <button>Find jobs near me</button>
          <button>What’s happening this weekend?</button>
          <button>Services near me</button>
        </div>
      </div>

      <div className="hero-right">
        <div className="image-grid">
          <div className="img small"></div>
          <div className="img small"></div>
          <div className="img small"></div>
          <div className="img large"></div>
        </div>
      </div>
    </section>
  );
}
