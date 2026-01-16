import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="signin-page">
        <div className="signin-container">
          <div className="page-navigation">
            <div className="page-navigation-left">
              <button className="back-btn" onClick={() => navigate("/")}>
                ← Back
              </button>
            </div>
            <button className="home-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
          </div>
          <h1 className="signin-title">Welcome</h1>
          <p className="signin-subtitle">
            Sign in to your Discover Sudbury account
          </p>

          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="signin-submit-btn">
              Sign In
            </button>
          </form>

          <p className="signin-switch">
            Don't have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/sign-up"); }} style={{ cursor: "pointer", color: "#2563eb" }}>Sign up</a>
          </p>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

