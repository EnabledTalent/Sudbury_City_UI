import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployerJobs, fetchEmployerJobStats, fetchAcceptedCandidates, fetchEmployerMetrics } from "../../services/jobService";
import { logoutUser } from "../../services/authService";
import Toast from "../../components/Toast";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("1Y");
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [acceptedCandidates, setAcceptedCandidates] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [acceptanceRateData, setAcceptanceRateData] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "error" });

  // Map time filter to windowDays
  const getWindowDays = (filter) => {
    const map = {
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "1Y": 365,
    };
    return map[filter] || 30;
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const windowDays = getWindowDays(timeFilter);
        const [jobs, stats, accepted, metrics] = await Promise.all([
          fetchEmployerJobs(),
          fetchEmployerJobStats(),
          fetchAcceptedCandidates(),
          fetchEmployerMetrics(null, windowDays),
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

        // Store all jobs and stats for metrics calculation
        setAllJobs(jobs);
        setJobStats(stats);

        // Sort by posted date (most recent first) and take first 3
        const sortedJobs = jobsWithStats
          .sort((a, b) => {
            const dateA = jobs.find((j) => j.id === a.id)?.postedDate;
            const dateB = jobs.find((j) => j.id === b.id)?.postedDate;
            return new Date(dateB || 0) - new Date(dateA || 0);
          })
          .slice(0, 3);

        setRecentJobs(sortedJobs);

        // Transform accepted candidates data from API response
        const transformedCandidates = accepted.map((candidate) => {
          const candidateName = candidate.candidateName || "Unknown";
          const yearsOfExp = candidate.candidateYearsOfExperience || 0;
          const location = candidate.jobLocation || "Location not specified";
          const role = candidate.jobRole || "Job Seeker";
          const matchPercentage = candidate.matchPercentage || 0;

          return {
            id: candidate.applicationId || candidate.id,
            name: candidateName,
            role: role,
            status: "Active",
            location: location,
            experience: yearsOfExp > 0 ? `${yearsOfExp} Yrs` : "No experience",
            matching: matchPercentage,
            profilePic: candidateName.charAt(0).toUpperCase(),
          };
        });

        setAcceptedCandidates(transformedCandidates);
        
        // Store acceptance rate metrics data
        setAcceptanceRateData(metrics);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setRecentJobs([]);
        setAcceptedCandidates([]);
        setJobStats([]);
        setAllJobs([]);
        setAcceptanceRateData(null);
        setToast({ message: `Failed to load data: ${error.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [timeFilter]);

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

  // Calculate metrics from job stats
  const calculateMetrics = () => {
    if (!jobStats || jobStats.length === 0) {
      return {
        matchingApplicants: 0,
        activeJobs: 0,
        candidatesAccepted: 0,
        avgMatchingPerJob: 0,
        hasData: false,
      };
    }

    const totalMatching = jobStats.reduce((sum, stat) => sum + (stat.matchingCandidates || 0), 0);
    const totalAccepted = jobStats.reduce((sum, stat) => sum + (stat.acceptedCandidates || 0), 0);
    const activeJobsCount = allJobs.length || jobStats.length;
    const avgMatchingPerJob = activeJobsCount > 0 ? (totalMatching / activeJobsCount).toFixed(1) : 0;

    return {
      matchingApplicants: totalMatching,
      activeJobs: activeJobsCount,
      candidatesAccepted: totalAccepted,
      avgMatchingPerJob: avgMatchingPerJob,
      hasData: true,
    };
  };

  const metrics = calculateMetrics();


  const styles = {
    page: {
      background: "#f2f7fd",
      minHeight: "100vh",
    },
    topNav: {
      background: "#ffffff",
      padding: "20px 40px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(10px)",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontWeight: 700,
      fontSize: "20px",
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      letterSpacing: "-0.02em",
    },
    logoIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #16a34a, #15803d)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "18px",
      lineHeight: "1",
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
      color: "#16a34a",
      cursor: "pointer",
      textDecoration: "none",
      paddingBottom: "4px",
      borderBottom: "2px solid #16a34a",
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
    logoutBtn: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "#ffffff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
      transition: "all 0.3s ease",
    },
    postJobBtn: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
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
      borderRadius: "16px",
      padding: "28px",
      marginBottom: "24px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
      transition: "all 0.3s ease",
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
      padding: "8px 16px",
      borderRadius: "10px",
      border: "2px solid #e5e7eb",
      background: "#ffffff",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
      color: "#6b7280",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
    },
    timeFilterBtnActive: {
      padding: "8px 16px",
      borderRadius: "10px",
      border: "2px solid #16a34a",
      background: "linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
      color: "#16a34a",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
      transition: "all 0.3s ease",
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
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      border: "2px solid transparent",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
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
      background: "#16a34a",
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
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
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
      background: "#16a34a",
    },
    attentionBulletRed: {
      background: "#ef4444",
    },
    reviewBtn: {
      background: "linear-gradient(90deg, #16a34a, #15803d)",
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
      color: "#16a34a",
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
          <span
            style={styles.userActionLink}
            onClick={() => navigate("/employer/company-profile")}
          >
            <span>👤</span>
            Profile
          </span>
          <button
            style={styles.logoutBtn}
            onClick={async () => {
              // Call logout API
              await logoutUser();
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("profileData");
              navigate("/");
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
            }}
          >
            <span>🚪</span>
            Log Out
          </button>
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
              {loading ? (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  height: "100%",
                  color: "#6b7280",
                  fontSize: "14px"
                }}>
                  Loading...
                </div>
              ) : !acceptanceRateData ? (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  height: "100%",
                  color: "#6b7280",
                  fontSize: "14px"
                }}>
                  No data
                </div>
              ) : (
                <div style={styles.graphPlaceholder}>
                  {/* Display metrics data from API */}
                  {acceptanceRateData && (
                    <div style={{ padding: "20px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
                        Acceptance Rate Metrics
                      </div>
                      {acceptanceRateData.acceptanceRate !== undefined && (
                        <div style={{ fontSize: "32px", fontWeight: 700, color: "#16a34a", marginBottom: "12px" }}>
                          {typeof acceptanceRateData.acceptanceRate === "number" 
                            ? (acceptanceRateData.acceptanceRate < 1 
                                ? (acceptanceRateData.acceptanceRate * 100).toFixed(1) 
                                : acceptanceRateData.acceptanceRate.toFixed(1))
                            : acceptanceRateData.acceptanceRate}%
                        </div>
                      )}
                      {acceptanceRateData.totalApplications !== undefined && (
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "6px" }}>
                          Total Applications: {acceptanceRateData.totalApplications}
                        </div>
                      )}
                      {acceptanceRateData.acceptedApplications !== undefined && (
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "6px" }}>
                          Accepted: {acceptanceRateData.acceptedApplications}
                        </div>
                      )}
                      {acceptanceRateData.rejectedApplications !== undefined && (
                        <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "6px" }}>
                          Rejected: {acceptanceRateData.rejectedApplications}
                        </div>
                      )}
                      {acceptanceRateData.windowDays && (
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px" }}>
                          Window: {acceptanceRateData.windowDays} days
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
            <div style={styles.summaryNumber}>{metrics.matchingApplicants}</div>
            <div style={styles.summarySubtitle}>
              {metrics.activeJobs > 0 
                ? `Across ${metrics.activeJobs} job${metrics.activeJobs !== 1 ? 's' : ''} (avg. ${metrics.avgMatchingPerJob}/job)`
                : "No jobs posted yet"}
            </div>
          </div>

          {/* Summary Metrics Card */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryMetrics}>
              <div style={styles.summaryMetric}>
                <div style={styles.summaryMetricLabel}>Active Jobs</div>
                <div style={styles.summaryMetricValue}>{metrics.activeJobs}</div>
                <div style={styles.summaryMetricChange}>
                  {metrics.hasData ? "—" : "No data"}
                </div>
              </div>
              <div style={styles.summaryMetric}>
                <div style={styles.summaryMetricLabel}>Candidates accepted</div>
                <div style={styles.summaryMetricValue}>{metrics.candidatesAccepted}</div>
                <div style={styles.summaryMetricChange}>
                  {metrics.hasData ? "—" : "No data"}
                </div>
              </div>
            </div>
          </div>

          {/* Accepted Candidates Section */}
          <div>
            <h2 style={styles.cardTitle}>Accepted Candidates</h2>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                Loading accepted candidates...
              </div>
            ) : acceptedCandidates.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                No accepted candidates yet.
              </div>
            ) : (
              acceptedCandidates.map((candidate) => (
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
              ))
            )}
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
