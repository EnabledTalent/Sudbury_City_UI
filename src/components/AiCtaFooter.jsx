import { useNavigate } from "react-router-dom";

export default function AiCtaFooter() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* Brand */}
        <div className="footer-brand">
          <h3>
            Discover <span>Sudbury</span>
          </h3>
          <p>
            Everything you need to know about
            <br />
            Sudbury — in one place.
          </p>
        </div>

        {/* Platform */}
        <div className="footer-column">
          <h4>Platform</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/jobs"); }} style={{ cursor: "pointer" }}>Jobs</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/events"); }} style={{ cursor: "pointer" }}>Events</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/services"); }} style={{ cursor: "pointer" }}>Places & Services</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/training"); }} style={{ cursor: "pointer" }}>Training</a>
        </div>

        {/* Resources */}
        <div className="footer-column">
          <h4>Resources</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/student-hub"); }} style={{ cursor: "pointer" }}>Student Hub</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/resident-hub"); }} style={{ cursor: "pointer" }}>Resident Hub</a>
        </div>

        {/* Company */}
        <div className="footer-column">
          <h4>Company</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/about"); }}>About</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Help</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Business Directory</a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Discover Sudbury. All rights reserved.
      </div>
    </footer>
  );
}
