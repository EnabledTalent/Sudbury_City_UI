import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchJobs, fetchAllApplications, applyWithProfile } from "../services/jobService";
import { logoutUser } from "../services/authService";
import { useProfile } from "../context/ProfileContext";
import Toast from "../components/Toast";
import ChatWidget from "../components/ChatWidget";

export default function MyJobs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const [filter, setFilter] = useState("all"); // "all", "applied", "accepted", "rejected"
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatWidget, setShowChatWidget] = useState(false);

  // Fetch jobs/applications from API based on filter
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        let data = [];
        
        if (filter === "all") {
          // Fetch all available jobs
          data = await fetchJobs();
        } else {
          // Fetch applications for applied/accepted/rejected filters
          // Get email from profile context
          const email = profile?.basicInfo?.email;
          const applications = await fetchAllApplications(email);
          
          // Transform applications to match job structure and filter by status
          data = applications
            .filter((app) => {
              const status = app.status?.toUpperCase() || "";
              if (filter === "applied") {
                return status === "APPLIED" || status === "UNDER_REVIEW";
              } else if (filter === "accepted") {
                return status === "HIRED" || status === "ACCEPTED";
              } else if (filter === "rejected") {
                return status === "REJECTED";
              }
              return true;
            })
            .map((app) => {
              // Transform application object to job-like structure
              const job = app.job || {};
              return {
                id: job.id || app.id,
                role: job.role || job.jobTitle || "",
                location: job.location || "",
                salary: job.salary || 0,
                employmentType: job.employmentType || "",
                requirements: job.requirements || "",
                postedDate: job.postedDate || "",
                description: job.description || "",
                typeOfWork: job.typeOfWork || "",
                employer: job.employer || {},
                // Application-specific fields
                applicationStatus: app.status,
                applicationId: app.id,
                firstName: app.firstName,
                resumeUrl: app.resumeUrl,
                ...app, // Include all application fields
              };
            });
        }
        
        setJobs(data || []);
        // Set first job as selected if available
        if (data && data.length > 0) {
          // Check if we have a selectedJobId from navigation state (from notifications)
          const selectedJobId = location.state?.selectedJobId;
          
          if (selectedJobId) {
            // Find and select the job with matching ID
            const jobToSelect = data.find(job => job.id === selectedJobId);
            if (jobToSelect) {
              setSelectedJob(jobToSelect);
            } else {
              // If job not found, select first job
              setSelectedJob(data[0]);
            }
          } else {
            // Only update selectedJob if current selection is not in the new data
            if (!selectedJob || !data.find(job => job.id === selectedJob.id)) {
              setSelectedJob(data[0]);
            }
          }
        } else {
          setSelectedJob(null);
        }
      } catch (err) {
        console.error("Error fetching jobs/applications:", err);
        setError(err.message || "Failed to load jobs. Please try again.");
        setJobs([]);
        setSelectedJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filter is the only intended trigger; profile email/selectedJob used inside but would cause unnecessary re-fetches or loops
  }, [filter]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setApplyError("");
    setApplySuccess(false);
  };

  const handleApply = async () => {
    if (!selectedJob) {
      setToast({ message: "Please select a job to apply", type: "error" });
      return;
    }

    // Check if job has externalApplyUrl - if so, navigate to that URL
    if (selectedJob.externalApplyUrl && selectedJob.externalApplyUrl !== null && selectedJob.externalApplyUrl.trim() !== "") {
      window.open(selectedJob.externalApplyUrl, "_blank");
      return;
    }

    if (!profile || !profile.basicInfo?.email) {
      setToast({ message: "Profile data is missing. Please complete your profile first.", type: "error" });
      return;
    }

    setApplying(true);
    setApplyError("");
    setApplySuccess(false);
    setToast({ message: "", type: "error" });

    try {
      const jobId = selectedJob.id;
      await applyWithProfile(jobId, profile);
      setApplySuccess(true);
      setToast({ message: "Application submitted successfully!", type: "success" });
      // Optionally refresh jobs or show success message
      setTimeout(() => {
        setApplySuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error applying to job:", err);
      // Show error message from API response in toast
      const errorMessage = err.message || "Failed to submit application. Please try again.";
      setToast({ message: errorMessage, type: "error" });
      setApplyError(""); // Clear inline error, toast will show it
    } finally {
      setApplying(false);
    }
  };

  // Format posted date to relative time
  const formatPostedTime = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const postedDate = new Date(dateString);
      const now = new Date();
      const diffMs = now - postedDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours} hrs ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch (e) {
      return "Recently";
    }
  };

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
    aiCoachBtn: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#fff",
      border: "none",
      padding: "12px 20px",
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
      display: "flex",
      gap: "24px",
      padding: "24px 40px",
      maxWidth: "1600px",
      margin: "0 auto",
    },
    leftSidebar: {
      flex: "0 0 400px",
    },
    rightContent: {
      flex: 1,
    },
    filterButtons: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
    },
    filterButton: {
      padding: "10px 20px",
      borderRadius: "12px",
      border: "2px solid #e5e7eb",
      background: "#ffffff",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 600,
      color: "#374151",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
    },
    filterButtonActive: {
      padding: "10px 20px",
      borderRadius: "12px",
      border: "2px solid #16a34a",
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 600,
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
    },
    jobCard: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      cursor: "pointer",
      border: "2px solid transparent",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
    },
    jobCardSelected: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      cursor: "pointer",
      border: "2px solid #16a34a",
      boxShadow: "0 8px 24px rgba(22, 163, 74, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)",
      transform: "translateY(-2px)",
    },
    jobCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    postedTime: {
      fontSize: "12px",
      color: "#9ca3af",
    },
    activeTag: {
      background: "#dcfce7",
      color: "#166534",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 500,
    },
    jobCardContent: {
      display: "flex",
      gap: "16px",
      alignItems: "flex-start",
    },
    companyLogo: {
      width: "48px",
      height: "48px",
      borderRadius: "8px",
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
      flexShrink: 0,
    },
    jobCardInfo: {
      flex: 1,
    },
    jobCardTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "4px",
    },
    jobCardCompany: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "12px",
    },
    jobCardDetails: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "12px",
    },
    jobCardDetail: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#6b7280",
    },
    matchingScore: {
      background: "#16a34a",
      color: "#ffffff",
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: 600,
      display: "inline-block",
    },
    jobDetailsCard: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "32px",
      position: "relative",
      minHeight: "400px",
      paddingBottom: "80px",
    },
    jobDetailsHeader: {
      display: "flex",
      gap: "16px",
      alignItems: "flex-start",
      marginBottom: "24px",
      paddingBottom: "24px",
      borderBottom: "1px solid #e5e7eb",
    },
    applyButton: {
      position: "absolute",
      bottom: "24px",
      right: "24px",
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
      zIndex: 10,
    },
    jobDetailsLogo: {
      width: "64px",
      height: "64px",
      borderRadius: "12px",
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "28px",
      fontWeight: 600,
      color: "#111827",
      flexShrink: 0,
    },
    jobDetailsTitleSection: {
      flex: 1,
    },
    jobDetailsTitle: {
      fontSize: "24px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "4px",
    },
    jobDetailsCompany: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "8px",
    },
    jobDetailsInfo: {
      display: "flex",
      flexWrap: "wrap",
      gap: "24px",
      marginTop: "20px",
    },
    jobDetailItem: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
    jobDetailLabel: {
      fontSize: "12px",
      color: "#9ca3af",
      textTransform: "uppercase",
      fontWeight: 500,
    },
    jobDetailValue: {
      fontSize: "14px",
      color: "#111827",
      fontWeight: 500,
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
    sectionText: {
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
      lineHeight: "1.6",
      marginBottom: "12px",
      paddingLeft: "20px",
      position: "relative",
    },
    bulletPoint: {
      position: "absolute",
      left: 0,
      color: "#6b7280",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#6b7280",
    },
  };

  // Filter jobs by search query (role and company name) - client-side filtering
  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) {
      return true; // Show all jobs if search is empty
    }
    
    const searchLower = searchQuery.toLowerCase().trim();
    const role = (job.role || job.jobTitle || "").toLowerCase();
    const companyName = (job.employer?.companyName || job.company || "").toLowerCase();
    
    // Filter by role/jobTitle or company name
    return role.includes(searchLower) || companyName.includes(searchLower);
  });

  // Update selectedJob if current selection is filtered out
  useEffect(() => {
    if (selectedJob && filteredJobs.length > 0) {
      const isSelectedJobVisible = filteredJobs.some(job => job.id === selectedJob.id);
      if (!isSelectedJobVisible) {
        // Current selection is filtered out, select first available job
        setSelectedJob(filteredJobs[0]);
      }
    } else if (!selectedJob && filteredJobs.length > 0) {
      // No selection but jobs available, select first
      setSelectedJob(filteredJobs[0]);
    } else if (filteredJobs.length === 0) {
      // No jobs match search, clear selection
      setSelectedJob(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobs, searchQuery]);

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
          <span style={styles.navLinkActive}>My Jobs</span>
          <span 
            style={styles.navLink}
            onClick={() => navigate("/student/dashboard")}
          >
            Dashboard
          </span>
        </div>
        <div style={styles.searchBar}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by role or company"
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={styles.userActions}>
          <button 
            style={styles.logoutBtn}
            onClick={async () => {
              // Call logout API
              await logoutUser();
              // Clear all stored data
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("profileData");
              localStorage.removeItem("profileEditMode");
              // Navigate to login page
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
            style={styles.aiCoachBtn}
            onClick={() => setShowChatWidget(true)}
          >
            <span>Q</span>
            AI Career Coach
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Left Sidebar - Job Listings */}
        <div style={styles.leftSidebar}>
          <div style={styles.filterButtons}>
            <button
              style={filter === "all" ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              style={filter === "applied" ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setFilter("applied")}
            >
              Applied
            </button>
            <button
              style={filter === "accepted" ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setFilter("accepted")}
            >
              Accepted
            </button>
            <button
              style={filter === "rejected" ? styles.filterButtonActive : styles.filterButton}
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </button>
          </div>

          {filteredJobs.length === 0 ? (
            <div style={styles.emptyState}>No jobs found</div>
          ) : (
            filteredJobs.map((job, index) => {
              // Map API response fields
              const jobId = job.id || index;
              const company = job.employer?.companyName || "Company";
              const companyLogo = company.charAt(0).toUpperCase();
              const jobTitle = job.role || "Job Title";
              const location = job.location || "Location";
              const salary = job.salary ? `$${job.salary}` : "Salary not specified";
              const matchingScore = job.matchingScore || job.matchPercentage || 0;
              const postedDate = job.postedDate;
              const postedTime = postedDate 
                ? formatPostedTime(postedDate) 
                : "Recently";
              const status = job.status || "active";

              return (
                <div
                  key={jobId}
                  style={
                    selectedJob?.id === jobId || (selectedJob && !selectedJob.id && index === 0)
                      ? styles.jobCardSelected
                      : styles.jobCard
                  }
                  onClick={() => handleJobClick(job)}
                >
                  <div style={styles.jobCardHeader}>
                    <span style={styles.postedTime}>Posted {postedTime}</span>
                    <span style={styles.activeTag}>{status === "active" ? "Active" : status}</span>
                  </div>
                  <div style={styles.jobCardContent}>
                    <div style={styles.companyLogo}>{companyLogo}</div>
                    <div style={styles.jobCardInfo}>
                      <div style={styles.jobCardTitle}>{jobTitle}</div>
                      <div style={styles.jobCardCompany}>{company}</div>
                      <div style={styles.jobCardDetails}>
                        <div style={styles.jobCardDetail}>
                          <span>📍</span>
                          <span>{location}</span>
                        </div>
                        <div style={styles.jobCardDetail}>
                          <span>💰</span>
                          <span>{salary}</span>
                        </div>
                      </div>
                      {matchingScore > 0 && (
                        <div style={styles.matchingScore}>
                          {matchingScore}% Matching
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Content - Job Details */}
        <div style={styles.rightContent}>
          {selectedJob ? (
            <div style={styles.jobDetailsCard}>
              {/* Only show Apply button for "all" filter, not for applied/accepted/rejected */}
              {filter === "all" && (
                <button
                  style={{
                    ...styles.applyButton,
                    ...(applying ? { opacity: 0.7, cursor: "not-allowed" } : {}),
                    ...(applySuccess ? { background: "#22c55e" } : {}),
                  }}
                  onClick={handleApply}
                  disabled={applying}
                  onMouseEnter={(e) => {
                    if (!applying && !applySuccess) {
                      e.target.style.background = "#15803d";
                      e.target.style.boxShadow = "0 6px 16px rgba(22, 163, 74, 0.4)";
                      e.target.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!applying && !applySuccess) {
                      e.target.style.background = "linear-gradient(135deg, #16a34a 0%, #15803d 100%)";
                      e.target.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.3)";
                      e.target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  {applying ? "Applying..." : applySuccess ? "✓ Applied" : "Apply"}
                </button>
              )}
              <div style={styles.jobDetailsHeader}>
                <div style={styles.jobDetailsLogo}>
                  {(selectedJob.employer?.companyName || "C").charAt(0).toUpperCase()}
                </div>
                <div style={styles.jobDetailsTitleSection}>
                  <div style={styles.jobDetailsTitle}>
                    {selectedJob.role || "Job Title"}
                  </div>
                  <div style={styles.jobDetailsCompany}>
                    {selectedJob.employer?.companyName || "Company"}
                    {selectedJob.employer?.verified && (
                      <span style={{ marginLeft: "8px", fontSize: "12px", color: "#166534" }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <span style={styles.activeTag}>Active</span>
                </div>
              </div>

              <div style={styles.jobDetailsInfo}>
                <div style={styles.jobDetailItem}>
                  <div style={styles.jobDetailLabel}>Employment Type</div>
                  <div style={styles.jobDetailValue}>
                    {selectedJob.employmentType || "Full Time"}
                  </div>
                </div>
                <div style={styles.jobDetailItem}>
                  <div style={styles.jobDetailLabel}>Location</div>
                  <div style={styles.jobDetailValue}>
                    {selectedJob.location || "Not specified"}
                  </div>
                </div>
                <div style={styles.jobDetailItem}>
                  <div style={styles.jobDetailLabel}>Type of Work</div>
                  <div style={styles.jobDetailValue}>
                    {selectedJob.typeOfWork || "Not specified"}
                  </div>
                </div>
                <div style={styles.jobDetailItem}>
                  <div style={styles.jobDetailLabel}>Posted Date</div>
                  <div style={styles.jobDetailValue}>
                    {selectedJob.postedDate 
                      ? new Date(selectedJob.postedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : "Not specified"}
                  </div>
                </div>
                <div style={styles.jobDetailItem}>
                  <div style={styles.jobDetailLabel}>Salary</div>
                  <div style={styles.jobDetailValue}>
                    {selectedJob.salary ? `$${selectedJob.salary.toLocaleString()}` : "Not specified"}
                  </div>
                </div>
              </div>

              {selectedJob.description && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Description</h3>
                  <p style={styles.sectionText}>{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.requirements && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Requirements</h3>
                  <p style={styles.sectionText}>{selectedJob.requirements}</p>
                </div>
              )}

              {selectedJob.employer?.email && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Contact</h3>
                  <p style={styles.sectionText}>
                    Email: <a href={`mailto:${selectedJob.employer.email}`} style={{ color: "#16a34a" }}>
                      {selectedJob.employer.email}
                    </a>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.emptyState}>
              Select a job to view details
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={toast.type === "error" ? 5000 : 3000}
      />

      {/* Chat Widget */}
      {showChatWidget && <ChatWidget onClose={() => setShowChatWidget(false)} />}
    </div>
  );
}
