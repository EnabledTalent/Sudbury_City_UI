import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployerJobs, fetchEmployerJobStats, fetchJobApplications, updateApplicationStatus, sendInterviewInvitation, sendJobOffer, rejectApplication, updateJob, deleteJob } from "../../services/jobService";
import { logoutUser } from "../../services/authService";
import Toast from "../../components/Toast";
import { fetchProfile } from "../../services/profileService";

export default function ListedJobs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterStatus] = useState("all"); // all, active, closed
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [originalJobs, setOriginalJobs] = useState([]); // Store original job data from API
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [jobCandidates, setJobCandidates] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusDraftById, setStatusDraftById] = useState({});
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState(null);
  const [loadingCandidateProfile, setLoadingCandidateProfile] = useState(false);
  const [candidateProfileError, setCandidateProfileError] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobLocation: "",
    address: "",
    yearsOfExperience: "",
    jobType: "",
    contractType: "",
    preferredLanguage: "",
    urgentlyHiring: "",
    jobDescription: "",
    jobRequirement: "",
    estimatedSalary: "",
    url: "",
  });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
            applied: jobStats?.appliedCandidates || 0,
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
            appliedCandidates: jobStats?.appliedCandidates || 0,
          };
        });

        setJobs(jobsWithStats);
        setOriginalJobs(jobsData); // Store original job data
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

  useEffect(() => {
    if (!showCandidatesModal) return;
    if (!jobCandidates || jobCandidates.length === 0) {
      setSelectedApplication(null);
      setSelectedCandidateProfile(null);
      setCandidateProfileError("");
      return;
    }
    // Default to first application if none selected
    if (!selectedApplication) {
      setSelectedApplication(jobCandidates[0]);
      return;
    }
    const selectedId = selectedApplication.id;
    if (selectedId && !jobCandidates.some((a) => a?.id === selectedId)) {
      setSelectedApplication(jobCandidates[0]);
    }
  }, [jobCandidates, selectedApplication, showCandidatesModal]);

  useEffect(() => {
    if (!showCandidatesModal || !selectedApplication) return;

    const candidate = selectedApplication.jobSeekerProfile || selectedApplication;
    const email = candidate.email || selectedApplication.email || "";
    if (!email) {
      setSelectedCandidateProfile(null);
      setCandidateProfileError("Email not available for this candidate.");
      return;
    }

    let cancelled = false;
    setLoadingCandidateProfile(true);
    setCandidateProfileError("");
    setSelectedCandidateProfile(null);

    fetchProfile(email)
      .then((data) => {
        if (!cancelled) setSelectedCandidateProfile(data || {});
      })
      .catch((err) => {
        if (!cancelled) setCandidateProfileError(err.message || "Failed to load candidate profile");
      })
      .finally(() => {
        if (!cancelled) setLoadingCandidateProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showCandidatesModal, selectedApplication]);

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

  // Function to open edit modal with job data
  const handleEditClick = (job) => {
    // Find the original job data from the API response to get all fields
    const originalJob = originalJobs.find(j => j.id === job.id);
    if (!originalJob) return;

    // Map the original job data to form format
    setEditFormData({
      jobTitle: originalJob.role || job.jobTitle || "",
      companyName: originalJob.companyName || job.companyName || "",
      jobLocation: originalJob.jobLocation || originalJob.location || job.locationDetail || job.location || "",
      address: originalJob.address || originalJob.location || job.locationDetail || job.location || "",
      yearsOfExperience: originalJob.experienceRange || job.yearsOfExperience || "",
      jobType: originalJob.employmentType || job.jobTypeDetail || "",
      contractType: originalJob.typeOfWork || job.workArrangement || "",
      preferredLanguage: originalJob.preferredLanguage || "English",
      urgentlyHiring: originalJob.urgentlyHiring ? "Yes" : "No",
      jobDescription: originalJob.description || originalJob.jobDescription || (Array.isArray(job.description) ? job.description.join("\n") : (job.about || "")),
      jobRequirement: originalJob.requirements || (Array.isArray(job.requirements) ? job.requirements.join("\n") : ""),
      estimatedSalary: originalJob.salaryMin && originalJob.salaryMax
        ? `${originalJob.salaryMin} - ${originalJob.salaryMax}`
        : originalJob.salary
        ? String(originalJob.salary).replace("$", "")
        : (job.salary && job.salary !== "Not specified" ? job.salary.replace("$", "") : ""),
      url: originalJob.externalApplyUrl || "",
    });
    setShowEditModal(true);
  };

  // Function to handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob?.id) return;

    try {
      setUpdating(true);
      await updateJob(selectedJob.id, editFormData);
      setToast({ message: "Job updated successfully!", type: "success" });
      setShowEditModal(false);
      
      // Reload jobs
      const [jobsData, stats] = await Promise.all([
        fetchEmployerJobs(),
        fetchEmployerJobStats(),
      ]);

      const jobsWithStats = jobsData.map((job) => {
        const jobStats = stats.find((stat) => stat.jobId === job.id);
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
          applied: jobStats?.appliedCandidates || 0,
          postedTime: job.postedDate
            ? getTimeAgo(new Date(job.postedDate))
            : "Recently",
          status: "Active",
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
          appliedCandidates: jobStats?.appliedCandidates || 0,
        };
      });

      setJobs(jobsWithStats);
      setOriginalJobs(jobsData); // Update original jobs data
      const updatedJob = jobsWithStats.find(j => j.id === selectedJob.id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
    } catch (error) {
      setToast({ message: `Failed to update job: ${error.message}`, type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  // Function to handle delete
  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setShowDeleteConfirm(true);
  };

  // Function to confirm delete
  const handleConfirmDelete = async () => {
    if (!jobToDelete?.id) return;

    try {
      setDeleting(true);
      await deleteJob(jobToDelete.id);
      setToast({ message: "Job deleted successfully!", type: "success" });
      setShowDeleteConfirm(false);
      setJobToDelete(null);
      
      // Reload jobs
      const [jobsData, stats] = await Promise.all([
        fetchEmployerJobs(),
        fetchEmployerJobStats(),
      ]);

      const jobsWithStats = jobsData.map((job) => {
        const jobStats = stats.find((stat) => stat.jobId === job.id);
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
          applied: jobStats?.appliedCandidates || 0,
          postedTime: job.postedDate
            ? getTimeAgo(new Date(job.postedDate))
            : "Recently",
          status: "Active",
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
          appliedCandidates: jobStats?.appliedCandidates || 0,
        };
      });

      setJobs(jobsWithStats);
      setOriginalJobs(jobsData); // Update original jobs data
      if (jobsWithStats.length > 0) {
        setSelectedJob(jobsWithStats[0]);
      } else {
        setSelectedJob(null);
      }
    } catch (error) {
      setToast({ message: `Failed to delete job: ${error.message}`, type: "error" });
    } finally {
      setDeleting(false);
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
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
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
    jobCardSelected: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      border: "2px solid #16a34a",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 24px rgba(22, 163, 74, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)",
      transform: "translateY(-2px)",
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
      background: "#16a34a",
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
      borderRadius: "20px",
      padding: "40px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
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
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "14px 28px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 600,
      width: "100%",
      marginBottom: "32px",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
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
      background: "#16a34a",
    },
    // Modal styles
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modalContent: {
      background: "#ffffff",
      borderRadius: "20px",
      width: "100%",
      maxWidth: "800px",
      maxHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(0, 0, 0, 0.06)",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "24px",
      borderBottom: "1px solid #e5e7eb",
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
      margin: 0,
    },
    modalCloseBtn: {
      background: "transparent",
      border: "none",
      fontSize: "28px",
      color: "#6b7280",
      cursor: "pointer",
      padding: "0",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "4px",
      transition: "background 0.2s",
    },
    modalBody: {
      padding: "24px",
      overflowY: "auto",
      flex: 1,
    },
    candidatesSplit: {
      display: "flex",
      gap: "16px",
      height: "100%",
      minHeight: "520px",
    },
    candidatesPane: {
      width: "420px",
      minWidth: "420px",
      overflowY: "auto",
      paddingRight: "4px",
    },
    candidatesList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    candidateCardModal: {
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      padding: "16px",
      background: "#ffffff",
      borderRadius: "16px",
      border: "1px solid #e5e7eb",
      transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      cursor: "pointer",
    },
    candidateCardModalSelected: {
      border: "1px solid rgba(22, 163, 74, 0.55)",
      background: "#f0fdf4",
      boxShadow: "0 10px 24px rgba(22, 163, 74, 0.14), 0 6px 14px rgba(0, 0, 0, 0.06)",
    },
    candidatePicModal: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #16a34a, #15803d)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: 800,
      flexShrink: 0,
    },
    candidateInfoModal: {
      flex: 1,
      minWidth: 0,
    },
    candidateNameModal: {
      fontSize: "16px",
      fontWeight: 800,
      color: "#111827",
      marginBottom: "2px",
    },
    candidateRoleModal: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "6px",
    },
    candidateDetailsModal: {
      fontSize: "12px",
      color: "#9ca3af",
      marginBottom: "10px",
      lineHeight: 1.4,
    },
    applicationStatusRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "10px",
      marginTop: "8px",
    },
    statusLeft: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap",
    },
    applicationStatus: {
      fontSize: "12px",
      color: "#6b7280",
    },
    matchBadgeModal: {
      background: "#fffbeb",
      color: "#92400e",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
      border: "1px solid rgba(146, 64, 14, 0.2)",
    },
    candidateDetailsPane: {
      flex: 1,
      overflowY: "auto",
      border: "1px solid rgba(0, 0, 0, 0.06)",
      borderRadius: "16px",
      padding: "20px",
      background: "#ffffff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    },
    detailsHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "14px",
      paddingBottom: "16px",
      borderBottom: "1px solid #e5e7eb",
      marginBottom: "16px",
    },
    detailsAvatar: {
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #16a34a, #15803d)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      fontSize: "22px",
      fontWeight: 800,
      flexShrink: 0,
    },
    detailsName: {
      fontSize: "18px",
      fontWeight: 800,
      color: "#111827",
      marginBottom: "4px",
    },
    detailsMeta: {
      fontSize: "12px",
      color: "#6b7280",
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      alignItems: "center",
    },
    detailsSection: {
      marginTop: "14px",
    },
    detailsSectionTitle: {
      fontSize: "13px",
      fontWeight: 800,
      color: "#111827",
      marginBottom: "10px",
    },
    detailsRow: {
      fontSize: "13px",
      color: "#374151",
      marginBottom: "8px",
      wordBreak: "break-word",
    },
    skillsWrap: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },
    skillChip: {
      background: "#eff6ff",
      color: "#1e40af",
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
    },
    statusBadgeModal: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "4px",
      background: "#d1fae5",
      color: "#065f46",
      fontWeight: 500,
      marginLeft: "4px",
    },
    statusActions: {
      display: "flex",
      gap: "8px",
    },
    statusSelect: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: "1px solid #e5e7eb",
      fontSize: "12px",
      color: "#111827",
      background: "#ffffff",
      cursor: "pointer",
      fontWeight: 500,
      minWidth: "140px",
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={styles.postedTime}>Posted {job.postedTime}</div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: "18px",
                      color: "#6b7280",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      transition: "all 0.2s",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(job);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f3f4f6";
                      e.target.style.color = "#16a34a";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#6b7280";
                    }}
                    title="Edit Job"
                  >
                    ✏️
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      transition: "all 0.2s",
                      fontWeight: 600,
                      lineHeight: "1",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(job);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fee2e2";
                      e.target.style.color = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#ef4444";
                    }}
                    title="Delete Job"
                  >
                    ×
                  </span>
                </div>
              </div>
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
                  <span>Applied: {job.applied}</span>
                </div>
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
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span 
                    style={{...styles.editIcon, cursor: "pointer"}}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(selectedJob);
                    }}
                    title="Edit Job"
                  >
                    ✏️
                  </span>
                  <span 
                    style={{
                      fontSize: "24px",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      transition: "all 0.2s",
                      fontWeight: 600,
                      lineHeight: "1",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(selectedJob);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fee2e2";
                      e.target.style.color = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent";
                      e.target.style.color = "#ef4444";
                    }}
                    title="Delete Job"
                  >
                    ×
                  </span>
                </div>
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
                    {selectedJob.appliedCandidates}
                  </div>
                  <div style={styles.metricLabel}>Applied candidates</div>
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

              <button 
                style={styles.viewCandidatesBtn}
                onClick={async () => {
                  if (!selectedJob?.id) return;
                  try {
                    setLoadingCandidates(true);
                    setShowCandidatesModal(true);
                    const applications = await fetchJobApplications(selectedJob.id);
                    setJobCandidates(applications);
                    setSelectedApplication(applications?.[0] || null);
                    setStatusDraftById({});
                  } catch (error) {
                    console.error("Error fetching job applications:", error);
                    setToast({ message: `Failed to load candidates: ${error.message}`, type: "error" });
                    setShowCandidatesModal(false);
                  } finally {
                    setLoadingCandidates(false);
                  }
                }}
              >
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

      {/* Candidates Modal */}
      {showCandidatesModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCandidatesModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Candidates for {selectedJob?.jobTitle}
              </h2>
              <button
                style={styles.modalCloseBtn}
                onClick={() => setShowCandidatesModal(false)}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              {loadingCandidates ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                  Loading candidates...
                </div>
              ) : jobCandidates.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                  No candidates have applied for this job yet.
                </div>
              ) : (
                <div style={styles.candidatesSplit}>
                  <div style={styles.candidatesPane}>
                    <div style={styles.candidatesList}>
                      {jobCandidates.map((application, index) => {
                    const candidate = application.jobSeekerProfile || application;
                    const fullName = candidate.fullName || candidate.name || application.firstName || "Unknown";
                    const email = candidate.email || application.email || "";
                    const location = candidate.city || candidate.location || "Location not specified";
                    const matchPctRaw =
                      application.matchPercentage ??
                      candidate.matchPercentage ??
                      application.matchingScore ??
                      candidate.matchingScore;
                    const matchPct =
                      matchPctRaw === null || matchPctRaw === undefined || matchPctRaw === ""
                        ? null
                        : Number(matchPctRaw);
                    const matchPctDisplay = Number.isFinite(matchPct) ? Math.round(matchPct) : null;
                    
                    // Calculate years of experience
                    let yearsOfExp = candidate.yearsOfExperience || 0;
                    if (!yearsOfExp && candidate.workExperience && candidate.workExperience.length > 0) {
                      const experiences = candidate.workExperience.map((exp) => {
                        const startYear = exp.startDate ? parseInt(exp.startDate.toString().substring(0, 4)) : new Date().getFullYear();
                        const endYear = exp.endDate 
                          ? parseInt(exp.endDate.toString().substring(0, 4))
                          : exp.currentlyWorking 
                            ? new Date().getFullYear()
                            : new Date().getFullYear();
                        return endYear - startYear;
                      });
                      yearsOfExp = Math.max(...experiences, 0);
                    }

                    // Get role/title
                    const role = candidate.workExperience?.[0]?.jobTitle || "Job Seeker";
                    const isSelected = selectedApplication?.id
                      ? selectedApplication.id === application.id
                      : selectedApplication === application;

                    return (
                      <div
                        key={application.id || index}
                        style={{
                          ...styles.candidateCardModal,
                          ...(isSelected ? styles.candidateCardModalSelected : {}),
                        }}
                        onClick={() => setSelectedApplication(application)}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.borderColor = "#d1d5db";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.boxShadow = styles.candidateCardModal.boxShadow;
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = styles.candidateCardModal.border;
                          }
                        }}
                      >
                        <div style={styles.candidatePicModal}>
                          {fullName.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.candidateInfoModal}>
                          <div style={styles.candidateNameModal}>{fullName}</div>
                          <div style={styles.candidateRoleModal}>{role}</div>
                          <div style={styles.candidateDetailsModal}>
                            <span>📍 {location}</span>
                            {yearsOfExp > 0 && <span> • 💼 {yearsOfExp} Yrs</span>}
                            {email && <span> • ✉️ {email}</span>}
                          </div>
                          <div style={styles.applicationStatusRow}>
                            <div style={styles.statusLeft}>
                              {application.status && (
                                <div style={styles.applicationStatus}>
                                  Status:{" "}
                                  <span style={{
                                    ...styles.statusBadgeModal,
                                    ...(application.status === "HIRED" || application.status === "OFFERED" || application.status === "ACCEPTED"
                                      ? { background: "#d1fae5", color: "#065f46" }
                                      : application.status === "UNDER_REVIEW"
                                      ? { background: "#dbeafe", color: "#1e40af" }
                                      : application.status === "REJECTED"
                                      ? { background: "#fee2e2", color: "#991b1b" }
                                      : { background: "#f3f4f6", color: "#374151" }
                                    )
                                  }}>{application.status === "OFFERED" ? "ACCEPTED" : application.status}</span>
                                </div>
                              )}
                              {matchPctDisplay !== null && (
                                <div style={styles.matchBadgeModal}>
                                  🎯 {matchPctDisplay}% Match
                                </div>
                              )}
                            </div>
                            <div style={styles.statusActions}>
                              <select
                                style={{
                                  ...styles.statusSelect,
                                  color: (statusDraftById[application.id] ?? "") ? "#111827" : "#9ca3af",
                                }}
                                value={statusDraftById[application.id] ?? ""}
                                onChange={async (e) => {
                                  const uiStatus = e.target.value;
                                  if (!uiStatus) return;
                                  // Map UI status to backend enum value
                                  // ACCEPTED in UI maps to OFFERED in backend (backend doesn't have ACCEPTED enum)
                                  const backendStatus = uiStatus === "ACCEPTED" ? "OFFERED" : uiStatus;
                                  
                                  try {
                                    // First update the status via status API
                                    await updateApplicationStatus(application.id, backendStatus);
                                    
                                    // Then call the appropriate email endpoint based on status
                                    try {
                                      if (uiStatus === "ACCEPTED" || backendStatus === "OFFERED") {
                                        // Send job offer email
                                        await sendJobOffer(application.id);
                                      } else if (backendStatus === "REJECTED") {
                                        // Send rejection email
                                        await rejectApplication(application.id);
                                      } else if (backendStatus === "UNDER_REVIEW") {
                                        // Send interview invitation email
                                        await sendInterviewInvitation(application.id);
                                      }
                                    } catch (emailError) {
                                      console.error("Error sending email notification:", emailError);
                                      // Don't fail the whole operation if email fails, just show a warning
                                      setToast({ 
                                        message: `Status updated but email notification failed: ${emailError.message}`, 
                                        type: "error" 
                                      });
                                    }
                                    // Update local state with backend status (OFFERED will display as ACCEPTED)
                                    setJobCandidates(prev => 
                                      prev.map(app => 
                                        app.id === application.id 
                                          ? { ...app, status: backendStatus }
                                          : app
                                      )
                                    );
                                    setStatusDraftById((prev) => ({ ...prev, [application.id]: "" }));
                                    setToast({ 
                                      message: `Status updated to ${uiStatus}${backendStatus === "OFFERED" || backendStatus === "REJECTED" || backendStatus === "UNDER_REVIEW" ? " and email sent" : ""}`, 
                                      type: "success" 
                                    });
                                    // Refresh job stats to update counts
                                    const [jobsData, stats] = await Promise.all([
                                      fetchEmployerJobs(),
                                      fetchEmployerJobStats(),
                                    ]);
                                    
                                    // Parse description and requirements
                                    const jobsWithStats = jobsData.map((job) => {
                                      const jobStats = stats.find((stat) => stat.jobId === job.id);
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
                                        applied: jobStats?.appliedCandidates || 0,
                                        postedTime: job.postedDate
                                          ? getTimeAgo(new Date(job.postedDate))
                                          : "Recently",
                                        status: "Active",
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
                                        appliedCandidates: jobStats?.appliedCandidates || 0,
                                      };
                                    });
                                    
      setJobs(jobsWithStats);
      setOriginalJobs(jobsData); // Update original jobs data
      const updatedJob = jobsWithStats.find(j => j.id === selectedJob.id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
                                  } catch (error) {
                                    console.error("Error updating application status:", error);
                                    setToast({ 
                                      message: `Failed to update status: ${error.message}`, 
                                      type: "error" 
                                    });
                                  }
                                }}
                              >
                                <option value="" disabled>---</option>
                                <option value="UNDER_REVIEW">In Review</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="HIRED">Hired</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                      })}
                    </div>
                  </div>

                  <div style={styles.candidateDetailsPane}>
                    {selectedApplication ? (() => {
                      const c = selectedApplication.jobSeekerProfile || selectedApplication;
                      const p = selectedCandidateProfile && Object.keys(selectedCandidateProfile).length > 0
                        ? selectedCandidateProfile
                        : c;
                      const fullName = p.fullName || p.basicInfo?.name || c.fullName || c.name || selectedApplication.firstName || "Unknown";
                      const email = p.basicInfo?.email || p.email || c.email || selectedApplication.email || "";
                      const phone = p.basicInfo?.phone || p.phone || c.phone || c.basicInfo?.phone || "";
                      const location = p.basicInfo?.city || p.city || p.location || c.city || c.location || "Location not specified";
                      const role = (p.workExperience?.[0]?.jobTitle || c.workExperience?.[0]?.jobTitle || "Job Seeker");

                      const matchPctRaw =
                        selectedApplication.matchPercentage ??
                        c.matchPercentage ??
                        selectedApplication.matchingScore ??
                        c.matchingScore;
                      const matchPct =
                        matchPctRaw === null || matchPctRaw === undefined || matchPctRaw === ""
                          ? null
                          : Number(matchPctRaw);
                      const matchPctDisplay = Number.isFinite(matchPct) ? Math.round(matchPct) : null;

                      const skillsRaw = p.primarySkills || p.skills || c.skills || c.primarySkills || [];
                      const skills = Array.isArray(skillsRaw)
                        ? skillsRaw
                            .map((s) => (typeof s === "string" ? s : (s?.name || s?.skill || "")))
                            .map((s) => (s || "").trim())
                            .filter(Boolean)
                        : [];

                      const education = Array.isArray(p.education) ? p.education : (Array.isArray(c.education) ? c.education : []);
                      const workExperience = Array.isArray(p.workExperience) ? p.workExperience : (Array.isArray(c.workExperience) ? c.workExperience : []);

                      return (
                        <>
                          <div style={styles.detailsHeader}>
                            <div style={styles.detailsAvatar}>
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={styles.detailsName}>{fullName}</div>
                              <div style={styles.detailsMeta}>
                                <span>💼 {role}</span>
                                <span>📍 {location}</span>
                                {matchPctDisplay !== null && <span>🎯 {matchPctDisplay}% Match</span>}
                                {selectedApplication.status && (
                                  <span>
                                    Status:{" "}
                                    <strong>
                                      {selectedApplication.status === "OFFERED" ? "ACCEPTED" : selectedApplication.status}
                                    </strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={styles.detailsSection}>
                            <div style={styles.detailsSectionTitle}>Contact</div>
                            {loadingCandidateProfile && (
                              <div style={styles.detailsRow}>Loading full profile…</div>
                            )}
                            {candidateProfileError && (
                              <div style={{ ...styles.detailsRow, color: "#ef4444" }}>{candidateProfileError}</div>
                            )}
                            {email && <div style={styles.detailsRow}><strong>Email:</strong> {email}</div>}
                            {phone && <div style={styles.detailsRow}><strong>Phone:</strong> {phone}</div>}
                            {!email && !phone && (
                              <div style={styles.detailsRow}>No contact details available in the application response.</div>
                            )}
                          </div>

                          <div style={styles.detailsSection}>
                            <div style={styles.detailsSectionTitle}>Skills</div>
                            {skills.length === 0 ? (
                              <div style={styles.detailsRow}>No skills available.</div>
                            ) : (
                              <div style={styles.skillsWrap}>
                                {skills.slice(0, 24).map((s) => (
                                  <span key={s} style={styles.skillChip}>{s}</span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={styles.detailsSection}>
                            <div style={styles.detailsSectionTitle}>About</div>
                            <div style={styles.detailsRow}>
                              {p.otherDetails?.otherDetailsText ||
                                p.otherDetails?.summary ||
                                p.summary ||
                                c.summary ||
                                c.about ||
                                "No about information available."}
                            </div>
                          </div>

                          <div style={styles.detailsSection}>
                            <div style={styles.detailsSectionTitle}>Education</div>
                            {education.length === 0 ? (
                              <div style={styles.detailsRow}>No education available.</div>
                            ) : (
                              education.slice(0, 5).map((edu, i) => (
                                <div key={i} style={styles.detailsRow}>
                                  <strong>{edu.degree || "Education"}</strong>
                                  {edu.institution ? ` • ${edu.institution}` : ""}
                                  {edu.endDate ? ` • ${edu.endDate}` : (edu.year ? ` • ${edu.year}` : "")}
                                </div>
                              ))
                            )}
                          </div>

                          <div style={styles.detailsSection}>
                            <div style={styles.detailsSectionTitle}>Work Experience</div>
                            {workExperience.length === 0 ? (
                              <div style={styles.detailsRow}>No work experience available.</div>
                            ) : (
                              workExperience.slice(0, 5).map((exp, i) => (
                                <div key={i} style={styles.detailsRow}>
                                  <strong>{exp.jobTitle || exp.title || "Role"}</strong>
                                  {exp.company ? ` • ${exp.company}` : ""}
                                  {exp.duration ? ` • ${exp.duration}` : ""}
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      );
                    })() : (
                      <div style={{ color: "#6b7280", fontSize: "14px" }}>
                        Select a candidate to view details.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Job</h2>
              <button
                style={styles.modalCloseBtn}
                onClick={() => setShowEditModal(false)}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Job Title *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.jobTitle}
                    onChange={(e) => setEditFormData({...editFormData, jobTitle: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Company Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Job Location *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.jobLocation}
                    onChange={(e) => setEditFormData({...editFormData, jobLocation: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Address</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Years of Experience</label>
                  <input
                    type="text"
                    value={editFormData.yearsOfExperience}
                    onChange={(e) => setEditFormData({...editFormData, yearsOfExperience: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Job Type</label>
                  <select
                    value={editFormData.jobType}
                    onChange={(e) => setEditFormData({...editFormData, jobType: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer" }}
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full time">Full time</option>
                    <option value="Part time">Part time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Contract Type</label>
                  <select
                    value={editFormData.contractType}
                    onChange={(e) => setEditFormData({...editFormData, contractType: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", background: "#ffffff", cursor: "pointer" }}
                  >
                    <option value="">Select Contract Type</option>
                    <option value="Contract hybrid">Contract hybrid</option>
                    <option value="Contract remote">Contract remote</option>
                    <option value="Contract onsite">Contract onsite</option>
                    <option value="Hourly based">Hourly based</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Estimated Salary (e.g., 2500 - 3000)</label>
                  <input
                    type="text"
                    value={editFormData.estimatedSalary}
                    onChange={(e) => setEditFormData({...editFormData, estimatedSalary: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                    placeholder="2500 - 3000"
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Job Description *</label>
                  <textarea
                    required
                    value={editFormData.jobDescription}
                    onChange={(e) => setEditFormData({...editFormData, jobDescription: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", minHeight: "120px", resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>Requirements *</label>
                  <textarea
                    required
                    value={editFormData.jobRequirement}
                    onChange={(e) => setEditFormData({...editFormData, jobRequirement: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", minHeight: "120px", resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>External Apply URL (optional)</label>
                  <input
                    type="url"
                    value={editFormData.url}
                    onChange={(e) => setEditFormData({...editFormData, url: e.target.value})}
                    style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
                    placeholder="https://example.com/apply"
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      flex: 1,
                      padding: "14px 28px",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      color: "#374151",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "14px 28px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: updating ? "not-allowed" : "pointer",
                      opacity: updating ? 0.6 : 1,
                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    {updating ? "Updating..." : "Update Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && jobToDelete && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{...styles.modalContent, maxWidth: "500px"}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Delete Job</h2>
              <button
                style={styles.modalCloseBtn}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToDelete(null);
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ fontSize: "16px", color: "#374151", marginBottom: "24px", lineHeight: "1.6" }}>
                Are you sure you want to delete the job <strong>"{jobToDelete.jobTitle}"</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setJobToDelete(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "14px 28px",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#374151",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.6 : 1,
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  {deleting ? "Deleting..." : "Delete Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
