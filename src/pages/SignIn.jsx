import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

export default function SignIn() {
  const [isSignIn, setIsSignIn] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
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
          <h1 className="signin-title">
            {isSignIn ? "Sign in" : "Create an account"}
          </h1>
          <p className="signin-subtitle">
            {isSignIn
              ? "Welcome back to Discover Sudbury"
              : "Join Discover Sudbury today"}
          </p>

          <form className="signin-form" onSubmit={handleSubmit}>
            {!isSignIn && (
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required={!isSignIn}
                />
              </div>
            )}

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
              {isSignIn ? "Sign in" : "Create Account"}
            </button>
          </form>

          <p className="signin-switch">
            {isSignIn ? (
              <>
                Don't have an account?{" "}
                <a onClick={() => setIsSignIn(false)}>Sign up</a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a onClick={() => setIsSignIn(true)}>Sign in</a>
              </>
            )}
          </p>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

