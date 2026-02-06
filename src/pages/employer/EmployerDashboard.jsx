import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployerJobs, fetchEmployerJobStats } from "../../services/jobService";
import Toast from "../../components/Toast";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("1Y");
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "error" });

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const [jobs, stats] = await Promise.all([
          fetchEmployerJobs(),
          fetchEmployerJobStats(),
        ]);

        // Combine jobs with stats
        const jobsWithStats = jobs.map((job) => {
          const jobStats = stats.find((stat) => stat.jobId === job.id);
          return {
            id: job.id,
            companyLogo: job.companyName ? job.companyName.charAt(0).toUpperCase() : "∞",
            jobTitle: job.role || "",
            companyName: job.companyName || "",
            location: job.location || job.address || "",
            experience: job.experienceRange ? `Exp: ${job.experienceRange}` : "Exp: N/A",
            jobType: job.employmentType || job.typeOfWork || "Full Time",
            accepted: jobStats?.acceptedCandidates || 0,
            declined: jobStats?.declinedCandidates || 0,
            matching: jobStats?.matchingCandidates || 0,
            postedTime: job.postedDate
              ? getTimeAgo(new Date(job.postedDate))
              : "Recently",
          };
        });

        // Sort by posted date (most recent first) and take first 3
        const sortedJobs = jobsWithStats
          .sort((a, b) => {
            const dateA = jobs.find((j) => j.id === a.id)?.postedDate;
            const dateB = jobs.find((j) => j.id === b.id)?.postedDate;
            return new Date(dateB || 0) - new Date(dateA || 0);
          })
          .slice(0, 3);

        setRecentJobs(sortedJobs);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setRecentJobs([]);
        setToast({ message: `Failed to load jobs: ${error.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return `${Math.floor(diffInDays / 7)} weeks ago`;
  };

  // Hardcoded data (keeping for accepted candidates)
  const acceptedCandidates = [
    {
      id: 1,
      name: "Jennifer Allison",
      role: "UX Designer",
      status: "Active",
      location: "Allentown, New Mexico 31134",
      experience: "12 Yrs",
      matching: 97,
      profilePic: "👩",
    },
    {
      id: 2,
      name: "Henry Creel",
      role: "Marketing Analyst",
      status: "Active",
      location: "Allentown, New Mexico 31134",
      experience: "12 Yrs",
      matching: 97,
      profilePic: "👨",
    },
    {
      id: 3,
      name: "Milley Arthur",
      role: "Data Analyst",
      status: "Active",
      location: "Allentown, New Mexico 31134",
      experience: "12 Yrs",
      matching: 97,
      profilePic: "👩",
    },
    {
      id: 4,
      name: "Milley Arthur",
      role: "Data Analyst",
      status: "Active",
      location: "Allentown, New Mexico 31134",
      experience: "12 Yrs",
      matching: 97,
      profilePic: "👩",
    },
  ];

  const styles = {
    page: {
      background: "#f2f7fd",
      minHeight: "100vh",
    },
    topNav: {
      background: "#ffffff",
      padding: "16px 40px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontWeight: 600,
      fontSize: "18px",
      color: "#111827",
    },
    logoIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #fb923c, #f97316)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: "16px",
    },
    navLinks: {
      display: "flex",
      gap: "24px",
      alignItems: "center",
    },
    navLink: {
      fontSize: "14px",
      color: "#6b7280",
      cursor: "pointer",
      textDecoration: "none",
      paddingBottom: "4px",
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
    searchBar: {
      display: "flex",
      alignItems: "center",
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "8px 16px",
      gap: "8px",
      minWidth: "300px",
    },
    searchInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: "14px",
      flex: 1,
      color: "#6b7280",
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
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    postJobBtn: {
      background: "linear-gradient(90deg, #fb923c, #f97316)",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "32px 40px",
      display: "flex",
      gap: "24px",
    },
    leftColumn: {
      flex: "0 0 65%",
    },
    rightColumn: {
      flex: "0 0 35%",
    },
    card: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "20px",
    },
    timeFilters: {
      display: "flex",
      gap: "8px",
      marginBottom: "20px",
    },
    timeFilterBtn: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 500,
      color: "#6b7280",
    },
    timeFilterBtnActive: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid #fb923c",
      background: "#fff7ed",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 500,
      color: "#fb923c",
    },
    graphContainer: {
      height: "200px",
      marginBottom: "16px",
      position: "relative",
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    graphPlaceholder: {
      color: "#9ca3af",
      fontSize: "14px",
    },
    legend: {
      display: "flex",
      gap: "16px",
      marginBottom: "12px",
      flexWrap: "wrap",
    },
    legendItem: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      color: "#6b7280",
    },
    legendColor: {
      width: "12px",
      height: "12px",
      borderRadius: "2px",
    },
    description: {
      fontSize: "12px",
      color: "#9ca3af",
      fontStyle: "italic",
    },
    jobCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "box-shadow 0.2s",
    },
    jobCardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "12px",
    },
    companyLogo: {
      width: "48px",
      height: "48px",
      borderRadius: "8px",
      background: "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "20px",
      fontWeight: 700,
    },
    jobInfo: {
      flex: 1,
    },
    jobTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "4px",
    },
    companyName: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    location: {
      fontSize: "12px",
      color: "#9ca3af",
    },
    jobTags: {
      display: "flex",
      gap: "8px",
      marginBottom: "12px",
      flexWrap: "wrap",
    },
    tag: {
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: 500,
    },
    tagGreen: {
      background: "#d1fae5",
      color: "#065f46",
    },
    tagLightGreen: {
      background: "#ecfdf5",
      color: "#047857",
    },
    jobMetrics: {
      display: "flex",
      gap: "16px",
      fontSize: "12px",
      color: "#6b7280",
    },
    metric: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    postedTime: {
      fontSize: "12px",
      color: "#9ca3af",
      marginTop: "8px",
    },
    summaryCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    summaryTitle: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "12px",
    },
    summaryNumber: {
      fontSize: "32px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "4px",
    },
    summarySubtitle: {
      fontSize: "12px",
      color: "#6b7280",
    },
    summaryMetrics: {
      display: "flex",
      justifyContent: "space-between",
      gap: "16px",
    },
    summaryMetric: {
      flex: 1,
    },
    summaryMetricLabel: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    summaryMetricValue: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "2px",
    },
    summaryMetricChange: {
      fontSize: "12px",
      color: "#10b981",
    },
    attentionCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      border: "1px solid #fef3c7",
    },
    attentionTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "8px",
    },
    attentionSummary: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "16px",
    },
    attentionList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      marginBottom: "16px",
    },
    attentionItem: {
      fontSize: "12px",
      color: "#374151",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    attentionBullet: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
    },
    attentionBulletOrange: {
      background: "#fb923c",
    },
    attentionBulletRed: {
      background: "#ef4444",
    },
    reviewBtn: {
      background: "linear-gradient(90deg, #fb923c, #f97316)",
      color: "#ffffff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: 500,
      width: "100%",
    },
    candidateCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      border: "1px solid #e5e7eb",
      display: "flex",
      gap: "12px",
    },
    candidatePic: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      flexShrink: 0,
    },
    candidateInfo: {
      flex: 1,
    },
    candidateName: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "4px",
    },
    candidateRole: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    candidateStatus: {
      fontSize: "11px",
      color: "#10b981",
      fontWeight: 500,
      marginBottom: "4px",
    },
    candidateDetails: {
      fontSize: "11px",
      color: "#9ca3af",
      marginBottom: "2px",
    },
    candidateMatching: {
      fontSize: "12px",
      color: "#fb923c",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      {/* Top Navigation */}
      <nav style={styles.topNav}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>S</div>
          <span>Sudburry</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLinkActive}>Dashboard</span>
          <span
            style={styles.navLink}
            onClick={() => navigate("/employer/candidates")}
          >
            Candidates
          </span>
          <span
            style={styles.navLink}
            onClick={() => navigate("/employer/listed-jobs")}
          >
            Listed Jobs
          </span>
          <span
            style={styles.navLink}
            onClick={() => navigate("/employer/company-profile")}
          >
            Company Profile
          </span>
        </div>
        <div style={styles.searchBar}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by skills, company or job"
            style={styles.searchInput}
          />
        </div>
        <div style={styles.userActions}>
          <span style={styles.userActionLink}>
            <span>👤</span>
            Profile
          </span>
          <span
            style={styles.userActionLink}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("profileData");
              navigate("/");
            }}
          >
            <span>🚪</span>
            Log Out
          </span>
          <button
            style={styles.postJobBtn}
            onClick={() => navigate("/employer/post-job")}
          >
            Post a Job +
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.container}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Candidate Acceptance Rate Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Candidate Acceptance Rate</h2>
            <div style={styles.timeFilters}>
              {["1W", "1M", "3M", "1Y"].map((filter) => (
                <button
                  key={filter}
                  style={
                    timeFilter === filter
                      ? styles.timeFilterBtnActive
                      : styles.timeFilterBtn
                  }
                  onClick={() => setTimeFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div style={styles.graphContainer}>
              <div style={styles.graphPlaceholder}>
                Line Graph: Actual (blue) vs Projected (orange dashed)
                <br />
                Data point: May 5 - 30%
              </div>
            </div>
            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    background: "#10b981",
                  }}
                />
                <span>Good: ≥ 80%</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    background: "#f59e0b",
                  }}
                />
                <span>Moderate: 60-79%</span>
              </div>
              <div style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendColor,
                    background: "#ef4444",
                  }}
                />
                <span>Poor: &lt; 60%</span>
              </div>
            </div>
            <p style={styles.description}>
              Projected rate based on historical performance, role complexity,
              and market benchmarks
            </p>
          </div>

          {/* Recent Jobs Section */}
          <div>
            <h2 style={styles.cardTitle}>Recent Jobs</h2>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                Loading jobs...
              </div>
            ) : recentJobs.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                No jobs posted yet
              </div>
            ) : (
              recentJobs.map((job) => (
              <div key={job.id} style={styles.jobCard}>
                <div style={styles.jobCardHeader}>
                  <div style={styles.companyLogo}>{job.companyLogo}</div>
                  <div style={styles.jobInfo}>
                    <div style={styles.jobTitle}>{job.jobTitle}</div>
                    <div style={styles.companyName}>{job.companyName}</div>
                    <div style={styles.location}>{job.location}</div>
                  </div>
                </div>
                <div style={styles.jobTags}>
                  <span style={{ ...styles.tag, ...styles.tagGreen }}>
                    {job.experience}
                  </span>
                  <span style={{ ...styles.tag, ...styles.tagLightGreen }}>
                    {job.jobType}
                  </span>
                </div>
                <div style={styles.jobMetrics}>
                  <div style={styles.metric}>
                    <span>Accepted: {job.accepted}</span>
                  </div>
                  <div style={styles.metric}>
                    <span>Declined: {job.declined}</span>
                  </div>
                  <div style={styles.metric}>
                    <span>Matching: {job.matching}</span>
                  </div>
                </div>
                <div style={styles.postedTime}>Posted {job.postedTime}</div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* Matching Applicants Card */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryTitle}>Matching applicants</div>
            <div style={styles.summaryNumber}>97</div>
            <div style={styles.summarySubtitle}>
              Across 42 jobs (avg. 2.3/job)
            </div>
          </div>

          {/* Summary Metrics Card */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryMetrics}>
              <div style={styles.summaryMetric}>
                <div style={styles.summaryMetricLabel}>Active Jobs</div>
                <div style={styles.summaryMetricValue}>42</div>
                <div style={styles.summaryMetricChange}>6% last month</div>
              </div>
              <div style={styles.summaryMetric}>
                <div style={styles.summaryMetricLabel}>Candidates accepted</div>
                <div style={styles.summaryMetricValue}>367</div>
                <div style={styles.summaryMetricChange}>20% last month</div>
              </div>
            </div>
          </div>

          {/* Attention Needed Card */}
          <div style={styles.attentionCard}>
            <div style={styles.attentionTitle}>Attention Needed</div>
            <div style={styles.attentionSummary}>
              3 issues require action this week
            </div>
            <ul style={styles.attentionList}>
              <li style={styles.attentionItem}>
                <div
                  style={{
                    ...styles.attentionBullet,
                    ...styles.attentionBulletOrange,
                  }}
                />
                <span>3 candidates pending review</span>
              </li>
              <li style={styles.attentionItem}>
                <div
                  style={{
                    ...styles.attentionBullet,
                    ...styles.attentionBulletOrange,
                  }}
                />
                <span>1 job nearing deadline</span>
              </li>
              <li style={styles.attentionItem}>
                <div
                  style={{
                    ...styles.attentionBullet,
                    ...styles.attentionBulletRed,
                  }}
                />
                <span>Low match rate for 'SE Role'</span>
              </li>
            </ul>
            <button style={styles.reviewBtn}>Review all alerts +</button>
          </div>

          {/* Accepted Candidates Section */}
          <div>
            <h2 style={styles.cardTitle}>Accepted Candidates</h2>
            {acceptedCandidates.map((candidate) => (
              <div key={candidate.id} style={styles.candidateCard}>
                <div style={styles.candidatePic}>{candidate.profilePic}</div>
                <div style={styles.candidateInfo}>
                  <div style={styles.candidateName}>{candidate.name}</div>
                  <div style={styles.candidateRole}>{candidate.role}</div>
                  <div style={styles.candidateStatus}>{candidate.status}</div>
                  <div style={styles.candidateDetails}>
                    {candidate.location}
                  </div>
                  <div style={styles.candidateDetails}>
                    {candidate.experience}
                  </div>
                  <div style={styles.candidateMatching}>
                    {candidate.matching}% Matching
                  </div>
                </div>
              </div>
            ))}
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
