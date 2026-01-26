import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/authService";

export default function Login() {
  const [mode, setMode] = useState("signup"); // signup | login
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "student",
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    if (mode === "login") {
     
      // ⏳ WAIT FOR RESPONSE
      const data = await loginUser(form.username, form.password);
     console.log("Login successful:", data);
      // ✅ CONFIRM TOKEN IS STORED
      const token = localStorage.getItem("token");

      if (token) {
        navigate("/student"); // ✅ NAVIGATE ONLY NOW
      } else {
        setError("Token not stored");
      }
    } else {
      await registerUser({
        name: form.name,
        role: form.role,
        username: form.email,
        password: form.password,
      });
      alert("Signup successful");
    }
  } catch (err) {
    setError(err.message || "Login failed");
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
                      <option value="student">Student</option>
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
                  setMode(mode === "signup" ? "login" : "signup")
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
    </div>
  );
}
