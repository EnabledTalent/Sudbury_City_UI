import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hubsOpen, setHubsOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
          <a onClick={() => navigate("/")}>Home</a>
          <a onClick={() => navigate("/explore")}>Explore</a>
          <a onClick={() => navigate("/events")}>Events</a>
          <a onClick={() => navigate("/jobs")}>Jobs</a>
          <a onClick={() => navigate("/services")}>Services</a>
          <a onClick={() => navigate("/training")}>Training</a>
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setHubsOpen(true)}
            onMouseLeave={() => setHubsOpen(false)}
          >
            <a className="dropdown-link">
              Hubs <span>▾</span>
            </a>
            {hubsOpen && (
              <div className="dropdown-menu">
                <a onClick={() => navigate("/student-hub")}>🎓 Student</a>
                <a onClick={() => navigate("/resident-hub")}>🏠 Resident</a>
                <a onClick={() => navigate("/newcomer-hub")}>🌍 Newcomer</a>
                <a onClick={() => navigate("/traveller-hub")}>✈️ Traveller</a>
              </div>
            )}
          </div>
          <a onClick={() => navigate("/about")}>About</a>
        </nav>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <button className="icon-btn" onClick={() => navigate("/ai-assistant")}>✨ AI Assistant</button>
        <button className="icon-btn" onClick={toggleDarkMode}>
          {isDarkMode ? "☀️" : "🌙"}
        </button>

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

        <button className="sign-in" onClick={() => navigate("/sign-in")}>Sign In</button>
      </div>
    </header>
  );
}
