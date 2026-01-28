import { useRef, useState } from "react";
import { uploadResume } from "../services/jobService";
import { useNavigate } from "react-router-dom";

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
  
     navigate("/student/success");
    } catch {
      setError("Failed to upload resume");
    } finally {
      setLoading(false);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div style={{ background: "#f2f7fd", minHeight: "100vh" }}>
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
        }}
      >
        <div style={{ fontWeight: "600" }}>Sudburry</div>

        <div style={{ display: "flex", gap: "20px" }}>
          <span>Profile</span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Log out
          </span>
          <button
            style={{
              background: "#f08a52",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
            }}
          >
            AI Career Coach
          </button>
        </div>
      </header>

      {/* MAIN CARD */}
      <div
        style={{
          background: "#fff",
          maxWidth: "900px",
          margin: "60px auto",
          padding: "60px",
          borderRadius: "20px",
          textAlign: "center",
        }}
      >
        <h2>Create your Sudburry profile</h2>
        <p>You can find matching jobs from Sudburry</p>

        <div
          style={{
            border: "2px dashed #dce6f2",
            borderRadius: "16px",
            padding: "40px",
            marginTop: "40px",
          }}
        >
          <p>Upload your resume to build a profile automatically</p>

          <button
            onClick={handleUploadClick}
            disabled={loading}
            style={{
              background: "#d87a2c",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              marginTop: "16px",
              cursor: "pointer",
            }}
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

          <p style={{ marginTop: "12px", fontSize: "13px" }}>
            Supports file format .pdf
          </p>

          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
          )}
        </div>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          Don’t have resume file ready?{" "}
          <span style={{ color: "#f08a52", cursor: "pointer" }}>
            Create manually
          </span>
        </p>
      </div>
    </div>
  );
}
