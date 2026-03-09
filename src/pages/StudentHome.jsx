import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../services/jobService";
import { logoutUser } from "../services/authService";
import "./StudentHome.css";

export default function StudentHome() {
  const brandLogoSrc = `${process.env.PUBLIC_URL}/images/Sudbury logo.svg`;
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    localStorage.clear();
    navigate("/");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    setError("");
    setLoading(true);

    try {
      await uploadResume(file);
      localStorage.setItem("tour:student:profileBuilder:pending", "true");
      navigate("/student/profile");
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      setError(uploadError.message || "Failed to upload resume.");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="student-home">
      <header className="student-home__header">
        <div className="student-home__brand" aria-label="Sudburry">
          <img
            className="student-home__brand-image"
            src={brandLogoSrc}
            alt=""
            aria-hidden="true"
          />
          <span className="student-home__brand-text">Sudburry</span>
        </div>

        <nav className="student-home__actions" aria-label="User actions">
          <span className="student-home__profile-label">Profile</span>
          <button type="button" className="student-home__logout-btn" onClick={handleLogout}>
            Log out
          </button>
          <button
            type="button"
            className="student-home__coach-btn"
            onClick={() => navigate("/student/view-profile")}
          >
            AI Career Coach
          </button>
        </nav>
      </header>

      <main className="student-home__main" aria-labelledby="student-home-title">
        <section className="student-home__card">
          <h1 id="student-home-title" className="student-home__title">
            Create your Sudburry profile
          </h1>
          <p className="student-home__subtitle">You can find matching jobs from Sudburry.</p>

          <section className="student-home__upload" aria-label="Resume upload">
            <p className="student-home__upload-text">
              Upload your resume to build a profile automatically
            </p>

            <button
              type="button"
              className="student-home__upload-btn"
              onClick={handleUploadClick}
              disabled={loading}
              aria-describedby="student-home-upload-hint"
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>

            <input
              id="student-home-resume-input"
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="student-home__file-input"
            />

            <p id="student-home-upload-hint" className="student-home__hint">
              Supports file format .pdf
            </p>

            {error && (
              <p className="student-home__error" role="alert">
                {error}
              </p>
            )}
          </section>

          <p className="student-home__manual-row">
            Don't have resume file ready?{" "}
            <button
              type="button"
              className="student-home__manual-btn"
              onClick={() => navigate("/student/profile")}
            >
              Create manually
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
