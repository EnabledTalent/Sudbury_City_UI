import { useState, useEffect } from "react";
import { fetchEmployerJobs, fetchEmployerJobStats, fetchAcceptedCandidates, fetchEmployerMetrics } from "../../services/jobService";
import EmployerHeader from "../../components/employer/EmployerHeader";
import Toast from "../../components/Toast";
import TourOverlay from "../../components/TourOverlay";

export default function EmployerDashboard() {
  const [timeFilter, setTimeFilter] = useState("1Y");
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [acceptedCandidates, setAcceptedCandidates] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [acceptanceRateData, setAcceptanceRateData] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [showTour, setShowTour] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const isTablet = viewportWidth <= 1080;
  const isMobile = viewportWidth <= 768;
  const isSmallMobile = viewportWidth <= 520;

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
            companyLogo: job.companyName ? job.companyName.charAt(0).toUpperCase() : "NA",
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

  useEffect(() => {
    const firstTimeLogin = localStorage.getItem("firstTimeLogin") === "true";
    const pending = localStorage.getItem("tour:employer:mainNav:pending") === "true";
    const status = localStorage.getItem("tour:employer:mainNav:v1");
    if ((firstTimeLogin || pending) && !status) {
      setShowTour(true);
      localStorage.removeItem("tour:employer:mainNav:pending");
    }
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
      background: "#f5f3ef",
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
      background: "linear-gradient(135deg, #c8a45c 0%, #b8943f 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      letterSpacing: "-0.02em",
    },
    logoIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #c8a45c, #b8943f)",
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
      color: "#c8a45c",
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
      background: "linear-gradient(135deg, #c8a45c 0%, #b8943f 100%)",
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
    launchTourBtn: {
      background: "#ffffff",
      color: "#14532d",
      border: "2px solid #16a34a",
      padding: "10px 16px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: isMobile ? "16px" : isTablet ? "24px 20px" : "32px 40px",
      display: "flex",
      gap: "24px",
      flexDirection: isTablet ? "column" : "row",
    },
    leftColumn: {
      flex: isTablet ? "1 1 auto" : "0 0 65%",
    },
    rightColumn: {
      flex: isTablet ? "1 1 auto" : "0 0 35%",
    },
    card: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: isMobile ? "20px" : "28px",
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
      flexWrap: "wrap",
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
      color: "#c8a45c",
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
      padding: isMobile ? "16px" : "24px",
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
      background: "#c8a45c",
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
      flexWrap: isSmallMobile ? "wrap" : "nowrap",
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
      padding: isMobile ? "16px" : "24px",
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
      flexDirection: isSmallMobile ? "column" : "row",
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
      background: "#c8a45c",
    },
    attentionBulletRed: {
      background: "#ef4444",
    },
    reviewBtn: {
      background: "linear-gradient(90deg, #c8a45c, #b8943f)",
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
      flexDirection: isSmallMobile ? "column" : "row",
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
      color: "#c8a45c",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      <EmployerHeader activePage="dashboard" />

      {/* Main Content */}
      <main style={styles.container} aria-label="Employer dashboard">
        <h1
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Employer Dashboard
        </h1>

        {/* Left Column */}
        <section style={styles.leftColumn} aria-label="Performance and recent jobs">
          {/* Candidate Acceptance Rate Card */}
          <section style={styles.card} aria-labelledby="acceptance-rate-heading">
            <h2 id="acceptance-rate-heading" style={styles.cardTitle}>Candidate Acceptance Rate</h2>
            <div style={styles.timeFilters} role="group" aria-label="Acceptance rate time filter">
              {["1W", "1M", "3M", "1Y"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  style={
                    timeFilter === filter
                      ? styles.timeFilterBtnActive
                      : styles.timeFilterBtn
                  }
                  onClick={() => setTimeFilter(filter)}
                  aria-pressed={timeFilter === filter}
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
                }} role="status">
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
                }} role="status">
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
                        <div style={{ fontSize: "32px", fontWeight: 700, color: "#c8a45c", marginBottom: "12px" }}>
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
                <span>Good: &gt;= 80%</span>
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
          </section>

          {/* Recent Jobs Section */}
          <section aria-labelledby="recent-jobs-heading">
            <h2 id="recent-jobs-heading" style={styles.cardTitle}>Recent Jobs</h2>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }} role="status">
                Loading jobs...
              </div>
            ) : recentJobs.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }} role="status">
                No jobs posted yet
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {recentJobs.map((job) => (
                <li key={job.id}>
                  <article style={styles.jobCard} aria-label={`${job.jobTitle} at ${job.companyName}`}>
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
                  </article>
                </li>
                ))}
              </ul>
            )}
          </section>
        </section>

        {/* Right Column */}
        <aside style={styles.rightColumn} aria-label="Summary and accepted candidates">
          {/* Matching Applicants Card */}
          <section style={styles.summaryCard} aria-labelledby="matching-applicants-heading">
            <h2 id="matching-applicants-heading" style={styles.summaryTitle}>Matching applicants</h2>
            <div style={styles.summaryNumber}>{metrics.matchingApplicants}</div>
            <div style={styles.summarySubtitle}>
              {metrics.activeJobs > 0 
                ? `Across ${metrics.activeJobs} job${metrics.activeJobs !== 1 ? 's' : ''} (avg. ${metrics.avgMatchingPerJob}/job)`
                : "No jobs posted yet"}
            </div>
          </section>

          {/* Summary Metrics Card */}
          <section style={styles.summaryCard} aria-label="Key metrics">
            <div style={styles.summaryMetrics}>
              <div style={styles.summaryMetric}>
                <div style={styles.summaryMetricLabel}>Active Jobs</div>
                <div style={styles.summaryMetricValue}>{metrics.activeJobs}</div>
                <div style={styles.summaryMetricChange}>
                  {metrics.hasData ? "--" : "No data"}
                </div>
              </div>
              <div style={styles.summaryMetric}>
                <div style={styles.summaryMetricLabel}>Candidates accepted</div>
                <div style={styles.summaryMetricValue}>{metrics.candidatesAccepted}</div>
                <div style={styles.summaryMetricChange}>
                  {metrics.hasData ? "--" : "No data"}
                </div>
              </div>
            </div>
          </section>

          {/* Accepted Candidates Section */}
          <section aria-labelledby="accepted-candidates-heading">
            <h2 id="accepted-candidates-heading" style={styles.cardTitle}>Accepted Candidates</h2>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }} role="status">
                Loading accepted candidates...
              </div>
            ) : acceptedCandidates.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }} role="status">
                No accepted candidates yet.
              </div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {acceptedCandidates.map((candidate) => (
                  <li key={candidate.id}>
                    <article style={styles.candidateCard} aria-label={`${candidate.name}, ${candidate.role}`}>
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
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </main>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />

      <TourOverlay
        open={showTour}
        steps={[
          {
            title: "Dashboard",
            body: "Your high-level metrics and activity overview.",
            target: '[data-tour="employer-nav-dashboard"]',
          },
          {
            title: "Candidates",
            body: "Review candidates and manage your pipeline.",
            target: '[data-tour="employer-nav-candidates"]',
          },
          {
            title: "Listed Jobs",
            body: "See and manage all jobs you've posted.",
            target: '[data-tour="employer-nav-listedjobs"]',
          },
          {
            title: "Company Profile",
            body: "Update your organization details anytime.",
            target: '[data-tour="employer-nav-companyprofile"]',
          },
          {
            title: "Post a Job",
            body: "Create a new job posting and start receiving candidates.",
            target: '[data-tour="employer-postjob"]',
          },
        ]}
        storageKey="tour:employer:mainNav:v1"
        onClose={() => setShowTour(false)}
      />
    </div>
  );
}


