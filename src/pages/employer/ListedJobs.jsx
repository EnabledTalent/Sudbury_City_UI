import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployerJobs, fetchEmployerJobStats } from "../../services/jobService";
import Toast from "../../components/Toast";

export default function ListedJobs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, closed
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "error" });

  // Helper function - must be defined before use
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

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const [jobsData, stats] = await Promise.all([
          fetchEmployerJobs(),
          fetchEmployerJobStats(),
        ]);

        // Combine jobs with stats
        const jobsWithStats = jobsData.map((job) => {
          const jobStats = stats.find((stat) => stat.jobId === job.id);
          
          // Parse description and requirements from strings
          const description = job.description
            ? job.description.split(/\n|•/).filter((line) => line.trim())
            : [];
          const requirements = job.requirements
            ? job.requirements.split(/\n|•/).filter((line) => line.trim())
            : [];

          return {
            id: job.id,
            companyLogo: job.companyName ? job.companyName.charAt(0).toUpperCase() : "∞",
            jobTitle: job.role || "",
            companyName: job.companyName || "",
            location: job.location || job.address || "",
            experience: job.experienceRange ? `Exp: ${job.experienceRange}` : "Exp: N/A",
            jobType: job.employmentType || "Full Time",
            accepted: jobStats?.acceptedCandidates || 0,
            declined: jobStats?.declinedCandidates || 0,
            matching: jobStats?.matchingCandidates || 0,
            postedTime: job.postedDate
              ? getTimeAgo(new Date(job.postedDate))
              : "Recently",
            status: "Active", // You can determine this based on your business logic
            jobTypeDetail: job.employmentType || "Full Time",
            locationDetail: job.location || "",
            workArrangement: job.typeOfWork || "Hybrid",
            yearsOfExperience: job.experienceRange || "N/A",
            salary: job.salaryMin && job.salaryMax
              ? `$${job.salaryMin} - ${job.salaryMax}`
              : job.salary
              ? `$${job.salary}`
              : "Not specified",
            about: job.description || "No description available.",
            description: description,
            requirements: requirements,
            acceptedCandidates: jobStats?.acceptedCandidates || 0,
            declinedCandidates: jobStats?.declinedCandidates || 0,
            requestsSent: jobStats?.requestsSent || 0,
            matchingCandidates: jobStats?.matchingCandidates || 0,
          };
        });

        setJobs(jobsWithStats);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setJobs([]);
        setToast({ message: `Failed to load jobs: ${error.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Filter jobs based on search query - must be defined before useEffect that uses it
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && job.status === "Active") ||
      (filterStatus === "closed" && job.status === "Closed");

    return matchesSearch && matchesFilter;
  });

  // Set first job as selected when jobs are loaded or filtered
  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJob) {
      setSelectedJob(filteredJobs[0]);
    } else if (filteredJobs.length > 0 && !filteredJobs.find((j) => j.id === selectedJob?.id)) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

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
      maxWidth: "1600px",
      margin: "0 auto",
      padding: "32px 40px",
      display: "flex",
      gap: "24px",
    },
    leftPanel: {
      flex: "0 0 45%",
      maxHeight: "calc(100vh - 120px)",
      overflowY: "auto",
    },
    searchSection: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    searchBar: {
      display: "flex",
      alignItems: "center",
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "10px 16px",
      gap: "10px",
      marginBottom: "12px",
    },
    searchInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: "14px",
      flex: 1,
      color: "#374151",
    },
    filtersBtn: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      padding: "8px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      color: "#374151",
      fontWeight: 500,
    },
    jobCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: selectedJob ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    jobCardSelected: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      border: "2px solid #3b82f6",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: "0 4px 6px rgba(59, 130, 246, 0.1)",
    },
    jobCardHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      marginBottom: "12px",
    },
    postedTime: {
      fontSize: "12px",
      color: "#9ca3af",
      marginBottom: "8px",
    },
    statusBadge: {
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: 500,
      marginBottom: "8px",
    },
    statusActive: {
      background: "#d1fae5",
      color: "#065f46",
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
      flexShrink: 0,
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
      marginBottom: "8px",
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
    rightPanel: {
      flex: "0 0 55%",
      maxHeight: "calc(100vh - 120px)",
      overflowY: "auto",
    },
    jobDetailCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "32px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    jobHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      marginBottom: "24px",
      paddingBottom: "24px",
      borderBottom: "1px solid #e5e7eb",
    },
    jobHeaderInfo: {
      flex: 1,
    },
    jobDetailTitle: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "8px",
    },
    jobDetailCompany: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    editIcon: {
      fontSize: "20px",
      color: "#6b7280",
      cursor: "pointer",
    },
    metricsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },
    metricBox: {
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "16px",
    },
    metricBoxHighlight: {
      background: "#fef3c7",
      borderRadius: "8px",
      padding: "16px",
    },
    metricValue: {
      fontSize: "20px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "4px",
    },
    metricLabel: {
      fontSize: "12px",
      color: "#6b7280",
    },
    viewCandidatesBtn: {
      background: "linear-gradient(90deg, #fb923c, #f97316)",
      color: "#ffffff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      width: "100%",
      marginBottom: "32px",
    },
    section: {
      marginBottom: "32px",
    },
    sectionTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "16px",
    },
    jobOverview: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
      marginBottom: "24px",
    },
    overviewItem: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    overviewLabel: {
      fontSize: "12px",
      color: "#6b7280",
    },
    overviewValue: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#111827",
    },
    textContent: {
      fontSize: "14px",
      color: "#374151",
      lineHeight: "1.6",
      marginBottom: "16px",
    },
    bulletList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    bulletItem: {
      fontSize: "14px",
      color: "#374151",
      lineHeight: "1.8",
      marginBottom: "8px",
      paddingLeft: "20px",
      position: "relative",
    },
    bulletPoint: {
      position: "absolute",
      left: "0",
      top: "8px",
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#fb923c",
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
          <span
            style={styles.navLink}
            onClick={() => navigate("/employer/dashboard")}
          >
            Dashboard
          </span>
          <span
            style={styles.navLink}
            onClick={() => navigate("/employer/candidates")}
          >
            Candidates
          </span>
          <span style={styles.navLinkActive}>Listed Jobs</span>
          <span
            style={styles.navLink}
            onClick={() => navigate("/employer/company-profile")}
          >
            Company Profile
          </span>
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
        {/* Left Panel - Job Listings */}
        <div style={styles.leftPanel}>
          <div style={styles.searchSection}>
            <div style={styles.searchBar}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search your listed jobs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <button style={styles.filtersBtn}>Filters</button>
          </div>

          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
              No jobs found
            </div>
          ) : (
            filteredJobs.map((job) => (
            <div
              key={job.id}
              style={
                selectedJob?.id === job.id
                  ? styles.jobCardSelected
                  : styles.jobCard
              }
              onClick={() => setSelectedJob(job)}
            >
              <div style={styles.postedTime}>Posted {job.postedTime}</div>
              <div style={styles.jobCardHeader}>
                <div style={styles.companyLogo}>{job.companyLogo}</div>
                <div style={styles.jobInfo}>
                  <div
                    style={{
                      ...styles.statusBadge,
                      ...styles.statusActive,
                    }}
                  >
                    {job.status}
                  </div>
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
            </div>
            ))
          )}
        </div>

        {/* Right Panel - Job Details */}
        {selectedJob && (
          <div style={styles.rightPanel}>
            <div style={styles.jobDetailCard}>
              <div style={styles.jobHeader}>
                <div style={styles.companyLogo}>{selectedJob.companyLogo}</div>
                <div style={styles.jobHeaderInfo}>
                  <div style={styles.jobDetailTitle}>
                    {selectedJob.jobTitle}
                  </div>
                  <div style={styles.jobDetailCompany}>
                    {selectedJob.companyName}
                  </div>
                </div>
                <span style={styles.editIcon}>✏️</span>
              </div>

              {/* Candidate Metrics */}
              <div style={styles.metricsGrid}>
                <div style={styles.metricBoxHighlight}>
                  <div style={styles.metricValue}>
                    {selectedJob.acceptedCandidates}
                  </div>
                  <div style={styles.metricLabel}>Accepted candidates</div>
                </div>
                <div style={styles.metricBox}>
                  <div style={styles.metricValue}>
                    {selectedJob.declinedCandidates}
                  </div>
                  <div style={styles.metricLabel}>Declined candidates</div>
                </div>
                <div style={styles.metricBox}>
                  <div style={styles.metricValue}>
                    {selectedJob.requestsSent}
                  </div>
                  <div style={styles.metricLabel}>Requests sent</div>
                </div>
                <div style={styles.metricBox}>
                  <div style={styles.metricValue}>
                    {selectedJob.matchingCandidates}
                  </div>
                  <div style={styles.metricLabel}>Matching candidates</div>
                </div>
              </div>

              <button style={styles.viewCandidatesBtn}>
                View Candidates →
              </button>

              {/* Job Overview */}
              <div style={styles.section}>
                <div style={styles.jobOverview}>
                  <div style={styles.overviewItem}>
                    <div style={styles.overviewLabel}>Job Type:</div>
                    <div style={styles.overviewValue}>
                      {selectedJob.jobTypeDetail}
                    </div>
                  </div>
                  <div style={styles.overviewItem}>
                    <div style={styles.overviewLabel}>Location:</div>
                    <div style={styles.overviewValue}>
                      {selectedJob.locationDetail}
                    </div>
                  </div>
                  <div style={styles.overviewItem}>
                    <div style={styles.overviewLabel}>Job Type:</div>
                    <div style={styles.overviewValue}>
                      {selectedJob.workArrangement}
                    </div>
                  </div>
                  <div style={styles.overviewItem}>
                    <div style={styles.overviewLabel}>Years of Experience:</div>
                    <div style={styles.overviewValue}>
                      {selectedJob.yearsOfExperience}
                    </div>
                  </div>
                  <div style={styles.overviewItem}>
                    <div style={styles.overviewLabel}>Salary:</div>
                    <div style={styles.overviewValue}>
                      {selectedJob.salary}
                    </div>
                  </div>
                </div>
              </div>

              {/* About the job */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>About the job</h3>
                <p style={styles.textContent}>{selectedJob.about}</p>
              </div>

              {/* Description */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Description</h3>
                <ul style={styles.bulletList}>
                  {Array.isArray(selectedJob.description)
                    ? selectedJob.description.map((item, index) => (
                        <li key={index} style={styles.bulletItem}>
                          <div style={styles.bulletPoint}></div>
                          {item}
                        </li>
                      ))
                    : (
                        <li style={styles.bulletItem}>
                          <div style={styles.bulletPoint}></div>
                          {selectedJob.description || "No description available."}
                        </li>
                      )}
                </ul>
              </div>

              {/* Requirement */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Requirement</h3>
                <ul style={styles.bulletList}>
                  {Array.isArray(selectedJob.requirements)
                    ? selectedJob.requirements.map((item, index) => (
                        <li key={index} style={styles.bulletItem}>
                          <div style={styles.bulletPoint}></div>
                          {item}
                        </li>
                      ))
                    : (
                        <li style={styles.bulletItem}>
                          <div style={styles.bulletPoint}></div>
                          {selectedJob.requirements || "No requirements specified."}
                        </li>
                      )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
