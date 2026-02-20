import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/authService";
import { fetchOrganizationProfile } from "../services/employerService";
import { fetchProfile } from "../services/profileService";
import Toast from "../components/Toast";

export default function Login() {
  const [mode, setMode] = useState("signup"); // signup | login
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "error" });

  const navigate = useNavigate();

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

    // Never carry password across screens/modes
    setForm((prev) => {
      if (nextMode === "login") {
        return {
          ...prev,
          username: prev.username || prev.email, // convenient, but safe
          password: "",
        };
      }

      // signup
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
        // ⏳ WAIT FOR RESPONSE
        const data = await loginUser(form.username, form.password);
        // ✅ CONFIRM TOKEN IS STORED
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token) {
          // Route based on role
          if (role === "EMPLOYER") {
            // Check if organization profile exists
            try {
              const orgProfile = await fetchOrganizationProfile();
              if (orgProfile) {
                // Organization profile exists, navigate to dashboard
                navigate("/employer/dashboard");
              } else {
                // No organization profile, navigate to home to fill it
                navigate("/employer/home");
              }
            } catch (err) {
              console.error("Error checking organization profile:", err);
              // If error, still navigate to home to fill organization info
              navigate("/employer/home");
            }
          } else {
            // Student login - check if profile exists
            try {
              const email = data.sub || data.email || data.username;
              if (email) {
                const profile = await fetchProfile(email);
                if (profile && Object.keys(profile).length > 0) {
                  // Profile exists, navigate to view profile
                  navigate("/student/view-profile");
                } else {
                  // No profile, navigate to upload resume
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
          role: form.role === "student" ? "Student" : form.role,
          username: form.email,
          password: form.password,
        });
        setToast({
          message: "Signup successful! Please verify your email, then log in.",
          type: "success",
        });
        // Switch to login mode after successful signup
        setTimeout(() => {
          switchAuthMode("login");
          setToast({ message: "", type: "error" });
        }, 2000);
      }
    } catch (err) {
      const message = err?.message || (mode === "signup" ? "Signup failed" : "Login failed");
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
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-container">

          {/* LEFT PANEL */}
          <div className="auth-left">
            <div className="logo-circle">S</div>
            <h1>
              Welcome To <b>Sudburry</b>
            </h1>
            <p>Because every talent deserves the right chance</p>
          </div>

          {/* RIGHT CARD */}
          <div className="auth-right">
            <h2>{mode === "signup" ? "Sign Up" : "Login"}</h2>

            <p className="auth-subtitle">
              {mode === "signup"
                ? "Create a Talent account to start applying"
                : "Login to your account"}
            </p>

            <form onSubmit={handleSubmit}>

              {/* SIGNUP */}
              {mode === "signup" && (
                <>
                  <div className="form-group">
                    <label>Full name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Sign up as</label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      <option value="student">Talent</option>
                      <option value="employer">Employer</option>
                    </select>
                  </div>
                </>
              )}

              {/* LOGIN */}
              {mode === "login" && (
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>
              )}

              {/* PASSWORD */}
              <div className="form-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              {error && <p className="error-text">{error}</p>}

              <button
                className="submit-btn"
                disabled={loading}
                type="submit"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signup"
                  ? "Create account"
                  : "Login"}
              </button>
            </form>

            <p className="helper-text">Takes less than 2 minutes</p>

            <p className="switch-text">
              {mode === "signup"
                ? "Already have an account?"
                : "Don’t have an account?"}{" "}
              <span
                onClick={() =>
                  switchAuthMode(mode === "signup" ? "login" : "signup")
                }
              >
                {mode === "signup" ? "Login" : "Sign Up"}
              </span>
            </p>

            <p className="terms-text">
              By clicking login, you agree to our{" "}
              <u>Terms of Service</u> and <u>Privacy Policy</u>
            </p>
          </div>

        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
