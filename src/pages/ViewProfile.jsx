import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser, getToken } from "../services/authService";
import { fetchProfile, updateProfile } from "../services/profileService";
import { fetchJobseekerNotifications } from "../services/jobService";
import { calculateProfileCompletion } from "../utils/profileCompletion";
import ChatWidget from "../components/ChatWidget";
import { useProfile } from "../context/ProfileContext";
import Toast from "../components/Toast";
import TourOverlay from "../components/TourOverlay";

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
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
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
          // Initialize about text from otherDetails.otherDetailsText
          setAboutText(data.otherDetails?.otherDetailsText || "");
        } else {
          setProfile({});
          setError("No profile data found. Please complete your profile first.");
          setAboutText("");
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
        setNotifications(data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setNotifications([]);
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
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "24px 40px",
    },
    banner: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)",
      borderRadius: "20px",
      padding: "40px 48px",
      marginBottom: "40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      minHeight: "160px",
      boxShadow: "0 10px 30px rgba(22, 163, 74, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)",
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
      background: "rgba(255, 255, 255, 0.2)",
      color: "#ffffff",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      padding: "12px 28px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 600,
      backdropFilter: "blur(10px)",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
      background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2), 0 2px 4px rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s ease",
      border: "1px solid rgba(251, 191, 36, 0.2)",
    },
    profilePicture: {
      width: "72px",
      height: "72px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "28px",
      fontWeight: 700,
      flexShrink: 0,
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      border: "3px solid rgba(255, 255, 255, 0.3)",
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
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
      transition: "all 0.3s ease",
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
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
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
      whiteSpace: "pre-wrap",
      marginBottom: "12px",
    },
    aboutTextarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      fontFamily: "inherit",
      resize: "vertical",
      outline: "none",
      minHeight: "120px",
      lineHeight: "1.6",
    },
    aboutActions: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
      marginTop: "12px",
    },
    aboutEditBtn: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
      marginTop: "12px",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
    },
    aboutSaveBtn: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
    },
    aboutCancelBtn: {
      background: "#f3f4f6",
      color: "#374151",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 500,
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
    applyJobsBtn: {
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      width: "100%",
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
          <span style={styles.navLinkActive} data-tour="student-nav-home">Home</span>
          <span 
            style={styles.navLink}
            onClick={() => navigate("/student/my-jobs")}
            data-tour="student-nav-myjobs"
          >
            My Jobs
          </span>
          <span 
            style={styles.navLink}
            onClick={() => navigate("/student/dashboard")}
            data-tour="student-nav-dashboard"
          >
            Dashboard
          </span>
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
            data-tour="student-ai-coach"
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
                  {isEditingAbout ? (
                    <div>
                      <textarea
                        style={styles.aboutTextarea}
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={6}
                      />
                      <div style={styles.aboutActions}>
                        <button
                          style={styles.aboutCancelBtn}
                          onClick={() => {
                            setIsEditingAbout(false);
                            // Reset to original value
                            setAboutText(profileToUse?.otherDetails?.otherDetailsText || "");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          style={styles.aboutSaveBtn}
                          onClick={async () => {
                            setSavingAbout(true);
                            try {
                              const email = getEmail();
                              if (!email) {
                                setToast({ message: "Email not found", type: "error" });
                                setSavingAbout(false);
                                return;
                              }

                              // Get current profile
                              const currentProfile = profileToUse || {};
                              
                              // Update profile with new about text in otherDetails
                              const updatedProfile = {
                                ...currentProfile,
                                otherDetails: {
                                  ...currentProfile.otherDetails,
                                  otherDetailsText: aboutText,
                                },
                              };

                              await updateProfile(updatedProfile);
                              
                              // Update local state
                              setProfile(updatedProfile);
                              loadProfileData(updatedProfile);
                              
                              setIsEditingAbout(false);
                              setToast({ message: "About section updated successfully!", type: "success" });
                            } catch (error) {
                              console.error("Error updating about:", error);
                              setToast({ message: `Failed to update: ${error.message}`, type: "error" });
                            } finally {
                              setSavingAbout(false);
                            }
                          }}
                          disabled={savingAbout}
                        >
                          {savingAbout ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={styles.aboutText}>
                        {aboutText || "No about information available. Click Edit to add information about yourself."}
                      </div>
                      <button
                        style={styles.aboutEditBtn}
                        onClick={() => setIsEditingAbout(true)}
                      >
                        {aboutText ? "Edit" : "Add About"}
                      </button>
                    </div>
                  )}
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
            <h3 style={styles.notificationsHeader}>
              Notifications {notifications.length > 0 ? `(${notifications.filter(n => !n.read).length} Unread)` : ""}
            </h3>
            
            {loadingNotifications ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                No notifications available
              </div>
            ) : (
              notifications.map((notification, index) => {
                const jobId = notification.jobId || notification.job?.id;
                const isJobInvitation = notification.type === "JOB_INVITATION" || jobId;
                
                return (
                  <div key={notification.id || index} style={styles.notificationCard}>
                    <div style={styles.notificationText}>
                      {notification.message || notification.text || "New notification"}
                    </div>
                    {notification.createdAt && (
                      <div style={styles.notificationTime}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    )}
                    {isJobInvitation && (
                      <div style={styles.notificationButtons}>
                        <button 
                          style={styles.acceptBtn}
                          onClick={() => {
                            // Navigate to My Jobs page to apply
                            // Pass jobId in state if available
                            navigate("/student/my-jobs", { 
                              state: jobId ? { selectedJobId: jobId } : {} 
                            });
                          }}
                        >
                          Accept request
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

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
            body: "Track jobs you’ve applied to and see updates in one place.",
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
