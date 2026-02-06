import { useNavigate } from "react-router-dom";

export default function ProfileSuccess() {
  const navigate = useNavigate();

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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "600" }}>Sudburry</span>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span>Profile</span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Log Out
          </span>
          <button
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            AI Career Coach
          </button>
        </div>
      </header>

      {/* SUCCESS CARD */}
      <div
        style={{
          background: "#fff",
          maxWidth: "900px",
          margin: "80px auto",
          padding: "100px 40px",
          borderRadius: "20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
          Congrats, Your Profile has been created successfully
        </h2>

        <button
          onClick={() => navigate("/student/view-profile")}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          View your profile
        </button>
      </div>
    </div>
  );
}
