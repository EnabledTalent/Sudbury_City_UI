import { useRef, useState } from "react";
import { uploadResume } from "../services/jobService";
import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/student/StudentHeader";
import "./StudentHome.css";

export default function StudentHome() {
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Validate PDF
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await uploadResume(file);
      // Trigger first-time tour in profile builder after successful upload
      localStorage.setItem("tour:student:profileBuilder:pending", "true");
      // Navigate to profile builder so user can review and edit the parsed data
      // The profile context will automatically load the normalized data from localStorage
      navigate("/student/profile");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload resume");
    } finally {
      setLoading(false);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="student-home">
      <StudentHeader showMainNav={false} showAiCoach={false} />

      <main className="student-home__main" aria-label="Student onboarding">
        <section className="student-home__card">
          <h1 className="student-home__title">Create your Sudburry profile</h1>
          <p className="student-home__subtitle">Upload your resume to build a profile automatically.</p>

          <div className="student-home__upload">
            <p className="student-home__upload-text">Upload your resume (PDF)</p>

            <button
              type="button"
              className="student-home__primary-btn"
              onClick={handleUploadClick}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Resume"}
            </button>

            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <p className="student-home__support-text">Supports file format .pdf</p>
            {error && <p className="student-home__error">{error}</p>}
          </div>

          <p className="student-home__manual">
            Don’t have a resume file ready?{" "}
            <span
              className="student-home__manual-link"
              role="button"
              tabIndex={0}
              onClick={() => {
                localStorage.setItem("tour:student:profileBuilder:pending", "true");
                navigate("/student/profile");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  localStorage.setItem("tour:student:profileBuilder:pending", "true");
                  navigate("/student/profile");
                }
              }}
            >
              Create manually
            </span>
          </p>
        </section>
      </main>
    </div>
  );
}
