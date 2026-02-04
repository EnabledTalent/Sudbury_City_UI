import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJobseekerMetrics } from "../services/jobService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [windowDays, setWindowDays] = useState(30);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get email from localStorage or token
  const getEmail = () => {
    const profileData = localStorage.getItem("profileData");
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        return parsed.basicInfo?.email;
      } catch (e) {
        console.error("Error parsing profileData:", e);
      }
    }
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || payload.email;
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
    return null;
  };

  // Fetch metrics when windowDays changes
  useEffect(() => {
    const loadMetrics = async () => {
      const email = getEmail();
      if (!email) {
        setError("Email not found. Please login again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await fetchJobseekerMetrics(email, windowDays);
        console.log("Fetched metrics:", data);
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setError(err.message || "Failed to load metrics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [windowDays]);

  const styles = {
    page: {
      background: "#f9fafb",
      minHeight: "100vh",
    },
    topNav: {
      background: "#ffffff",
      padding: "16px 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e5e7eb",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    logo: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
    },
    navLinks: {
      display: "flex",
      gap: "32px",
      alignItems: "center",
    },
    navLink: {
      fontSize: "14px",
      color: "#6b7280",
      cursor: "pointer",
      textDecoration: "none",
      paddingBottom: "4px",
      fontWeight: 500,
    },
    navLinkActive: {
      fontSize: "14px",
      color: "#3b82f6",
      cursor: "pointer",
      textDecoration: "none",
      paddingBottom: "4px",
      borderBottom: "2px solid #3b82f6",
      fontWeight: 500,
    },
    userActions: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
    },
    userActionLink: {
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
    },
    aiCoachBtn: {
      background: "#ef4444",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "32px 40px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
    },
    title: {
      fontSize: "28px",
      fontWeight: 600,
      color: "#111827",
      margin: 0,
    },
    dropdownContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    dropdownLabel: {
      fontSize: "14px",
      color: "#374151",
      fontWeight: 500,
    },
    dropdown: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      background: "#ffffff",
      cursor: "pointer",
      outline: "none",
      minWidth: "120px",
    },
    loading: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#6b7280",
      fontSize: "16px",
    },
    error: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#ef4444",
      fontSize: "16px",
      background: "#fff1f2",
      borderRadius: "8px",
      border: "1px solid #ef4444",
      margin: "20px 0",
    },
    metricsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
      marginTop: "24px",
    },
    metricCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e5e7eb",
    },
    metricTitle: {
      fontSize: "14px",
      color: "#6b7280",
      fontWeight: 500,
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    metricValue: {
      fontSize: "32px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "8px",
    },
    metricDescription: {
      fontSize: "14px",
      color: "#6b7280",
    },
    section: {
      marginTop: "40px",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "24px",
    },
    chartsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
    },
    statusCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e5e7eb",
    },
    statusHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    statusName: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
      textTransform: "capitalize",
    },
    statusCount: {
      fontSize: "18px",
      fontWeight: 600,
      color: "#111827",
    },
    barContainer: {
      width: "100%",
      height: "24px",
      background: "#f3f4f6",
      borderRadius: "12px",
      overflow: "hidden",
      position: "relative",
    },
    bar: {
      height: "100%",
      borderRadius: "12px",
      transition: "width 0.3s ease",
    },
  };

  // Helper function to get color for each status
  const getStatusColor = (status) => {
    const colors = {
      APPLIED: "#3b82f6", // Blue
      UNDER_REVIEW: "#f59e0b", // Amber
      INTERVIEW: "#8b5cf6", // Purple
      OFFERED: "#10b981", // Green
      HIRED: "#059669", // Dark Green
      REJECTED: "#ef4444", // Red
    };
    return colors[status] || "#6b7280"; // Default gray
  };

  return (
    <div style={styles.page}>
      {/* Top Navigation */}
      <nav style={styles.topNav}>
        <div style={styles.logo}>
          <span>Sudburry</span>
        </div>
        <div style={styles.navLinks}>
          <span 
            style={styles.navLink}
            onClick={() => navigate("/student/view-profile")}
          >
            Home
          </span>
          <span 
            style={styles.navLink}
            onClick={() => navigate("/student/my-jobs")}
          >
            My Jobs
          </span>
          <span style={styles.navLinkActive}>Dashboard</span>
        </div>
        <div style={styles.userActions}>
          <span 
            style={styles.userActionLink}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("profileData");
              localStorage.removeItem("profileEditMode");
              navigate("/");
            }}
          >
            Log Out
          </span>
          <span style={{ fontSize: "18px", cursor: "pointer" }}>⚙️</span>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard</h1>
          <div style={styles.dropdownContainer}>
            <label style={styles.dropdownLabel}>Time Period:</label>
            <select
              style={styles.dropdown}
              value={windowDays}
              onChange={(e) => setWindowDays(Number(e.target.value))}
            >
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 365 days</option>
            </select>
          </div>
        </div>

        {loading && (
          <div style={styles.loading}>Loading metrics...</div>
        )}

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {!loading && !error && metrics && (
          <>
            {/* Summary Cards */}
            <div style={styles.metricsContainer}>
              <div style={styles.metricCard}>
                <div style={styles.metricTitle}>Total Applications</div>
                <div style={styles.metricValue}>{metrics.totalApplied || 0}</div>
                <div style={styles.metricDescription}>All time applications</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricTitle}>Applications in Period</div>
                <div style={styles.metricValue}>{metrics.appliedInWindow || 0}</div>
                <div style={styles.metricDescription}>Last {windowDays} days</div>
              </div>
            </div>

            {/* Status Breakdown - All Time */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Status Breakdown (All Time)</h2>
              <div style={styles.chartsContainer}>
                {Object.entries(metrics.totalByStatus || {}).map(([status, count]) => (
                  <div key={status} style={styles.statusCard}>
                    <div style={styles.statusHeader}>
                      <div style={styles.statusName}>{status.replace(/_/g, ' ')}</div>
                      <div style={styles.statusCount}>{count}</div>
                    </div>
                    <div style={styles.barContainer}>
                      <div
                        style={{
                          ...styles.bar,
                          width: `${metrics.totalApplied > 0 ? (count / metrics.totalApplied) * 100 : 0}%`,
                          background: getStatusColor(status),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown - In Window */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Status Breakdown (Last {windowDays} Days)</h2>
              <div style={styles.chartsContainer}>
                {Object.entries(metrics.byStatusInWindow || {}).map(([status, count]) => (
                  <div key={status} style={styles.statusCard}>
                    <div style={styles.statusHeader}>
                      <div style={styles.statusName}>{status.replace(/_/g, ' ')}</div>
                      <div style={styles.statusCount}>{count}</div>
                    </div>
                    <div style={styles.barContainer}>
                      <div
                        style={{
                          ...styles.bar,
                          width: `${metrics.appliedInWindow > 0 ? (count / metrics.appliedInWindow) * 100 : 0}%`,
                          background: getStatusColor(status),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && !error && !metrics && (
          <div style={styles.loading}>No metrics data available</div>
        )}
      </div>
    </div>
  );
}
