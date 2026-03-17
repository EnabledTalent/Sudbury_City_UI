import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAllJobseekerProfiles } from "../../services/profileService";
import { fetchEmployerJobs, inviteToApply } from "../../services/jobService";
import EmployerHeader from "../../components/employer/EmployerHeader";
import Toast from "../../components/Toast";
import "./Candidates.css";

const DEFAULT_EXPANDED_SECTIONS = {
  about: true,
  education: false,
  workExperience: false,
  skills: false,
  projects: false,
  achievements: false,
  certifications: false,
  preference: false,
};

const valueOrFallback = (value, fallback = "") => {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const getCount = (arrayLike) => {
  if (!Array.isArray(arrayLike)) return 0;
  return arrayLike.length;
};

const toCandidate = (profile) => {
  const fullName = profile?.fullName || profile?.basicInfo?.name || "Unknown";
  const email = profile?.email || profile?.basicInfo?.email || "";

  const workHistory = Array.isArray(profile?.workExperience) ? profile.workExperience : [];
  let yearsOfExperience = 0;

  if (workHistory.length > 0) {
    const nowYear = new Date().getFullYear();
    const durations = workHistory.map((item) => {
      const start = item?.startDate ? Number(String(item.startDate).slice(0, 4)) : nowYear;
      const end = item?.endDate
        ? Number(String(item.endDate).slice(0, 4))
        : item?.currentlyWorking
          ? nowYear
          : nowYear;
      if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
      return Math.max(0, end - start);
    });
    yearsOfExperience = Math.max(0, ...durations);
  }

  const location =
    profile?.city ||
    profile?.location ||
    profile?.otherDetails?.location ||
    "Location not specified";

  const recentRole = workHistory[0]?.jobTitle || workHistory[0]?.title || "Job Seeker";

  const rawBasicInfo = profile?.basicInfo || {};
  const linkedin = rawBasicInfo.linkedin || rawBasicInfo.linkedIn || profile?.linkedin;
  const basicInfo = Object.keys(rawBasicInfo).length > 0 || linkedin
    ? { ...rawBasicInfo, linkedin: linkedin || rawBasicInfo.linkedin }
    : null;
  return {
    id: profile?.id || email || fullName,
    name: fullName,
    title: recentRole,
    status: "Active",
    location,
    experience: yearsOfExperience > 0 ? `${yearsOfExperience} yrs` : "No experience",
    profilePic: fullName.charAt(0).toUpperCase(),
    about: profile?.summary || profile?.basicInfo?.summary || profile?.otherDetails?.otherDetailsText || "No description available.",
    basicInfo,
    education: Array.isArray(profile?.education) ? profile.education : [],
    workExperience: workHistory,
    skills: Array.isArray(profile?.skills)
      ? profile.skills
      : Array.isArray(profile?.primarySkills)
        ? profile.primarySkills
        : [],
    projects: Array.isArray(profile?.projects) ? profile.projects : [],
    achievements: Array.isArray(profile?.achievements) ? profile.achievements : [],
    certifications: Array.isArray(profile?.certification)
      ? profile.certification
      : Array.isArray(profile?.certifications)
        ? profile.certifications
        : [],
    preference: profile?.preference || null,
    otherDetails: profile?.otherDetails || null,
    email,
  };
};

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [expandedSections, setExpandedSections] = useState(DEFAULT_EXPANDED_SECTIONS);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [employerJobs, setEmployerJobs] = useState([]);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const dropdownRef = useRef(null);

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return candidates;

    return candidates.filter((candidate) => {
      const nameMatch = candidate.name?.toLowerCase().includes(query);
      const titleMatch = candidate.title?.toLowerCase().includes(query);
      const skillsMatch = candidate.skills?.some((skill) => skill.toLowerCase().includes(query));
      return nameMatch || titleMatch || skillsMatch;
    });
  }, [candidates, searchQuery]);

  useEffect(() => {
    if (filteredCandidates.length === 0) {
      setSelectedCandidate(null);
      return;
    }

    if (!selectedCandidate) {
      setSelectedCandidate(filteredCandidates[0]);
      return;
    }

    const stillVisible = filteredCandidates.some((item) => item.id === selectedCandidate.id);
    if (!stillVisible) {
      setSelectedCandidate(filteredCandidates[0]);
    }
  }, [filteredCandidates, selectedCandidate]);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const profiles = await fetchAllJobseekerProfiles();
        const transformed = Array.isArray(profiles) ? profiles.map(toCandidate) : [];
        setCandidates(transformed);
      } catch (error) {
        console.error("Error loading candidates:", error);
        setCandidates([]);
        setToast({ message: `Failed to load candidates: ${error.message}`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobs = await fetchEmployerJobs();
        setEmployerJobs(Array.isArray(jobs) ? jobs : []);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setEmployerJobs([]);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    if (!showJobDropdown) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowJobDropdown(false);
      }
    };

    const onMouseDown = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setShowJobDropdown(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [showJobDropdown]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSendInvite = async (jobId) => {
    if (!selectedCandidate || !jobId) {
      setToast({ message: "Please select a candidate and job.", type: "error" });
      return;
    }

    if (!selectedCandidate.email) {
      setToast({ message: "Candidate email is missing.", type: "error" });
      return;
    }

    setSendingInvite(true);
    setShowJobDropdown(false);

    try {
      await inviteToApply(jobId, selectedCandidate.email);
      const selectedJob = employerJobs.find((job) => job.id === jobId);
      setToast({
        message: `Invitation sent to ${selectedCandidate.name} for ${
          selectedJob?.role || selectedJob?.jobTitle || "the selected job"
        }.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error sending invite:", error);
      setToast({ message: `Failed to send invitation: ${error.message}`, type: "error" });
    } finally {
      setSendingInvite(false);
    }
  };

  const renderEducation = () => {
    if (!selectedCandidate?.education?.length) return <p className="candidates__empty-text">No education added.</p>;

    return selectedCandidate.education.map((edu, index) => (
      <div
        key={`${selectedCandidate.id}-edu-${index}`}
        className={`candidates__list-row ${
          index === selectedCandidate.education.length - 1 ? "candidates__list-row--last" : ""
        }`}
      >
        <p className="candidates__item-title">{valueOrFallback(edu?.degree || edu?.program)}</p>
        <p className="candidates__item-subtitle">{valueOrFallback(edu?.institution || edu?.school)}</p>
        <p className="candidates__item-subtitle">{valueOrFallback(edu?.year || edu?.graduationYear)}</p>
      </div>
    ));
  };

  const renderWorkExperience = () => {
    if (!selectedCandidate?.workExperience?.length) {
      return <p className="candidates__empty-text">No work experience added.</p>;
    }

    return selectedCandidate.workExperience.map((exp, index) => (
      <div
        key={`${selectedCandidate.id}-work-${index}`}
        className={`candidates__list-row candidates__list-row--block ${
          index === selectedCandidate.workExperience.length - 1 ? "candidates__list-row--last" : ""
        }`}
      >
        <p className="candidates__item-title">{valueOrFallback(exp?.jobTitle || exp?.title)}</p>
        <p className="candidates__item-subtitle"><strong>Company:</strong> {valueOrFallback(exp?.company || exp?.companyName)}</p>
        {Array.isArray(exp?.responsibilities) && exp.responsibilities.length > 0 && (
          <div className="candidates__item-subtitle">
            <strong>Responsibilities:</strong>
            <ul className="candidates__list-bullets">
              {exp.responsibilities.map((r, i) => (r ? <li key={i}>{r}</li> : null))}
            </ul>
          </div>
        )}
      </div>
    ));
  };

  const renderProjects = () => {
    if (!selectedCandidate?.projects?.length) return <p className="candidates__empty-text">No projects added.</p>;

    return selectedCandidate.projects.map((project, index) => (
      <div
        key={`${selectedCandidate.id}-project-${index}`}
        className={`candidates__list-row ${
          index === selectedCandidate.projects.length - 1 ? "candidates__list-row--last" : ""
        }`}
      >
        <p className="candidates__item-title">{valueOrFallback(project?.name || project?.projectName)}</p>
        <p className="candidates__item-subtitle">{valueOrFallback(project?.description)}</p>
      </div>
    ));
  };

  const renderAchievements = () => {
    if (!selectedCandidate?.achievements?.length) {
      return <p className="candidates__empty-text">No achievements added.</p>;
    }

    return selectedCandidate.achievements.map((achievement, index) => (
      <div
        key={`${selectedCandidate.id}-achievement-${index}`}
        className={`candidates__list-row ${
          index === selectedCandidate.achievements.length - 1 ? "candidates__list-row--last" : ""
        }`}
      >
        <p className="candidates__item-title">{valueOrFallback(achievement?.title || achievement?.name)}</p>
        <p className="candidates__item-subtitle">{valueOrFallback(achievement?.year || achievement?.date)}</p>
      </div>
    ));
  };

  const renderCertifications = () => {
    if (!selectedCandidate?.certifications?.length) {
      return <p className="candidates__empty-text">No certifications added.</p>;
    }

    return selectedCandidate.certifications.map((cert, index) => (
      <div
        key={`${selectedCandidate.id}-cert-${index}`}
        className={`candidates__list-row ${
          index === selectedCandidate.certifications.length - 1 ? "candidates__list-row--last" : ""
        }`}
      >
        <p className="candidates__item-title">{valueOrFallback(cert?.name || cert?.certificateName)}</p>
        <p className="candidates__item-subtitle">{valueOrFallback(cert?.issuer || cert?.organization)}</p>
        <p className="candidates__item-subtitle">{valueOrFallback(cert?.year || cert?.date)}</p>
      </div>
    ));
  };

  const renderPreference = () => {
    if (!selectedCandidate?.preference || typeof selectedCandidate.preference !== "object") {
      return <p className="candidates__empty-text">No preferences added.</p>;
    }

    const fmt = (v) => (Array.isArray(v) ? v.filter(Boolean).join(", ") : v != null ? String(v) : "");
    const companySize = fmt(selectedCandidate.preference.companySize);
    const jobType = fmt(selectedCandidate.preference.jobType);
    const jobSearch = fmt(selectedCandidate.preference.jobSearch);
    const hasAny = companySize || jobType || jobSearch;

    if (!hasAny) return <p className="candidates__empty-text">No preferences added.</p>;

    return (
      <dl className="candidates__key-value">
        {companySize && (
          <div className="candidates__key-value-row">
            <dt>Company Size</dt>
            <dd>{companySize}</dd>
          </div>
        )}
        {jobType && (
          <div className="candidates__key-value-row">
            <dt>Job Type</dt>
            <dd>{jobType}</dd>
          </div>
        )}
        {jobSearch && (
          <div className="candidates__key-value-row">
            <dt>Job Search</dt>
            <dd>{jobSearch}</dd>
          </div>
        )}
      </dl>
    );
  };

  const sections = selectedCandidate
    ? [
        {
          key: "about",
          title: "About",
          count: null,
          content: (
            <div className="candidates__about-contact" aria-label="Contact information">
              <div className="candidates__about-fullname">
                {selectedCandidate.basicInfo?.name || selectedCandidate.name}
              </div>
              <div className="candidates__about-contact-items">
                {(selectedCandidate.basicInfo?.email || selectedCandidate.email) && (
                  <a className="candidates__about-contact-link" href={`mailto:${selectedCandidate.basicInfo?.email || selectedCandidate.email}`}>
                    {selectedCandidate.basicInfo?.email || selectedCandidate.email}
                  </a>
                )}
                {(selectedCandidate.basicInfo?.linkedin || selectedCandidate.linkedin) && (
                  <a
                    className="candidates__about-contact-link"
                    href={(() => {
                      const url = selectedCandidate.basicInfo?.linkedin || selectedCandidate.linkedin || "";
                      return url.startsWith("http") ? url : `https://${url}`;
                    })()}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          ),
        },
        {
          key: "education",
          title: "Education",
          count: getCount(selectedCandidate.education),
          content: renderEducation(),
        },
        {
          key: "workExperience",
          title: "Work Experience",
          count: getCount(selectedCandidate.workExperience),
          content: renderWorkExperience(),
        },
        {
          key: "skills",
          title: "Skills",
          count: getCount(selectedCandidate.skills),
          content: selectedCandidate.skills?.length ? (
            <div className="candidates__skills-list">
              {selectedCandidate.skills.map((skill, index) => (
                <span key={`${selectedCandidate.id}-skill-${index}`} className="candidates__skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="candidates__empty-text">No skills added.</p>
          ),
        },
        {
          key: "projects",
          title: "Projects",
          count: getCount(selectedCandidate.projects),
          content: renderProjects(),
        },
        {
          key: "achievements",
          title: "Achievements",
          count: getCount(selectedCandidate.achievements),
          content: renderAchievements(),
        },
        {
          key: "certifications",
          title: "Certifications",
          count: getCount(selectedCandidate.certifications),
          content: renderCertifications(),
        },
        {
          key: "preference",
          title: "Preference",
          count: null,
          content: renderPreference(),
        },
      ]
    : [];

  return (
    <div className="candidates-page">
      <a className="skip-link" href="#candidate-details">
        Skip to candidate details
      </a>

      <EmployerHeader activePage="candidates" />

      <main className="candidates" aria-label="Candidates workspace">
        <aside className="candidates__list-panel" aria-label="Candidate list">
          <div className="candidates__search-section">
            <label htmlFor="candidate-search" className="candidates__search-label">
              Search candidates
            </label>
            <div className="candidates__search-bar">
              <input
                id="candidate-search"
                type="search"
                placeholder="Search by skills: UX Design, Python Developer"
                className="candidates__search-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <button type="button" className="candidates__filters-btn">
              Filters
            </button>
          </div>

          <div className="candidates__list" aria-live="polite">
            {loading ? (
              <p className="candidates__state-text">Loading candidates...</p>
            ) : filteredCandidates.length === 0 ? (
              <p className="candidates__state-text">
                {searchQuery ? "No candidates found matching your search." : "No candidates available."}
              </p>
            ) : (
              <ul className="candidates__items">
                {filteredCandidates.map((candidate) => {
                  const isActive = selectedCandidate?.id === candidate.id;
                  return (
                    <li key={candidate.id}>
                      <button
                        type="button"
                        className={`candidates__item ${isActive ? "candidates__item--active" : ""}`}
                        onClick={() => setSelectedCandidate(candidate)}
                        aria-pressed={isActive}
                      >
                        <div className="candidates__item-header">
                          <div className="candidates__avatar" aria-hidden="true">
                            {candidate.profilePic}
                          </div>
                          <div className="candidates__item-meta">
                            <p className="candidates__item-name">{candidate.name}</p>
                            <p className="candidates__item-role">{candidate.title}</p>
                          </div>
                          <span className="candidates__status-pill">{candidate.status}</span>
                        </div>
                        <p className="candidates__item-detail">Location: {candidate.location}</p>
                        <p className="candidates__item-detail">Experience: {candidate.experience}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section id="candidate-details" className="candidates__detail-panel" aria-label="Candidate details">
          {selectedCandidate ? (
            <>
              <header className="candidates__profile-header">
                <div className="candidates__profile-avatar" aria-hidden="true">
                  {selectedCandidate.profilePic}
                </div>
                <div className="candidates__profile-main">
                  <h1 className="candidates__profile-name">{selectedCandidate.name}</h1>
                  <p className="candidates__profile-role">{selectedCandidate.title}</p>
                  <div ref={dropdownRef} className="candidates__invite-wrap">
                    <button
                      type="button"
                      className="candidates__invite-btn"
                      onClick={() => setShowJobDropdown((prev) => !prev)}
                      disabled={sendingInvite || employerJobs.length === 0}
                      aria-expanded={showJobDropdown}
                      aria-controls="candidate-job-list"
                    >
                      {sendingInvite ? "Sending..." : "Send Invites for Jobs +"}
                    </button>

                    {showJobDropdown && (
                      <div id="candidate-job-list" className="candidates__job-dropdown" role="listbox">
                        {employerJobs.length > 0 ? (
                          employerJobs.map((job) => (
                            <button
                              key={job.id}
                              type="button"
                              className="candidates__job-option"
                              onClick={() => handleSendInvite(job.id)}
                            >
                              <span className="candidates__job-title">
                                {job.role || job.jobTitle || "Untitled job"}
                              </span>
                              <span className="candidates__job-location">
                                {job.location || job.jobLocation || "Location not specified"}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="candidates__job-empty">No jobs posted yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {sections.map((section) => {
                const expanded = Boolean(expandedSections[section.key]);
                const panelId = `candidate-section-panel-${section.key}`;

                return (
                  <article key={section.key} className="candidates__section-card">
                    <h2 className="candidates__section-heading">
                      <button
                        type="button"
                        className="candidates__section-toggle"
                        onClick={() => toggleSection(section.key)}
                        aria-expanded={expanded}
                        aria-controls={panelId}
                      >
                        <span>
                          {section.title}
                          {section.count != null && (
                            <span className="candidates__section-count">{section.count} added</span>
                          )}
                        </span>
                        <span aria-hidden="true" className="candidates__toggle-indicator">
                          {expanded ? "-" : "+"}
                        </span>
                      </button>
                    </h2>

                    {expanded && (
                      <div id={panelId} className="candidates__section-content">
                        {section.content}
                      </div>
                    )}
                  </article>
                );
              })}
            </>
          ) : (
            <p className="candidates__empty-state">Select a candidate to view their profile.</p>
          )}
        </section>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
