export default function AiCtaFooter() {
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
          <a href="#jobs">Jobs</a>
          <a href="#events">Events</a>
          <a href="#services">Places & Services</a>
          <a href="#programs">Training</a>
        </div>

        {/* Resources */}
        <div className="footer-column">
          <h4>Resources</h4>
          <a>Student Hub</a>
          <a>Resident Hub</a>
          <a>Newcomer Hub</a>
          <a>Visitor Hub</a>
        </div>

        {/* Company */}
        <div className="footer-column">
          <h4>Company</h4>
          <a>About</a>
          <a>Help</a>
          <a>Privacy</a>
          <a>Business Directory</a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Discover Sudbury. All rights reserved.
      </div>
    </footer>
  );
}
