import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/authService";
import { fetchProfile } from "../services/profileService";
import { fetchJobseekerNotifications, deleteJobseekerInvite } from "../services/jobService";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import ChatWidget from "../components/ChatWidget";
import { useProfile } from "../context/ProfileContext";
import Toast from "../components/Toast";
import TourOverlay from "../components/TourOverlay";
import StudentHeader from "../components/student/StudentHeader";
import "./ViewProfile.css";

export default function ViewProfile() {
  const navigate = useNavigate();
  const { profile: contextProfile, loadProfileData } = useProfile();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    about: true,
    culturalInterest: false,
    education: false,
    workExperience: false,
    skills: false,
    projects: false,
    achievements: false,
    certification: false,
    preference: false,
    otherDetails: false,
  });
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [notifications, setNotifications] = useState({
    invites: [],
    recruiterActions: [],
    recommendedJobs: [],
    legacy: [],
  });
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [deletingInviteId, setDeletingInviteId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [showTour, setShowTour] = useState(false);

  // Get email from localStorage or context
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
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || payload.email;
      } catch (e) {
        // Error parsing token
      }
    }
    return null;
  };

  useEffect(() => {
    const loadProfile = async () => {
      const email = getEmail();
      if (!email) {
        setError("Email not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchProfile(email);
        
        if (data && Object.keys(data).length > 0) {
          setProfile(data);
          // Also update the context to keep it in sync
          loadProfileData(data);
        } else {
          setProfile({});
          setError("No profile data found. Please complete your profile first.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.message && err.message.includes("Failed to fetch")) {
          setError("Network error. Please check your connection and try again.");
        } else if (err.message && (err.message.includes("401") || err.message.includes("403"))) {
          setError("Authentication failed. Please login again.");
        } else if (err.message && err.message.includes("404")) {
          setError("Profile not found. Please complete your profile first.");
        } else {
          setError(err.message || "Failed to load profile. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const firstTimeLogin = localStorage.getItem("firstTimeLogin") === "true";
    const tourKey = "tour:student:mainNav:v1";
    const status = localStorage.getItem(tourKey);
    if (firstTimeLogin && !status) {
      setShowTour(true);
    }
  }, []);

  // Ensure context is always in sync with fetched profile
  // This keeps both ViewProfile and ProfileHeader using the same data source

  // Fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      const email = getEmail();
      if (!email) {
        return;
      }

      try {
        setLoadingNotifications(true);
        const data = await fetchJobseekerNotifications(email);
        setNotifications(
          data || { invites: [], recruiterActions: [], recommendedJobs: [], legacy: [] }
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications({ invites: [], recruiterActions: [], recommendedJobs: [], legacy: [] });
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDeleteInvite = async (inviteId) => {
    if (!inviteId) return;
    const email = getEmail();
    if (!email) {
      setToast({ message: "Email not found", type: "error" });
      return;
    }
    try {
      setDeletingInviteId(inviteId);
      await deleteJobseekerInvite(inviteId, email);
      setNotifications((prev) => ({
        ...prev,
        invites: (prev.invites || []).filter((inv) => inv.inviteId !== inviteId),
      }));
      setToast({ message: "Invitation removed", type: "success" });
    } catch (err) {
      console.error("Error deleting invite:", err);
      setToast({ message: err.message || "Failed to delete invitation", type: "error" });
    } finally {
      setDeletingInviteId(null);
    }
  };

  const getCount = (array) => {
    if (!array) return 0;
    return Array.isArray(array) ? array.length : 0;
  };

  // Use context profile as primary source to match ProfileHeader in Update Profile page
  // This ensures both pages calculate completion from the same data source
  const profileToUse = useMemo(() => {
    if (contextProfile && Object.keys(contextProfile).length > 0) return contextProfile;
    if (profile && Object.keys(profile).length > 0) return profile;
    return {};
  }, [contextProfile, profile]);
  
  const completionPercentage = useMemo(() => {
    if (!profileToUse || Object.keys(profileToUse).length === 0) return 0;
    return calculateProfileCompletion(profileToUse);
  }, [profileToUse]);

  // Calculate SVG circle progress
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

  if (loading) {
    return (
      <div className="view-profile">
        <StudentHeader activePage="home" />
        <main className="view-profile__main" aria-label="Profile overview">
          <div className="view-profile__loading" role="status" aria-live="polite">
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="view-profile">
        <StudentHeader activePage="home" />
        <main className="view-profile__main" aria-label="Profile overview">
          <div className="view-profile__error" role="alert">{error}</div>
        </main>
      </div>
    );
  }

  // Get name from profile, context, or localStorage as fallback
  const getName = () => {
    // First try fetched profile - check fullName at root level (from API)
    if (profile?.fullName) {
      return profile.fullName;
    }
    // Then try basicInfo.name from fetched profile
    if (profile?.basicInfo?.name) {
      return profile.basicInfo.name;
    }
    // Then try context profile - check fullName at root level
    if (contextProfile?.fullName) {
      return contextProfile.fullName;
    }
    // Then try context profile basicInfo.name
    if (contextProfile?.basicInfo?.name) {
      return contextProfile.basicInfo.name;
    }
    // Fallback to localStorage profileData - check fullName
    const profileData = localStorage.getItem("profileData");
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        if (parsed.fullName) {
          return parsed.fullName;
        }
        if (parsed.basicInfo?.name) {
          return parsed.basicInfo.name;
        }
      } catch (e) {
        console.error("Error parsing profileData:", e);
      }
    }
    return "User";
  };

  const name = getName();
  const initials = name && name !== "User"
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";
  const jobTitle = profile?.basicInfo?.jobTitle || profile?.workExperience?.[0]?.jobTitle || "Job Title";
  const contactEmail = profileToUse?.basicInfo?.email || profileToUse?.email || "";
  const contactPhone = profileToUse?.basicInfo?.phone || profileToUse?.phone || "";
  const contactLinkedin = profileToUse?.basicInfo?.linkedin || profileToUse?.linkedin || "";
  const normalizeUrl = (value) => {
    if (!value || typeof value !== "string") return "";
    const raw = value.trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  };
  const hasContactDetails = Boolean(contactEmail || contactPhone || contactLinkedin);
  const chevronIcon = "\u25BE";
  const invites = notifications?.invites || [];
  const recruiterActions = notifications?.recruiterActions || [];
  const recommendedJobs = notifications?.recommendedJobs || [];
  const legacyNotifications = notifications?.legacy || [];
  const notificationsCount =
    invites.length + recruiterActions.length + recommendedJobs.length + legacyNotifications.length;

  return (
    <div className="view-profile">
      <StudentHeader
        activePage="home"
        showAiCoach
        onAiCoachClick={() => setShowChatWidget(true)}
        extraActions={
          <button
            type="button"
            className="student-header__launch-tour"
            onClick={() => setShowTour(true)}
          >
            Launch Tour
          </button>
        }
      />

      <main className="view-profile__main" aria-label="Profile overview">
        {/* Orange Banner */}
        <section className="view-profile__banner" aria-label="Profile Completion Banner">
          <div className="view-profile__banner-left">
            <div className="view-profile__banner-small-text">Make your profile</div>
            <h2 className="view-profile__banner-title">
              Standout from 1000s of candidates
            </h2>
            <button
              type="button"
              className="view-profile__update-btn"
              onClick={() => {
                // Set edit mode flag before navigating
                localStorage.setItem("profileEditMode", "true");
                navigate("/student/profile");
              }}
            >
              Update Profile
            </button>
          </div>
          <div className="view-profile__progress">
            <div className="view-profile__progress-circle" role="img" aria-label={`Profile completion ${completionPercentage}%`}>
              <svg width="110" height="110" viewBox="0 0 110 110" className="view-profile__progress-svg">
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  className="view-profile__progress-ring"
                />
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  className="view-profile__progress-fill"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="view-profile__progress-inner">
                <div className="view-profile__progress-number">{completionPercentage}</div>
                <div className="view-profile__progress-label">
                  Profile<br />Completed
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="view-profile__content">
          {/* Left Column */}
          <section className="view-profile__left" aria-label="Profile Details">
            {/* Profile Summary Card */}
            <article className="view-profile__summary-card">
              <div className="view-profile__avatar">{initials}</div>
              <div className="view-profile__summary-info">
                <h1 className="view-profile__name">{name}</h1>
                <p className="view-profile__title">{jobTitle}</p>
              </div>
            </article>

            {/* About Section */}
            <section
              className="view-profile__section"
              aria-labelledby="section-heading-about"
            >
              <header className="view-profile__section-header">
                <h3 id="section-heading-about" className="view-profile__section-title">
                  About
                </h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("about")}
                  aria-expanded={expandedSections.about}
                  aria-controls="profile-section-about"
                  aria-label={expandedSections.about ? "Collapse About section" : "Expand About section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.about && (
                <div id="profile-section-about" className="view-profile__section-content" role="region" aria-labelledby="section-heading-about">
                  {hasContactDetails && (
                    <div className="view-profile__about-contact" aria-label="Basic information">
                      <div className="view-profile__about-fullname">{name}</div>
                      <div className="view-profile__about-contact-items">
                        {contactPhone && (
                          <a className="view-profile__about-contact-link" href={`tel:${contactPhone}`}>
                            {contactPhone}
                          </a>
                        )}
                        {contactEmail && (
                          <a className="view-profile__about-contact-link" href={`mailto:${contactEmail}`}>
                            {contactEmail}
                          </a>
                        )}
                        {contactLinkedin && (
                          <a
                            className="view-profile__about-contact-link"
                            href={normalizeUrl(contactLinkedin)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                  {!hasContactDetails && (
                    <div className="view-profile__empty">No basic info available</div>
                  )}
                </div>
              )}
            </section>

            {/* Cultural Interest */}
            <section className="view-profile__section" aria-labelledby="section-heading-cultural-interest">
              <header className="view-profile__section-header">
                <h3 id="section-heading-cultural-interest" className="view-profile__section-title">Cultural Interest</h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("culturalInterest")}
                  aria-expanded={expandedSections.culturalInterest}
                  aria-controls="profile-section-cultural-interest"
                  aria-label={expandedSections.culturalInterest ? "Collapse Cultural Interest section" : "Expand Cultural Interest section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.culturalInterest && (
                <div id="profile-section-cultural-interest" className="view-profile__section-content" role="region" aria-labelledby="section-heading-cultural-interest">
                  <div className="view-profile__empty">No cultural interests added</div>
                </div>
              )}
            </section>

            {/* Education */}
            <section className="view-profile__section" aria-labelledby="section-heading-education">
              <header className="view-profile__section-header">
                <h3 id="section-heading-education" className="view-profile__section-title">
                  Education
                  {getCount(profile?.education) > 0 && (
                    <span className="view-profile__section-count">
                      {getCount(profile.education)} added
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("education")}
                  aria-expanded={expandedSections.education}
                  aria-controls="profile-section-education"
                  aria-label={expandedSections.education ? "Collapse Education section" : "Expand Education section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.education && (
                <div id="profile-section-education" className="view-profile__section-content" role="region" aria-labelledby="section-heading-education">
                  {profile?.education && profile.education.length > 0 ? (
                    profile.education.map((edu, index) => (
                      <article key={index} className="view-profile__item-card">
                        <div className="view-profile__item-title">{edu.degree || "Degree"}</div>
                        {edu.institution && (
                          <div className="view-profile__item-detail">
                            <strong>Institution:</strong> {edu.institution}
                          </div>
                        )}
                        {edu.fieldOfStudy && (
                          <div className="view-profile__item-detail">
                            <strong>Field:</strong> {edu.fieldOfStudy}
                          </div>
                        )}
                        {(edu.startDate || edu.endDate) && (
                          <div className="view-profile__item-detail">
                            <strong>Duration:</strong> {edu.startDate || ""} - {edu.endDate || "Present"}
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="view-profile__empty">No education entries</div>
                  )}
                </div>
              )}
            </section>

            {/* Work Experience */}
            <section className="view-profile__section" aria-labelledby="section-heading-work-experience">
              <header className="view-profile__section-header">
                <h3 id="section-heading-work-experience" className="view-profile__section-title">
                  Work Experience
                  {getCount(profile?.workExperience) > 0 && (
                    <span className="view-profile__section-count">
                      {getCount(profile.workExperience)} added
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("workExperience")}
                  aria-expanded={expandedSections.workExperience}
                  aria-controls="profile-section-work-experience"
                  aria-label={expandedSections.workExperience ? "Collapse Work Experience section" : "Expand Work Experience section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.workExperience && (
                <div id="profile-section-work-experience" className="view-profile__section-content" role="region" aria-labelledby="section-heading-work-experience">
                  {profile?.workExperience && profile.workExperience.length > 0 ? (
                    profile.workExperience.map((exp, index) => (
                      <article key={index} className="view-profile__item-card">
                        <div className="view-profile__item-title">
                          {exp.jobTitle || "Job Title"} at {exp.company || "Company"}
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <div className="view-profile__item-detail">
                            <strong>Duration:</strong> {exp.startDate || ""} - {exp.endDate || (exp.currentlyWorking ? "Present" : "")}
                          </div>
                        )}
                        {exp.location && (
                          <div className="view-profile__item-detail">
                            <strong>Location:</strong> {exp.location}
                          </div>
                        )}
                        {exp.description && (
                          <div className="view-profile__item-detail">{exp.description}</div>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="view-profile__empty">No work experience entries</div>
                  )}
                </div>
              )}
            </section>

            {/* Skills */}
            <section className="view-profile__section" aria-labelledby="section-heading-skills">
              <header className="view-profile__section-header">
                <h3 id="section-heading-skills" className="view-profile__section-title">
                  Skills
                  {(getCount(profile?.skills) + getCount(profile?.primarySkills) + getCount(profile?.basicSkills)) > 0 && (
                    <span className="view-profile__section-count">
                      {getCount(profile.skills) + getCount(profile.primarySkills) + getCount(profile.basicSkills)} added
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("skills")}
                  aria-expanded={expandedSections.skills}
                  aria-controls="profile-section-skills"
                  aria-label={expandedSections.skills ? "Collapse Skills section" : "Expand Skills section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.skills && (
                <div id="profile-section-skills" className="view-profile__section-content" role="region" aria-labelledby="section-heading-skills">
                  {profile?.primarySkills && profile.primarySkills.length > 0 && (
                    <div className="view-profile__skill-group">
                      <div className="view-profile__item-detail-heading">
                        Primary Skills:
                      </div>
                      <div>
                        {profile.primarySkills.map((skill, index) => (
                          <span key={index} className="view-profile__skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile?.basicSkills && profile.basicSkills.length > 0 && (
                    <div className="view-profile__skill-group">
                      <div className="view-profile__item-detail-heading">
                        Basic Skills:
                      </div>
                      <div>
                        {profile.basicSkills.map((skill, index) => (
                          <span key={index} className="view-profile__skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div>
                      <div className="view-profile__item-detail-heading">
                        Skills:
                      </div>
                      <div>
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="view-profile__skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!profile?.skills || profile.skills.length === 0) &&
                    (!profile?.primarySkills || profile.primarySkills.length === 0) &&
                    (!profile?.basicSkills || profile.basicSkills.length === 0) && (
                      <div className="view-profile__empty">No skills added</div>
                    )}
                </div>
              )}
            </section>

            {/* Projects */}
            <section className="view-profile__section" aria-labelledby="section-heading-projects">
              <header className="view-profile__section-header">
                <h3 id="section-heading-projects" className="view-profile__section-title">
                  Projects
                  {getCount(profile?.projects) > 0 && (
                    <span className="view-profile__section-count">
                      {getCount(profile.projects)} added
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("projects")}
                  aria-expanded={expandedSections.projects}
                  aria-controls="profile-section-projects"
                  aria-label={expandedSections.projects ? "Collapse Projects section" : "Expand Projects section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.projects && (
                <div id="profile-section-projects" className="view-profile__section-content" role="region" aria-labelledby="section-heading-projects">
                  {profile?.projects && profile.projects.length > 0 ? (
                    profile.projects.map((proj, index) => {
                      const project = typeof proj === "string" ? { name: proj } : proj;
                      return (
                        <article key={index} className="view-profile__item-card">
                          <div className="view-profile__item-title">{project.name || "Project"}</div>
                          {project.description && (
                            <div className="view-profile__item-detail">{project.description}</div>
                          )}
                        </article>
                      );
                    })
                  ) : (
                    <div className="view-profile__empty">No projects added</div>
                  )}
                </div>
              )}
            </section>

            {/* Achievements */}
            <section className="view-profile__section" aria-labelledby="section-heading-achievements">
              <header className="view-profile__section-header">
                <h3 id="section-heading-achievements" className="view-profile__section-title">
                  Achievements
                  {getCount(profile?.achievements) > 0 && (
                    <span className="view-profile__section-count">
                      {getCount(profile.achievements)} added
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("achievements")}
                  aria-expanded={expandedSections.achievements}
                  aria-controls="profile-section-achievements"
                  aria-label={expandedSections.achievements ? "Collapse Achievements section" : "Expand Achievements section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.achievements && (
                <div id="profile-section-achievements" className="view-profile__section-content" role="region" aria-labelledby="section-heading-achievements">
                  {profile?.achievements && profile.achievements.length > 0 ? (
                    profile.achievements.map((ach, index) => {
                      const achievement = typeof ach === "string" ? { title: ach } : ach;
                      return (
                        <article key={index} className="view-profile__item-card">
                          <div className="view-profile__item-title">{achievement.title || "Achievement"}</div>
                          {achievement.description && (
                            <div className="view-profile__item-detail">{achievement.description}</div>
                          )}
                        </article>
                      );
                    })
                  ) : (
                    <div className="view-profile__empty">No achievements added</div>
                  )}
                </div>
              )}
            </section>

            {/* Certifications */}
            <section className="view-profile__section" aria-labelledby="section-heading-certifications">
              <header className="view-profile__section-header">
                <h3 id="section-heading-certifications" className="view-profile__section-title">
                  Certifications
                  {getCount(profile?.certification) > 0 && (
                    <span className="view-profile__section-count">
                      {getCount(profile.certification)} added
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  className="view-profile__chevron-btn"
                  onClick={() => toggleSection("certification")}
                  aria-expanded={expandedSections.certification}
                  aria-controls="profile-section-certifications"
                  aria-label={expandedSections.certification ? "Collapse Certifications section" : "Expand Certifications section"}
                >
                  <span className="view-profile__chevron">{chevronIcon}</span>
                </button>
              </header>
              {expandedSections.certification && (
                <div id="profile-section-certifications" className="view-profile__section-content" role="region" aria-labelledby="section-heading-certifications">
                  {profile?.certification && profile.certification.length > 0 ? (
                    profile.certification.map((cert, index) => {
                      const certification = typeof cert === "string" ? { name: cert } : cert;
                      return (
                        <article key={index} className="view-profile__item-card">
                          <div className="view-profile__item-title">{certification.name || "Certification"}</div>
                          {certification.issuedOrganization && (
                            <div className="view-profile__item-detail">
                              <strong>Organization:</strong> {certification.issuedOrganization}
                            </div>
                          )}
                        </article>
                      );
                    })
                  ) : (
                    <div className="view-profile__empty">No certifications added</div>
                  )}
                </div>
              )}
            </section>

            {/* Preference */}
            {profile?.preference && (
              <section className="view-profile__section" aria-labelledby="section-heading-preference">
                <header className="view-profile__section-header">
                  <h3 id="section-heading-preference" className="view-profile__section-title">Preference</h3>
                  <button
                    type="button"
                    className="view-profile__chevron-btn"
                    onClick={() => toggleSection("preference")}
                    aria-expanded={expandedSections.preference}
                    aria-controls="profile-section-preference"
                    aria-label={expandedSections.preference ? "Collapse Preference section" : "Expand Preference section"}
                  >
                    <span className="view-profile__chevron">{chevronIcon}</span>
                  </button>
                </header>
                {expandedSections.preference && (
                  <div id="profile-section-preference" className="view-profile__section-content" role="region" aria-labelledby="section-heading-preference">
                    <article className="view-profile__item-card">
                      {(() => {
                        const fmt = (v) => (Array.isArray(v) ? v.filter(Boolean).join(", ") : v);
                        const companySize = fmt(profile.preference.companySize);
                        const jobType = fmt(profile.preference.jobType);
                        const jobSearch = fmt(profile.preference.jobSearch);
                        return (
                          <>
                            {companySize && (
                              <div className="view-profile__item-detail">
                                <strong>Company Size:</strong> {companySize}
                              </div>
                            )}
                            {jobType && (
                              <div className="view-profile__item-detail">
                                <strong>Job Type:</strong> {jobType}
                              </div>
                            )}
                            {jobSearch && (
                              <div className="view-profile__item-detail">
                                <strong>Job Search:</strong> {jobSearch}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </article>
                  </div>
                )}
              </section>
            )}

            {/* Other Details */}
            {profile?.otherDetails && (
              <section className="view-profile__section" aria-labelledby="section-heading-other-details">
                <header className="view-profile__section-header">
                  <h3 id="section-heading-other-details" className="view-profile__section-title">Other details</h3>
                  <button
                    type="button"
                    className="view-profile__chevron-btn"
                    onClick={() => toggleSection("otherDetails")}
                    aria-expanded={expandedSections.otherDetails}
                    aria-controls="profile-section-other-details"
                    aria-label={expandedSections.otherDetails ? "Collapse Other details section" : "Expand Other details section"}
                  >
                    <span className="view-profile__chevron">{chevronIcon}</span>
                  </button>
                </header>
                {expandedSections.otherDetails && (
                  <div id="profile-section-other-details" className="view-profile__section-content" role="region" aria-labelledby="section-heading-other-details">
                    <article className="view-profile__item-card">
                      {profile.otherDetails.careerStage && (
                        <div className="view-profile__item-detail">
                          <strong>Career Stage:</strong> {profile.otherDetails.careerStage}
                        </div>
                      )}
                      {profile.otherDetails.desiredSalary && (
                        <div className="view-profile__item-detail">
                          <strong>Desired Salary:</strong> {profile.otherDetails.desiredSalary}
                        </div>
                      )}
                    </article>
                  </div>
                )}
              </section>
            )}
          </section>

          {/* Right Column - Notifications */}
          <aside className="view-profile__right" aria-label="Notifications">
            <h3 className="view-profile__notifications-header">
              Notifications {notificationsCount > 0 ? `(${notificationsCount})` : ""}
            </h3>
            
            {loadingNotifications ? (
              <div className="view-profile__notifications-status" role="status" aria-live="polite">
                Loading notifications...
              </div>
            ) : notificationsCount === 0 ? (
              <div className="view-profile__notifications-status" role="status" aria-live="polite">
                No notifications available
              </div>
            ) : (
              <div className="view-profile__notifications-list">
                {invites.length > 0 && (
                  <section className="view-profile__notifications-section" aria-label="Invites">
                    <div className="view-profile__notifications-section-title">Invites</div>
                    {invites.map((invite, index) => {
                      const inviteId = invite.inviteId ?? invite.id;
                      return (
                      <article
                        key={inviteId || `${invite.jobId || "invite"}-${index}`}
                        className="view-profile__notification-card"
                      >
                        <p className="view-profile__notification-text">
                          {invite.message ||
                            `Recruiter from ${invite.companyName || "a company"} sent an invitation request for ${
                              invite.jobRole || "a job"
                            }.`}
                        </p>
                        {invite.invitedAt && (
                          <time
                            dateTime={invite.invitedAt}
                            className="view-profile__notification-time"
                          >
                            {new Date(invite.invitedAt).toLocaleString()}
                          </time>
                        )}
                        <div className="view-profile__notification-buttons">
                          {invite.jobId && (
                            <button
                              type="button"
                              className="view-profile__accept-btn"
                              onClick={() => {
                                navigate("/student/my-jobs", {
                                  state: { selectedJobId: invite.jobId },
                                });
                              }}
                            >
                              View in My Jobs
                            </button>
                          )}
                          {inviteId && (
                            <button
                              type="button"
                              className="view-profile__delete-btn"
                              onClick={() => handleDeleteInvite(inviteId)}
                              disabled={deletingInviteId === inviteId}
                              aria-label="Delete invitation"
                            >
                              {deletingInviteId === inviteId ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                      </article>
                    );
                    })}
                  </section>
                )}

                {recruiterActions.length > 0 && (
                  <section
                    className="view-profile__notifications-section"
                    aria-label="Recruiter actions"
                  >
                    <div className="view-profile__notifications-section-title">
                      Recruiter Updates
                    </div>
                    {recruiterActions.map((action, index) => (
                      <article
                        key={action.applicationId || `${action.jobId || "action"}-${index}`}
                        className="view-profile__notification-card"
                      >
                        <p className="view-profile__notification-text">
                          {action.message ||
                            `Recruiter update for ${action.jobRole || "a job"} at ${
                              action.companyName || "a company"
                            }.`}
                        </p>
                        {(action.status || action.companyName || action.jobRole) && (
                          <p className="view-profile__notification-meta">
                            {action.companyName ? <strong>{action.companyName}</strong> : null}
                            {action.companyName && action.jobRole ? " • " : null}
                            {action.jobRole || null}
                            {action.status ? ` • ${action.status}` : ""}
                          </p>
                        )}
                        {action.timestamp && (
                          <time
                            dateTime={action.timestamp}
                            className="view-profile__notification-time"
                          >
                            {new Date(action.timestamp).toLocaleString()}
                          </time>
                        )}
                      </article>
                    ))}
                  </section>
                )}

                {recommendedJobs.length > 0 && (
                  <section
                    className="view-profile__notifications-section"
                    aria-label="Recommended jobs"
                  >
                    <div className="view-profile__notifications-section-title">
                      Recommended Jobs
                    </div>
                    {recommendedJobs.map((rec, index) => {
                      const job = rec?.job || {};
                      const jobId = job.id;
                      const companyName = job.companyName || job.employer?.companyName || "Company";
                      const title = job.role || "Job";
                      const match = rec?.matchPercentage ?? rec?.skillMatchPercentage ?? 0;

                      return (
                        <article
                          key={jobId || `${companyName}-${title}-${index}`}
                          className="view-profile__notification-card"
                        >
                          <p className="view-profile__notification-text">
                            <strong>{title}</strong> at <strong>{companyName}</strong>
                          </p>
                          {job.location && (
                            <p className="view-profile__notification-meta">{job.location}</p>
                          )}
                          {match ? (
                            <p className="view-profile__notification-meta">{match}% match</p>
                          ) : null}
                          {Array.isArray(rec?.missingSkills) && rec.missingSkills.length > 0 && (
                            <p className="view-profile__notification-meta">
                              Missing skills: {rec.missingSkills.slice(0, 4).join(", ")}
                              {rec.missingSkills.length > 4 ? "…" : ""}
                            </p>
                          )}
                          <div className="view-profile__notification-buttons">
                            <button
                              type="button"
                              className="view-profile__accept-btn"
                              disabled={!jobId}
                              onClick={() => {
                                if (!jobId) return;
                                navigate("/student/my-jobs", {
                                  state: { selectedJobId: jobId, autoApply: true },
                                });
                              }}
                            >
                              Apply
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                )}

                {legacyNotifications.length > 0 && (
                  <section
                    className="view-profile__notifications-section"
                    aria-label="Notifications"
                  >
                    <div className="view-profile__notifications-section-title">Other</div>
                    {legacyNotifications.map((notification, index) => {
                      const jobId = notification.jobId || notification.job?.id;
                      const isJobInvitation = notification.type === "JOB_INVITATION" || jobId;

                      return (
                        <article
                          key={notification.id || index}
                          className="view-profile__notification-card"
                        >
                          <p className="view-profile__notification-text">
                            {notification.message || notification.text || "New notification"}
                          </p>
                          {notification.createdAt && (
                            <time
                              dateTime={notification.createdAt}
                              className="view-profile__notification-time"
                            >
                              {new Date(notification.createdAt).toLocaleString()}
                            </time>
                          )}
                          {isJobInvitation && (
                            <div className="view-profile__notification-buttons">
                              <button
                                type="button"
                                className="view-profile__accept-btn"
                                onClick={() => {
                                  navigate("/student/my-jobs", {
                                    state: jobId ? { selectedJobId: jobId } : {},
                                  });
                                }}
                              >
                                View in My Jobs
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </section>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Chat Widget */}
      {showChatWidget && <ChatWidget onClose={() => setShowChatWidget(false)} />}
      
      {/* Toast */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "error" })}
        />
      )}

      <TourOverlay
        open={showTour}
        steps={[
          {
            title: "Home",
            body: "Your profile overview and recommended next steps live here.",
            target: '[data-tour="student-nav-home"]',
          },
          {
            title: "My Jobs",
            body: "Track jobs you've applied to and see updates in one place.",
            target: '[data-tour="student-nav-myjobs"]',
          },
          {
            title: "Dashboard",
            body: "Quick insights, notifications, and activity summary.",
            target: '[data-tour="student-nav-dashboard"]',
          },
          {
            title: "AI Career Coach",
            body: "Use the coach to improve your resume, answers, and job search strategy.",
            target: '[data-tour="student-ai-coach"]',
          },
        ]}
        storageKey="tour:student:mainNav:v1"
        onClose={() => setShowTour(false)}
      />
    </div>
  );
}







