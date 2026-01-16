import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";

export default function Navbar() {
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
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/explore"); }}>Explore</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/events"); }}>Events</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/jobs"); }}>Jobs</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/services"); }}>Services</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/training"); }}>Training</a>
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setHubsOpen(true)}
            onMouseLeave={() => setHubsOpen(false)}
          >
            <a href="#" className="dropdown-link" onClick={(e) => e.preventDefault()}>
              Hubs <span>▾</span>
            </a>
            {hubsOpen && (
              <div className="dropdown-menu">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/student-hub"); }}>🎓 Student</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate("/resident-hub"); }}>🏠 Resident</a>
              </div>
            )}
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/about"); }}>About</a>
        </nav>
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <button className="icon-btn" onClick={() => navigate("/ai-assistant")}>✨ AI Assistant</button>
        <button className="icon-btn" onClick={toggleDarkMode}>
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        <button className="sign-up" onClick={() => navigate("/sign-up")}>Sign Up</button>
        <button className="sign-in" onClick={() => navigate("/sign-in")}>Sign In</button>
      </div>
    </header>
  );
}
