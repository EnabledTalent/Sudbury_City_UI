import { useState, useEffect, useId, useRef } from "react";
import { useLocation } from "react-router-dom";
import { fetchJobs, fetchAllApplications, applyWithProfile } from "../services/jobService";
import { useProfile } from "../context/ProfileContext";
import Toast from "../components/Toast";
import ChatWidget from "../components/ChatWidget";
import StudentHeader from "../components/student/StudentHeader";
import "./MyJobs.css";

export default function MyJobs() {
  const location = useLocation();
  const confirmDialogTitleId = useId();
  const confirmDialogDescId = useId();
  const detailsHeadingRef = useRef(null);
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
  const [showExternalConfirm, setShowExternalConfirm] = useState(false);
  const [pendingExternalApply, setPendingExternalApply] = useState(null);
  const [moveFocusToDetails, setMoveFocusToDetails] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        let data = [];

        if (filter === "all") {
          data = await fetchJobs();
        } else {
          const email = profile?.basicInfo?.email;
          const applications = await fetchAllApplications(email);

          data = applications
            .filter((app) => {
              const status = app.status?.toUpperCase() || "";
              if (filter === "applied") {
                return status === "APPLIED" || status === "UNDER_REVIEW";
              }
              if (filter === "accepted") {
                return status === "HIRED" || status === "ACCEPTED";
              }
              if (filter === "rejected") {
                return status === "REJECTED";
              }
              return true;
            })
            .map((app) => {
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
                applicationStatus: app.status,
                applicationId: app.id,
                firstName: app.firstName,
                resumeUrl: app.resumeUrl,
                ...app,
              };
            });
        }

        setJobs(data || []);
        if (data && data.length > 0) {
          const selectedJobId = location.state?.selectedJobId;

          if (selectedJobId) {
            const jobToSelect = data.find((job) => job.id === selectedJobId);
            if (jobToSelect) {
              setSelectedJob(jobToSelect);
            } else {
              setSelectedJob(data[0]);
            }
          } else if (!selectedJob || !data.find((job) => job.id === selectedJob.id)) {
            setSelectedJob(data[0]);
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

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible" && pendingExternalApply && !showExternalConfirm) {
        setShowExternalConfirm(true);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && pendingExternalApply && !showExternalConfirm) {
        setShowExternalConfirm(true);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pendingExternalApply, showExternalConfirm]);

  useEffect(() => {
    if (!showExternalConfirm) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setShowExternalConfirm(false);
      setPendingExternalApply(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showExternalConfirm]);

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setApplyError("");
    setApplySuccess(false);
    setMoveFocusToDetails(true);
  };

  const handleApply = async () => {
    if (!selectedJob) {
      setToast({ message: "Please select a job to apply", type: "error" });
      return;
    }

    if (selectedJob.externalApplied) {
      setToast({ message: "Already marked as applied.", type: "success" });
      return;
    }

    if (
      selectedJob.externalApplyUrl &&
      selectedJob.externalApplyUrl !== null &&
      selectedJob.externalApplyUrl.trim() !== ""
    ) {
      setPendingExternalApply({
        jobId: selectedJob.id,
        url: selectedJob.externalApplyUrl,
        ts: Date.now(),
        role: selectedJob.role || selectedJob.jobTitle || "",
      });
      setShowExternalConfirm(true);
      window.open(selectedJob.externalApplyUrl, "_blank");
      setToast({ message: "Complete the application, then confirm here.", type: "success" });
      return;
    }

    if (!profile || !profile.basicInfo?.email) {
      setToast({
        message: "Profile data is missing. Please complete your profile first.",
        type: "error",
      });
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
      setTimeout(() => {
        setApplySuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error applying to job:", err);
      const errorMessage = err.message || "Failed to submit application. Please try again.";
      setToast({ message: errorMessage, type: "error" });
      setApplyError("");
    } finally {
      setApplying(false);
    }
  };

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

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) {
      return true;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const role = (job.role || job.jobTitle || "").toLowerCase();
    const companyName = (job.employer?.companyName || job.company || "").toLowerCase();

    return role.includes(searchLower) || companyName.includes(searchLower);
  });

  useEffect(() => {
    if (selectedJob && filteredJobs.length > 0) {
      const isSelectedJobVisible = filteredJobs.some((job) => job.id === selectedJob.id);
      if (!isSelectedJobVisible) {
        setSelectedJob(filteredJobs[0]);
      }
    } else if (!selectedJob && filteredJobs.length > 0) {
      setSelectedJob(filteredJobs[0]);
    } else if (filteredJobs.length === 0) {
      setSelectedJob(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJobs, searchQuery]);

  useEffect(() => {
    if (!selectedJob || !moveFocusToDetails) return;
    if (!detailsHeadingRef.current) return;

    const isMobileOrTablet = window.matchMedia("(max-width: 960px)").matches;
    if (!isMobileOrTablet) {
      setMoveFocusToDetails(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    detailsHeadingRef.current.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    detailsHeadingRef.current.focus();
    setMoveFocusToDetails(false);
  }, [selectedJob, moveFocusToDetails]);

  return (
    <div className="my-jobs">
      <StudentHeader
        activePage="myJobs"
        showSearch
        searchValue={searchQuery}
        searchPlaceholder="Search by role or company"
        onSearchChange={setSearchQuery}
        showAiCoach
        onAiCoachClick={() => setShowChatWidget(true)}
      />

      <main className="my-jobs__main" aria-label="My jobs workspace">
        <aside className="my-jobs__left-sidebar" aria-label="Job listings">
          <div className="my-jobs__filter-buttons" role="group" aria-label="Application filters">
            <button
              type="button"
              className={`my-jobs__filter-btn${filter === "all" ? " is-active" : ""}`}
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
            >
              All
            </button>
            <button
              type="button"
              className={`my-jobs__filter-btn${filter === "applied" ? " is-active" : ""}`}
              onClick={() => setFilter("applied")}
              aria-pressed={filter === "applied"}
            >
              Applied
            </button>
            <button
              type="button"
              className={`my-jobs__filter-btn${filter === "accepted" ? " is-active" : ""}`}
              onClick={() => setFilter("accepted")}
              aria-pressed={filter === "accepted"}
            >
              Accepted
            </button>
            <button
              type="button"
              className={`my-jobs__filter-btn${filter === "rejected" ? " is-active" : ""}`}
              onClick={() => setFilter("rejected")}
              aria-pressed={filter === "rejected"}
            >
              Rejected
            </button>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="my-jobs__empty-state" role="status">
              No jobs found
            </div>
          ) : (
            <ul className="my-jobs__job-list">
              {filteredJobs.map((job, index) => {
                const jobId = job.id || index;
                const company = job.employer?.companyName || "Company";
                const companyLogo = company.charAt(0).toUpperCase();
                const jobTitle = job.role || "Job Title";
                const role = job.role || job.jobTitle || "Job";
                const location = job.location || "Location";
                const salary = job.salary ? `$${job.salary}` : "Salary not specified";
                const matchingScore = job.matchingScore || job.matchPercentage || 0;
                const postedDate = job.postedDate;
                const postedTime = postedDate ? formatPostedTime(postedDate) : "Recently";
                const status = job.status || "active";
                const isSelected =
                  selectedJob?.id === jobId || (selectedJob && !selectedJob.id && index === 0);

                return (
                  <li key={jobId} className="my-jobs__job-list-item">
                    <button
                      type="button"
                      className={`my-jobs__job-card${isSelected ? " is-selected" : ""}`}
                      onClick={() => handleJobClick(job)}
                      aria-pressed={isSelected}
                      aria-label={`Open ${role} at ${company}`}
                    >
                      <div className="my-jobs__job-card-header">
                        <span className="my-jobs__posted-time">Posted {postedTime}</span>
                        <span className="my-jobs__active-tag">
                          {status === "active" ? "Active" : status}
                        </span>
                      </div>
                      <div className="my-jobs__job-card-content">
                        <div className="my-jobs__company-logo">{companyLogo}</div>
                        <div className="my-jobs__job-card-info">
                          <div className="my-jobs__job-card-title">{jobTitle}</div>
                          <div className="my-jobs__job-card-company">{company}</div>
                          <div className="my-jobs__job-card-details">
                            <div className="my-jobs__job-card-detail">
                              <span className="my-jobs__job-card-label">Location:</span>
                              <span>{location}</span>
                            </div>
                            <div className="my-jobs__job-card-detail">
                              <span className="my-jobs__job-card-label">Salary:</span>
                              <span>{salary}</span>
                            </div>
                          </div>
                          {matchingScore > 0 && (
                            <div className="my-jobs__matching-score">{matchingScore}% Matching</div>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="my-jobs__right-content" aria-label="Job details">
          {selectedJob ? (
            <article className="my-jobs__job-details-card">
              {filter === "all" && (
                <button
                  type="button"
                  className={`my-jobs__apply-btn${
                    applySuccess || selectedJob.externalApplied ? " is-applied" : ""
                  }`}
                  onClick={handleApply}
                  disabled={applying || selectedJob.externalApplied}
                >
                  {applying
                    ? "Applying..."
                    : applySuccess || selectedJob.externalApplied
                    ? "Applied"
                    : "Apply"}
                </button>
              )}

              <div className="my-jobs__job-details-header">
                <div className="my-jobs__job-details-logo">
                  {(selectedJob.employer?.companyName || "C").charAt(0).toUpperCase()}
                </div>
                <div className="my-jobs__job-details-title-section">
                  <h2
                    ref={detailsHeadingRef}
                    className="my-jobs__job-details-title"
                    tabIndex={-1}
                  >
                    {selectedJob.role || "Job Title"}
                  </h2>
                  <div className="my-jobs__job-details-company">
                    {selectedJob.employer?.companyName || "Company"}
                    {selectedJob.employer?.verified && (
                      <span className="my-jobs__verified">Verified</span>
                    )}
                  </div>
                  <span className="my-jobs__active-tag">Active</span>
                </div>
              </div>

              <div className="my-jobs__job-details-info">
                <div className="my-jobs__job-detail-item">
                  <div className="my-jobs__job-detail-label">Employment Type</div>
                  <div className="my-jobs__job-detail-value">
                    {selectedJob.employmentType || "Full Time"}
                  </div>
                </div>
                <div className="my-jobs__job-detail-item">
                  <div className="my-jobs__job-detail-label">Location</div>
                  <div className="my-jobs__job-detail-value">{selectedJob.location || "Not specified"}</div>
                </div>
                <div className="my-jobs__job-detail-item">
                  <div className="my-jobs__job-detail-label">Type of Work</div>
                  <div className="my-jobs__job-detail-value">{selectedJob.typeOfWork || "Not specified"}</div>
                </div>
                <div className="my-jobs__job-detail-item">
                  <div className="my-jobs__job-detail-label">Posted Date</div>
                  <div className="my-jobs__job-detail-value">
                    {selectedJob.postedDate
                      ? new Date(selectedJob.postedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not specified"}
                  </div>
                </div>
                <div className="my-jobs__job-detail-item">
                  <div className="my-jobs__job-detail-label">Salary</div>
                  <div className="my-jobs__job-detail-value">
                    {selectedJob.salary ? `$${selectedJob.salary.toLocaleString()}` : "Not specified"}
                  </div>
                </div>
              </div>

              {selectedJob.description && (
                <section className="my-jobs__section">
                  <h3 className="my-jobs__section-title">Description</h3>
                  <p className="my-jobs__section-text">{selectedJob.description}</p>
                </section>
              )}

              {selectedJob.requirements && (
                <section className="my-jobs__section">
                  <h3 className="my-jobs__section-title">Requirements</h3>
                  <p className="my-jobs__section-text">{selectedJob.requirements}</p>
                </section>
              )}

              {selectedJob.employer?.email && (
                <section className="my-jobs__section">
                  <h3 className="my-jobs__section-title">Contact</h3>
                  <p className="my-jobs__section-text">
                    Email:{" "}
                    <a href={`mailto:${selectedJob.employer.email}`} className="my-jobs__contact-link">
                      {selectedJob.employer.email}
                    </a>
                  </p>
                </section>
              )}
            </article>
          ) : (
            <div className="my-jobs__empty-state" role="status">
              Select a job to view details
            </div>
          )}
        </section>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
        duration={toast.type === "error" ? 5000 : 3000}
      />

      {showExternalConfirm && (
        <div
          className="my-jobs__modal-overlay"
          onClick={() => {
            setShowExternalConfirm(false);
            setPendingExternalApply(null);
          }}
        >
          <div
            className="my-jobs__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={confirmDialogTitleId}
            aria-describedby={confirmDialogDescId}
          >
            <h3 id={confirmDialogTitleId} className="my-jobs__modal-title">
              Did you complete your application?
            </h3>
            <p id={confirmDialogDescId} className="my-jobs__modal-text">
              {pendingExternalApply?.role
                ? `For "${pendingExternalApply.role}".`
                : "For the job you just opened."}{" "}
              If yes, we will mark it as Applied by submitting your profile in the portal.
            </p>
            <div className="my-jobs__modal-actions">
              <button
                type="button"
                className="my-jobs__modal-btn my-jobs__modal-btn--secondary"
                onClick={() => {
                  setShowExternalConfirm(false);
                  setPendingExternalApply(null);
                }}
              >
                No
              </button>
              <button
                type="button"
                className="my-jobs__modal-btn my-jobs__modal-btn--primary"
                onClick={async () => {
                  const pending = pendingExternalApply;
                  if (!pending?.jobId) {
                    setShowExternalConfirm(false);
                    setPendingExternalApply(null);
                    return;
                  }
                  if (!profile || !profile.basicInfo?.email) {
                    setToast({
                      message: "Profile data is missing. Please complete your profile first.",
                      type: "error",
                    });
                    return;
                  }

                  try {
                    setApplying(true);
                    await applyWithProfile(pending.jobId, profile);
                    setToast({ message: "Marked as Applied.", type: "success" });

                    setJobs((prev) =>
                      (prev || []).map((j) =>
                        j.id === pending.jobId ? { ...j, externalApplied: true } : j
                      )
                    );
                    if (selectedJob?.id === pending.jobId) {
                      setSelectedJob((prev) => ({ ...prev, externalApplied: true }));
                    }
                    setApplySuccess(true);
                    setTimeout(() => setApplySuccess(false), 2500);
                    setShowExternalConfirm(false);
                    setPendingExternalApply(null);
                  } catch (err) {
                    console.error("Error marking external apply as applied:", err);
                    setToast({
                      message: err.message || "Failed to mark as applied. Please try again.",
                      type: "error",
                    });
                  } finally {
                    setApplying(false);
                  }
                }}
              >
                Yes, I applied
              </button>
            </div>
          </div>
        </div>
      )}

      {showChatWidget && <ChatWidget onClose={() => setShowChatWidget(false)} />}
    </div>
  );
}
