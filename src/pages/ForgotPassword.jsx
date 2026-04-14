import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset, resetPasswordWithOtp } from "../services/authService";
import Toast from "../components/Toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "error" });

  const resetErrorId = "forgot-password-error";

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setToast({ message: "", type: "error" });
    setLoading(true);

    try {
      const message = await requestPasswordReset(email.trim());
      const text =
        typeof message === "string"
          ? message
          : "If an account exists for that email, a reset code has been sent.";
      setToast({ message: text, type: "success" });
      setStep(2);
    } catch (err) {
      setError(err?.message || "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setToast({ message: "", type: "error" });

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordWithOtp({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setToast({
        message: "Password updated. You can sign in with your new password.",
        type: "success",
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page" id="main-content">
      <a className="skip-link" href={step === 1 ? "#forgot-step1-form" : "#forgot-step2-form"}>
        Skip to form
      </a>

      <Link
        to="/"
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
      >
        <ArrowLeft size={20} />
        <span>Back to login</span>
      </Link>

      <div className="auth-wrapper">
        <div className="auth-container">
          <aside className="auth-left" aria-label="Platform welcome">
            <div className="logo-circle">
              <img
                src="/images/LogoOnlyBlack.png"
                alt="Sudbury Jobs"
                width={40}
                height={40}
                decoding="async"
              />
            </div>
            <h2>
              Welcome To <b>Sudbury Jobs</b>
            </h2>
            <p>Because every talent deserves the right chance</p>
          </aside>

          <section className="auth-right" aria-labelledby="forgot-password-title">
            <h1 id="forgot-password-title">
              {step === 1 ? "Forgot password" : "Set a new password"}
            </h1>

            <p className="auth-subtitle" id="forgot-password-subtitle">
              {step === 1
                ? "Enter your account email and we will send a reset code."
                : "Enter the code from your email and choose a new password."}
            </p>

            {step === 1 && (
              <form
                id="forgot-step1-form"
                className="auth-form"
                onSubmit={handleRequestCode}
                aria-describedby={error ? resetErrorId : "forgot-password-subtitle"}
              >
                <div className="form-group">
                  <label htmlFor="forgot-email">Email</label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? resetErrorId : undefined}
                  />
                </div>

                {error && (
                  <p id={resetErrorId} className="error-text" role="alert" aria-live="assertive">
                    {error}
                  </p>
                )}

                <button className="submit-btn" disabled={loading} type="submit">
                  {loading ? "Please wait..." : "Send reset code"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form
                id="forgot-step2-form"
                className="auth-form"
                onSubmit={handleResetPassword}
                aria-describedby={error ? resetErrorId : "forgot-password-subtitle"}
              >
                <div className="form-group">
                  <label htmlFor="forgot-email-readonly">Email</label>
                  <input
                    id="forgot-email-readonly"
                    type="email"
                    readOnly
                    value={email}
                    style={{ background: "#f9fafb", cursor: "default" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-otp">Reset code</label>
                  <input
                    id="forgot-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    aria-invalid={Boolean(error)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="forgot-new-password">New password</label>
                  <div className="password-wrapper">
                    <input
                      id="forgot-new-password"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div className="form-group">
                  <label htmlFor="forgot-confirm-password">Confirm new password</label>
                  <div className="password-wrapper">
                    <input
                      id="forgot-confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                {error && (
                  <p id={resetErrorId} className="error-text" role="alert" aria-live="assertive">
                    {error}
                  </p>
                )}

                <button className="submit-btn" disabled={loading} type="submit">
                  {loading ? "Please wait..." : "Update password"}
                </button>

                <p className="switch-text">
                  <button
                    type="button"
                    className="switch-btn"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                    }}
                  >
                    Use a different email
                  </button>
                </p>
              </form>
            )}

            <p className="terms-text">
              By continuing, you agree to our{" "}
              <a
                className="terms-link"
                href="https://sudburyjobs.ca/terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                className="terms-link"
                href="https://sudburyjobs.ca/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
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
