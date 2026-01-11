import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="top-nav">
      {/* LEFT */}
      <div className="nav-left">
        <div
          className="logo"
          onClick={() => scrollToSection("home")}
        >
          Discover <span>Sudbury</span>
        </div>

        <nav className="nav-links">
          <a className="active" onClick={() => scrollToSection("home")}>Home</a>
          <a onClick={() => scrollToSection("explore")}>Explore</a>
          <a onClick={() => scrollToSection("events")}>Events</a>
          <a onClick={() => scrollToSection("jobs")}>Jobs</a>
          <a onClick={() => scrollToSection("services")}>Services</a>
          <a onClick={() => scrollToSection("resources")}>Resources</a>
          <a onClick={() => scrollToSection("hubs")} className="dropdown-link">
            Hubs <span>▾</span>
          </a>
          <a onClick={() => scrollToSection("about")}>About</a>
        </nav>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <button className="icon-btn">✨ AI Assistant</button>
        <button className="icon-btn">🌙</button>

        <div className="profile">
          <button
            className="profile-btn"
            onClick={() => setOpen(!open)}
          >
            🎓 Student ▾
          </button>

          {open && (
            <div className="profile-menu">
              <div>🎓 Student</div>
              <div>🏠 Resident</div>
              <div>🌍 Newcomer</div>
              <div>✈️ Traveller</div>
            </div>
          )}
        </div>

        <button className="sign-in">Sign In</button>
      </div>
    </header>
  );
}
