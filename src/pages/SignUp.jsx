import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const employerTypes = [
  "College",
  "University",
  "NGO",
  "Company",
];

const employeeTypes = [
  "Student",
  "Professional",
];

export default function SignUp() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    organizationName: "",
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", { ...formData, role: selectedRole, type: selectedType });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSelectedType(""); // Reset type when role changes
  };

  return (
    <>
      <div className="signin-page">
        <div className="signin-container">
          <h1 className="signin-title">Create an Account</h1>
          <p className="signin-subtitle">
            Choose your account type to get started
          </p>

          {!selectedRole ? (
            <div className="signup-role-selection">
              <div
                className={`signup-role-tile ${selectedRole === "employer" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("employer")}
              >
                <div className="signup-role-icon">🏢</div>
                <h3>Employer</h3>
                <p>Post jobs, events, and opportunities</p>
              </div>
              <div
                className={`signup-role-tile ${selectedRole === "employee" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("employee")}
              >
                <div className="signup-role-icon">👤</div>
                <h3>Employee</h3>
                <p>Find jobs, events, and opportunities</p>
              </div>
            </div>
          ) : (
            <form className="signin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

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

              {selectedRole === "employer" && (
                <div className="form-group">
                  <label htmlFor="organizationName">Organization Name</label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    placeholder="Your organization name"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="type">
                  {selectedRole === "employer" ? "Organization Type" : "Employment Type"}
                </label>
                <select
                  id="type"
                  name="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="">Select {selectedRole === "employer" ? "organization type" : "employment type"}</option>
                  {(selectedRole === "employer" ? employerTypes : employeeTypes).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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

              <div className="signup-form-actions">
                <button
                  type="button"
                  className="signup-back-btn"
                  onClick={() => setSelectedRole(null)}
                >
                  ← Back
                </button>
                <button type="submit" className="signin-submit-btn">
                  Create Account
                </button>
              </div>
            </form>
          )}

          <p className="signin-switch">
            Already have an account?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/sign-in"); }} style={{ cursor: "pointer", color: "#2563eb" }}>Sign in</a>
          </p>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

