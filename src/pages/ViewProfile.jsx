import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../services/profileService";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import ChatWidget from "../components/ChatWidget";
import { useProfile } from "../context/ProfileContext";

export default function ViewProfile() {
  const navigate = useNavigate();
  const { profile: contextProfile } = useProfile();
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
        console.log("Fetched profile data:", data);
        
        if (data && Object.keys(data).length > 0) {
          setProfile(data);
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
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getCount = (array) => {
    if (!array) return 0;
    return Array.isArray(array) ? array.length : 0;
  };

  const completionPercentage = useMemo(() => {
    if (!profile) return 0;
    return calculateProfileCompletion(profile);
  }, [profile]);

  // Calculate SVG circle progress
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

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
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontWeight: 600,
      fontSize: "18px",
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
      padding: "24px 40px",
    },
    banner: {
      background: "linear-gradient(90deg, #15803d 0%, #16a34a 100%)",
      borderRadius: "16px",
      padding: "32px 40px",
      marginBottom: "32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "relative",
      overflow: "visible",
      minHeight: "140px",
    },
    bannerLeft: {
      flex: 1,
      zIndex: 2,
    },
    bannerSmallText: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#ffffff",
      marginBottom: "8px",
      opacity: 0.95,
    },
    bannerTitle: {
      fontSize: "32px",
      fontWeight: 700,
      color: "#ffffff",
      margin: "0 0 16px 0",
      lineHeight: "1.2",
    },
    updateProfileBtn: {
      background: "#374151",
      color: "#ffffff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
    },
    progressContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      position: "relative",
      flexShrink: 0,
      marginLeft: "24px",
    },
    progressCircleWrapper: {
      width: "110px",
      height: "110px",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    innerWhiteCircle: {
      width: "100px",
      height: "100px",
      background: "#ffffff",
      borderRadius: "50%",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      zIndex: 3,
    },
    svg: {
      position: "absolute",
      top: "0",
      left: "0",
      transform: "rotate(-90deg)",
      zIndex: 2,
    },
    progressRing: {
      fill: "none",
      stroke: "#16a34a",
      strokeWidth: "4",
    },
    progressFill: {
      fill: "none",
      stroke: "#16a34a",
      strokeWidth: "4",
      strokeLinecap: "round",
      transition: "stroke-dashoffset 0.6s ease",
    },
    progressNumber: {
      fontSize: "42px",
      fontWeight: 700,
      color: "#111827",
      lineHeight: 1,
      marginBottom: "4px",
    },
    progressLabel: {
      fontSize: "11px",
      fontWeight: 500,
      color: "#6b7280",
      lineHeight: 1.3,
      textAlign: "center",
    },
    content: {
      display: "flex",
      gap: "24px",
    },
    leftColumn: {
      flex: "0 0 65%",
    },
    rightColumn: {
      flex: "0 0 35%",
    },
    profileCard: {
      background: "#fef3c7",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    profilePicture: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "#16a34a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "24px",
      fontWeight: 600,
      flexShrink: 0,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "4px",
    },
    profileTitle: {
      fontSize: "14px",
      color: "#6b7280",
    },
    editIcon: {
      cursor: "pointer",
      fontSize: "18px",
      color: "#6b7280",
    },
    sectionCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    sectionCount: {
      fontSize: "14px",
      color: "#6b7280",
      fontWeight: 400,
    },
    chevronButton: {
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      background: "#f3f4f6",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    getChevronIcon: (expanded) => ({
      fontSize: "16px",
      color: "#6b7280",
      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s",
      display: "inline-block",
    }),
    sectionContent: {
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid #e5e7eb",
    },
    aboutText: {
      fontSize: "14px",
      color: "#374151",
      lineHeight: "1.6",
    },
    itemCard: {
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "12px",
    },
    itemTitle: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "8px",
    },
    itemDetail: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    skillTag: {
      display: "inline-block",
      background: "#eff6ff",
      color: "#1e40af",
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "13px",
      marginRight: "8px",
      marginBottom: "8px",
    },
    notificationsHeader: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "16px",
    },
    notificationCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    notificationText: {
      fontSize: "14px",
      color: "#374151",
      marginBottom: "8px",
    },
    notificationTime: {
      fontSize: "12px",
      color: "#9ca3af",
      marginBottom: "12px",
    },
    notificationButtons: {
      display: "flex",
      gap: "12px",
      marginBottom: "12px",
    },
    acceptBtn: {
      background: "#16a34a",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 500,
    },
    declineBtn: {
      background: "#ffffff",
      color: "#374151",
      border: "1px solid #e5e7eb",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 500,
    },
    warningBox: {
      background: "#fff1f2",
      border: "1px solid #fecdd3",
      borderRadius: "6px",
      padding: "12px",
      fontSize: "12px",
      color: "#991b1b",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7280",
    },
    error: {
      background: "#fff1f2",
      border: "1px solid #ef4444",
      borderRadius: "8px",
      padding: "16px",
      color: "#ef4444",
      textAlign: "center",
      margin: "40px",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>{error}</div>
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

  return (
    <div style={styles.page}>
      {/* Top Navigation */}
      <nav style={styles.topNav}>
        <div style={styles.logo}>
          <span>Sudburry</span>
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navLinkActive}>Home</span>
          <span 
            style={styles.navLink}
            onClick={() => navigate("/student/my-jobs")}
          >
            My Jobs
          </span>
          <span 
            style={styles.navLink}
            onClick={() => navigate("/student/dashboard")}
          >
            Dashboard
          </span>
        </div>
        <div style={styles.userActions}>
          <span 
            style={styles.userActionLink}
            onClick={() => {
              // Clear all stored data
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("profileData");
              localStorage.removeItem("profileEditMode");
              // Navigate to login page
              navigate("/");
            }}
          >
            Log Out
          </span>
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
        {/* Orange Banner */}
        <div style={styles.banner}>
          <div style={styles.bannerLeft}>
            <div style={styles.bannerSmallText}>Make your profile</div>
            <h2 style={styles.bannerTitle}>Standout from 1000s of candidates</h2>
            <button
              style={styles.updateProfileBtn}
              onClick={() => {
                // Set edit mode flag before navigating
                localStorage.setItem("profileEditMode", "true");
                navigate("/student/profile");
              }}
            >
              Update Profile
            </button>
          </div>
          <div style={styles.progressContainer}>
            <div style={styles.progressCircleWrapper}>
              <svg width="110" height="110" viewBox="0 0 110 110" style={styles.svg}>
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  style={styles.progressRing}
                />
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  style={styles.progressFill}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div style={styles.innerWhiteCircle}>
                <div style={styles.progressNumber}>{completionPercentage}</div>
                <div style={styles.progressLabel}>
                  Profile<br />Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.content}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Profile Summary Card */}
            <div style={styles.profileCard}>
              <div style={styles.profilePicture}>{initials}</div>
              <div style={styles.profileInfo}>
                <div style={styles.profileName}>{name}</div>
                <div style={styles.profileTitle}>{jobTitle}</div>
              </div>
              <span style={styles.editIcon}>✏️</span>
            </div>

            {/* About Section */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("about")}
              >
                <h3 style={styles.sectionTitle}>
                  About
                  <span style={{ fontSize: "14px" }}>✏️</span>
                </h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.about)}>▼</span>
                </button>
              </div>
              {expandedSections.about && (
                <div style={styles.sectionContent}>
                  <div style={styles.aboutText}>
                    {profile?.otherDetails?.otherDetailsText ||
                      profile?.basicInfo?.summary ||
                      "No about information available."}
                  </div>
                </div>
              )}
            </div>

            {/* Cultural Interest */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("culturalInterest")}
              >
                <h3 style={styles.sectionTitle}>Cultural Interest</h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.culturalInterest)}>▼</span>
                </button>
              </div>
              {expandedSections.culturalInterest && (
                <div style={styles.sectionContent}>
                  <div style={styles.emptyState}>No cultural interests added</div>
                </div>
              )}
            </div>

            {/* Education */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("education")}
              >
                <h3 style={styles.sectionTitle}>
                  Education
                  {getCount(profile?.education) > 0 && (
                    <span style={styles.sectionCount}>
                      {getCount(profile.education)} added
                    </span>
                  )}
                </h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.education)}>▼</span>
                </button>
              </div>
              {expandedSections.education && (
                <div style={styles.sectionContent}>
                  {profile?.education && profile.education.length > 0 ? (
                    profile.education.map((edu, index) => (
                      <div key={index} style={styles.itemCard}>
                        <div style={styles.itemTitle}>{edu.degree || "Degree"}</div>
                        {edu.institution && (
                          <div style={styles.itemDetail}>
                            <strong>Institution:</strong> {edu.institution}
                          </div>
                        )}
                        {edu.fieldOfStudy && (
                          <div style={styles.itemDetail}>
                            <strong>Field:</strong> {edu.fieldOfStudy}
                          </div>
                        )}
                        {(edu.startDate || edu.endDate) && (
                          <div style={styles.itemDetail}>
                            <strong>Duration:</strong> {edu.startDate || ""} - {edu.endDate || "Present"}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyState}>No education entries</div>
                  )}
                </div>
              )}
            </div>

            {/* Work Experience */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("workExperience")}
              >
                <h3 style={styles.sectionTitle}>
                  Work Experience
                  {getCount(profile?.workExperience) > 0 && (
                    <span style={styles.sectionCount}>
                      {getCount(profile.workExperience)} added
                    </span>
                  )}
                </h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.workExperience)}>▼</span>
                </button>
              </div>
              {expandedSections.workExperience && (
                <div style={styles.sectionContent}>
                  {profile?.workExperience && profile.workExperience.length > 0 ? (
                    profile.workExperience.map((exp, index) => (
                      <div key={index} style={styles.itemCard}>
                        <div style={styles.itemTitle}>
                          {exp.jobTitle || "Job Title"} at {exp.company || "Company"}
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <div style={styles.itemDetail}>
                            <strong>Duration:</strong> {exp.startDate || ""} - {exp.endDate || exp.currentlyWorking ? "Present" : ""}
                          </div>
                        )}
                        {exp.location && (
                          <div style={styles.itemDetail}>
                            <strong>Location:</strong> {exp.location}
                          </div>
                        )}
                        {exp.description && (
                          <div style={styles.itemDetail}>{exp.description}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyState}>No work experience entries</div>
                  )}
                </div>
              )}
            </div>

            {/* Skills */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("skills")}
              >
                <h3 style={styles.sectionTitle}>
                  Skills
                  {(getCount(profile?.skills) + getCount(profile?.primarySkills) + getCount(profile?.basicSkills)) > 0 && (
                    <span style={styles.sectionCount}>
                      {getCount(profile.skills) + getCount(profile.primarySkills) + getCount(profile.basicSkills)} added
                    </span>
                  )}
                </h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.skills)}>▼</span>
                </button>
              </div>
              {expandedSections.skills && (
                <div style={styles.sectionContent}>
                  {profile?.primarySkills && profile.primarySkills.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ ...styles.itemDetail, fontWeight: 600, marginBottom: "8px" }}>
                        Primary Skills:
                      </div>
                      <div>
                        {profile.primarySkills.map((skill, index) => (
                          <span key={index} style={styles.skillTag}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile?.basicSkills && profile.basicSkills.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ ...styles.itemDetail, fontWeight: 600, marginBottom: "8px" }}>
                        Basic Skills:
                      </div>
                      <div>
                        {profile.basicSkills.map((skill, index) => (
                          <span key={index} style={styles.skillTag}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div>
                      <div style={{ ...styles.itemDetail, fontWeight: 600, marginBottom: "8px" }}>
                        Skills:
                      </div>
                      <div>
                        {profile.skills.map((skill, index) => (
                          <span key={index} style={styles.skillTag}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!profile?.skills || profile.skills.length === 0) &&
                    (!profile?.primarySkills || profile.primarySkills.length === 0) &&
                    (!profile?.basicSkills || profile.basicSkills.length === 0) && (
                      <div style={styles.emptyState}>No skills added</div>
                    )}
                </div>
              )}
            </div>

            {/* Projects */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("projects")}
              >
                <h3 style={styles.sectionTitle}>
                  Projects
                  {getCount(profile?.projects) > 0 && (
                    <span style={styles.sectionCount}>
                      {getCount(profile.projects)} added
                    </span>
                  )}
                </h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.projects)}>▼</span>
                </button>
              </div>
              {expandedSections.projects && (
                <div style={styles.sectionContent}>
                  {profile?.projects && profile.projects.length > 0 ? (
                    profile.projects.map((proj, index) => {
                      const project = typeof proj === "string" ? { name: proj } : proj;
                      return (
                        <div key={index} style={styles.itemCard}>
                          <div style={styles.itemTitle}>{project.name || "Project"}</div>
                          {project.description && (
                            <div style={styles.itemDetail}>{project.description}</div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={styles.emptyState}>No projects added</div>
                  )}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("achievements")}
              >
                <h3 style={styles.sectionTitle}>
                  Achievements
                  {getCount(profile?.achievements) > 0 && (
                    <span style={styles.sectionCount}>
                      {getCount(profile.achievements)} added
                    </span>
                  )}
                </h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.achievements)}>▼</span>
                </button>
              </div>
              {expandedSections.achievements && (
                <div style={styles.sectionContent}>
                  {profile?.achievements && profile.achievements.length > 0 ? (
                    profile.achievements.map((ach, index) => {
                      const achievement = typeof ach === "string" ? { title: ach } : ach;
                      return (
                        <div key={index} style={styles.itemCard}>
                          <div style={styles.itemTitle}>{achievement.title || "Achievement"}</div>
                          {achievement.description && (
                            <div style={styles.itemDetail}>{achievement.description}</div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={styles.emptyState}>No achievements added</div>
                  )}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div style={styles.sectionCard}>
              <div
                style={styles.sectionHeader}
                onClick={() => toggleSection("certification")}
              >
                <h3 style={styles.sectionTitle}>
                  Certifications
                  {getCount(profile?.certification) > 0 && (
                    <span style={styles.sectionCount}>
                      {getCount(profile.certification)} added
                    </span>
                  )}
                </h3>
                <button style={styles.chevronButton}>
                  <span style={styles.getChevronIcon(expandedSections.certification)}>▼</span>
                </button>
              </div>
              {expandedSections.certification && (
                <div style={styles.sectionContent}>
                  {profile?.certification && profile.certification.length > 0 ? (
                    profile.certification.map((cert, index) => {
                      const certification = typeof cert === "string" ? { name: cert } : cert;
                      return (
                        <div key={index} style={styles.itemCard}>
                          <div style={styles.itemTitle}>{certification.name || "Certification"}</div>
                          {certification.issuedOrganization && (
                            <div style={styles.itemDetail}>
                              <strong>Organization:</strong> {certification.issuedOrganization}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div style={styles.emptyState}>No certifications added</div>
                  )}
                </div>
              )}
            </div>

            {/* Preference */}
            {profile?.preference && (
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("preference")}
                >
                  <h3 style={styles.sectionTitle}>Preference</h3>
                  <button style={styles.chevronButton}>
                    <span style={styles.getChevronIcon(expandedSections.preference)}>▼</span>
                  </button>
                </div>
                {expandedSections.preference && (
                  <div style={styles.sectionContent}>
                    <div style={styles.itemCard}>
                      {profile.preference.companySize && (
                        <div style={styles.itemDetail}>
                          <strong>Company Size:</strong> {profile.preference.companySize}
                        </div>
                      )}
                      {profile.preference.jobType && (
                        <div style={styles.itemDetail}>
                          <strong>Job Type:</strong> {profile.preference.jobType}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other Details */}
            {profile?.otherDetails && (
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("otherDetails")}
                >
                  <h3 style={styles.sectionTitle}>Other details</h3>
                  <button style={styles.chevronButton}>
                    <span style={styles.getChevronIcon(expandedSections.otherDetails)}>▼</span>
                  </button>
                </div>
                {expandedSections.otherDetails && (
                  <div style={styles.sectionContent}>
                    <div style={styles.itemCard}>
                      {profile.otherDetails.careerStage && (
                        <div style={styles.itemDetail}>
                          <strong>Career Stage:</strong> {profile.otherDetails.careerStage}
                        </div>
                      )}
                      {profile.otherDetails.desiredSalary && (
                        <div style={styles.itemDetail}>
                          <strong>Desired Salary:</strong> {profile.otherDetails.desiredSalary}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Notifications */}
          <div style={styles.rightColumn}>
            <h3 style={styles.notificationsHeader}>Notifications (2 Unread)</h3>
            
            <div style={styles.notificationCard}>
              <div style={styles.notificationText}>
                Recruiter from Meta sent an invitation request for a matching job
              </div>
              <div style={styles.notificationTime}>3 minutes ago</div>
              <div style={styles.notificationButtons}>
                <button style={styles.acceptBtn}>Accept request</button>
                <button style={styles.declineBtn}>Decline request</button>
              </div>
              <div style={styles.warningBox}>
                <span>⚠️</span>
                <span>48-hours for accept the job request. After that, It will automatically decline.</span>
              </div>
            </div>

            <div style={styles.notificationCard}>
              <div style={styles.notificationText}>
                Recruiter from Amazon sent an invitation request for a matching job
              </div>
              <div style={styles.notificationTime}>5 minutes ago</div>
              <div style={styles.notificationButtons}>
                <button style={styles.acceptBtn}>Accept request</button>
                <button style={styles.declineBtn}>Decline request</button>
              </div>
              <div style={styles.warningBox}>
                <span>⚠️</span>
                <span>48-hours for accept the job request. After that, It will automatically decline.</span>
              </div>
            </div>

            <div style={styles.notificationCard}>
              <div style={styles.notificationText}>
                Talent recruiter from Google viewed your profile
              </div>
              <div style={styles.notificationTime}>10 minutes ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      {showChatWidget && <ChatWidget onClose={() => setShowChatWidget(false)} />}
    </div>
  );
}
