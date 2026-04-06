import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/authService";
import { fetchOrganizationProfile } from "../services/employerService";
import { fetchProfile } from "../services/profileService";
import Toast from "../components/Toast";

export default function Login() {
  const [mode, setMode] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "error" });

  const navigate = useNavigate();
  const modePrefix = mode === "signup" ? "signup" : "login";
  const authErrorId = "auth-error";
  const authSubtitleId = "auth-subtitle";

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "employer",
  });

  const switchAuthMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setShowPassword(false);

    // Never carry password across screens/modes.
    setForm((prev) => {
      if (nextMode === "login") {
        return {
          ...prev,
          username: prev.username || prev.email,
          password: "",
        };
      }

      return {
        ...prev,
        password: "",
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast({ message: "", type: "error" });
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await loginUser(form.username, form.password);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token) {
          const normalizedRole = String(role || "").trim().toUpperCase().replace(/_/g, "");
          if (normalizedRole === "SERVICEPROVIDER") {
            navigate("/service-provider/profile");
          } else if (normalizedRole === "EMPLOYER") {
            try {
              const orgProfile = await fetchOrganizationProfile();

              if (orgProfile) {
                navigate("/employer/dashboard");
              } else {
                navigate("/employer/home");
              }

            } catch (err) {
              console.error("Error checking organization profile:", err);
              navigate("/employer/home");
            }

          } else {
            try {
              const email = data.sub || data.email || data.username;

              if (email) {
                const profile = await fetchProfile(email);

                if (profile && Object.keys(profile).length > 0) {
                  navigate("/student/view-profile");
                } else {
                  navigate("/student");
                }
              } else {
                navigate("/student");
              }

            } catch (err) {
              console.error("Error checking profile:", err);
              navigate("/student");
            }

          }

        } else {
          setError("Token not stored");
        }

      } else {

        await registerUser({
          name: form.name,
          role: form.role === "student" ? "Student" : form.role === "serviceProvider" ? "ServiceProvider" : form.role,
          username: form.email,
          password: form.password,
        });

        setToast({
          message: "Signup successful! Please verify your email, then log in.",
          type: "success",
        });

        setTimeout(() => {
          switchAuthMode("login");
          setToast({ message: "", type: "error" });
        }, 2000);
      }

    } catch (err) {
      const message =
        err?.message || (mode === "signup" ? "Signup failed" : "Login failed");
      if (mode === "signup") {
        setError("");
        setToast({ message, type: "error" });
      } else {
        setError(message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" id="main-content">
      <a className="skip-link" href="#auth-form">
        Skip to authentication form
      </a>
      
      {/* Back Navigation Arrow */}
      <a 
        href="https://sudburyjobs.ca/" 
        className="back-nav-link"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#374151",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 500,
          padding: "8px 12px",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.color = "#111827";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#374151";
        }}
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </a>

      <div className="auth-wrapper">
        <div className="auth-container">
          <aside className="auth-left" aria-label="Platform welcome">
            <div className="logo-circle">
              <img
                src="/images/favicon.svg"
                alt=""
                width={40}
                height={40}
                decoding="async"
              />
            </div>
            <h2>
              Welcome To <b>Sudbury</b>
            </h2>
            <p>Because every talent deserves the right chance</p>
          </aside>

          <section className="auth-right" aria-labelledby="auth-title">
            <h1 id="auth-title">{mode === "signup" ? "Sign Up" : "Login"}</h1>

            <p className="auth-subtitle" id={authSubtitleId}>
              {mode === "signup"
                ? "Create a Talent account to start applying"
                : "Login to your account"}
            </p>

            <form
              id="auth-form"
              className="auth-form"
              onSubmit={handleSubmit}
              aria-describedby={error && mode === "login" ? authErrorId : authSubtitleId}
            >
              {mode === "signup" && (
                <>
                  <div className="form-group">
                    <label htmlFor="signup-name">Full name</label>
                    <input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-email">Email</label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-role">Sign up as</label>
                    <select
                      id="signup-role"
                      name="role"
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="student">Talent</option>
                      <option value="employer">Employer</option>
                      <option value="serviceProvider">Service Provider</option>
                    </select>
                  </div>
                </>
              )}

              {mode === "login" && (
                <div className="form-group">
                  <label htmlFor="login-username">Username</label>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? authErrorId : undefined}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor={`${modePrefix}-password`}>Password</label>
                <div className="password-wrapper">

                  <input
                    id={`${modePrefix}-password`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    aria-invalid={mode === "login" && Boolean(error)}
                    aria-describedby={mode === "login" && error ? authErrorId : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && mode === "login" && (
                <p id={authErrorId} className="error-text" role="alert" aria-live="assertive">
                  {error}
                </p>
              )}

              <button className="submit-btn" disabled={loading} type="submit">
                {loading ? "Please wait..." : mode === "signup" ? "Create account" : "Login"}
              </button>

            </form>

            <p className="helper-text">Takes less than 2 minutes</p>

            <p className="switch-text">
              {mode === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                className="switch-btn"
                onClick={() => switchAuthMode(mode === "signup" ? "login" : "signup")}
              >
                {mode === "signup" ? "Login" : "Sign Up"}
              </button>
            </p>

            <p className="terms-text">
              By continuing, you agree to our{" "}
              <a className="terms-link" href="https://sudburyjobs.ca/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="terms-link" href="https://sudburyjobs.ca/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </p>
          </section>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </main>
  );
}
