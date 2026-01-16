import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

export default function About() {
  return (
    <>
      <div className="about-page">
        <div className="about-container">
          {/* Hero Section */}
          <div className="about-hero">
            <h1 className="about-title">About Discover Sudbury</h1>
            <p className="about-subtitle">
              This platform helps people discover and use city resources more easily.
            </p>
          </div>

          {/* Our Mission Section */}
          <section className="about-section">
            <h2 className="about-section-title">Our Mission</h2>
            <p className="about-section-text">
              Whether you're a student, resident, newcomer, or visitor, we bring together 
              jobs, events, services, and community resources in one place. Our goal is to 
              make navigating Sudbury simple, accessible, and personalized to your needs.
            </p>
          </section>

          {/* Trust & Data Section */}
          <section className="about-section">
            <div className="about-section-header">
              <div className="about-section-icon">📋</div>
              <h2 className="about-section-title">Trust & Data</h2>
            </div>
            <p className="about-section-text">
              Information comes from verified partners, public sources, and community submissions.
            </p>
            <ul className="about-checklist">
              <li>✓ Local government agencies</li>
              <li>✓ Educational institutions</li>
              <li>✓ Trusted community organizations</li>
              <li>✓ Verified business partners</li>
            </ul>
          </section>

          {/* Privacy Section */}
          <section className="about-section">
            <div className="about-section-header">
              <div className="about-section-icon">👁️</div>
              <h2 className="about-section-title">Privacy</h2>
            </div>
            <p className="about-section-text">
              Your data is used only to improve your experience. We don't sell personal information 
              and follow strict data protection guidelines. You control what information you share 
              and can update your preferences anytime.
            </p>
            <button type="button" className="about-link" onClick={(e) => e.preventDefault()}>Read our full privacy policy</button>
          </section>

          {/* How It Works Section */}
          <section className="about-section">
            <div className="about-section-header">
              <div className="about-section-icon">⏰</div>
              <h2 className="about-section-title">How It Works</h2>
            </div>
            <div className="about-steps-grid">
              <div className="about-step-card">
                <div className="about-step-number">1</div>
                <h3 className="about-step-title">Tell us who you are</h3>
                <p className="about-step-text">Choose your role to get personalized content</p>
              </div>
              <div className="about-step-card">
                <div className="about-step-number">2</div>
                <h3 className="about-step-title">Explore resources</h3>
                <p className="about-step-text">Browse jobs, events, services, and more</p>
              </div>
              <div className="about-step-card">
                <div className="about-step-number">3</div>
                <h3 className="about-step-title">Take action</h3>
                <p className="about-step-text">Apply, register, connect with what matters to you</p>
              </div>
            </div>
          </section>

          {/* Contact Us Section */}
          <section className="about-section">
            <div className="about-section-header">
              <div className="about-section-icon">📄</div>
              <h2 className="about-section-title">Contact Us</h2>
            </div>
            <p className="about-section-text">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <div className="about-contact-info">
              <div className="about-email">
                Email: <a href="mailto:hello@discoversudbury.ca" className="about-link">hello@discoversudbury.ca</a>
              </div>
              <button className="about-help-btn">Visit Help Center</button>
            </div>
          </section>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}
