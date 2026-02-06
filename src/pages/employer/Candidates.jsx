import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllJobseekerProfiles } from "../../services/profileService";
import Toast from "../../components/Toast";

export default function Candidates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    about: true,
    culturalInterest: false,
    education: false,
    workExperience: false,
    skills: false,
    projects: false,
    achievements: false,
    certifications: false,
    preference: false,
    otherDetails: false,
  });

  // Candidates will be fetched from API
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "error" });

  // Filter candidates based on search
  const filteredCandidates = candidates.filter((candidate) => {
    if (!candidate) return false;
    const nameMatch = candidate.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const titleMatch = candidate.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const skillsMatch = candidate.skills?.some((skill) =>
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || titleMatch || skillsMatch;
  });

  // Set first candidate as selected by default
  useEffect(() => {
    if (!selectedCandidate && filteredCandidates.length > 0) {
      setSelectedCandidate(filteredCandidates[0]);
    }
  }, [filteredCandidates, selectedCandidate]);

  // Transform profile data to candidate format
  const transformProfileToCandidate = (profile) => {
    const fullName = profile.fullName || profile.basicInfo?.name || "Unknown";
    const email = profile.email || profile.basicInfo?.email || "";
    
    // Calculate years of experience from work experience
    let yearsOfExperience = 0;
    if (profile.workExperience && profile.workExperience.length > 0) {
      const experiences = profile.workExperience.map((exp) => {
        const startYear = exp.startDate ? parseInt(exp.startDate.toString().substring(0, 4)) : new Date().getFullYear();
        const endYear = exp.endDate 
          ? parseInt(exp.endDate.toString().substring(0, 4))
          : exp.currentlyWorking 
            ? new Date().getFullYear()
            : new Date().getFullYear();
        return endYear - startYear;
      });
      yearsOfExperience = Math.max(...experiences, 0);
    }

    // Get location from profile
    const location = profile.city || profile.location || profile.otherDetails?.location || "Location not specified";

    // Get title/role from most recent work experience or skills
    let title = "Job Seeker";
    if (profile.workExperience && profile.workExperience.length > 0) {
      title = profile.workExperience[0].jobTitle || "Job Seeker";
    }

    return {
      id: profile.id || email,
      name: fullName,
      title: title,
      status: "Active",
      location: location,
      experience: yearsOfExperience > 0 ? `${yearsOfExperience} Yrs` : "No experience",
      matching: 0, // Matching percentage would come from a separate calculation
      profilePic: fullName.charAt(0).toUpperCase(),
      about: profile.summary || profile.basicInfo?.summary || "No description available.",
      education: profile.education || [],
      workExperience: profile.workExperience || [],
      skills: profile.skills || profile.primarySkills || [],
      projects: profile.projects || [],
      achievements: profile.achievements || [],
      certifications: profile.certification || profile.certifications || [],
      preference: profile.preference || null,
      otherDetails: profile.otherDetails || null,
      email: email,
      phone: profile.phone || profile.basicInfo?.phone || "",
      linkedin: profile.linkedin || profile.basicInfo?.linkedin || "",
    };
  };

  // Fetch candidates from API
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const profiles = await fetchAllJobseekerProfiles();
        const transformedCandidates = profiles.map(transformProfileToCandidate);
        setCandidates(transformedCandidates);
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
      background: "linear-gradient(135deg, #16a34a, #15803d)",
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
    postJobBtn: {
      background: "#ef4444",
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
      display: "flex",
      height: "calc(100vh - 80px)",
    },
    leftPanel: {
      width: "400px",
      background: "#ffffff",
      borderRight: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    searchSection: {
      padding: "20px",
      borderBottom: "1px solid #e5e7eb",
    },
    searchBar: {
      display: "flex",
      alignItems: "center",
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "10px 16px",
      gap: "8px",
      marginBottom: "12px",
    },
    searchInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: "14px",
      flex: 1,
      color: "#6b7280",
    },
    filtersBtn: {
      background: "linear-gradient(90deg, #16a34a, #15803d)",
      color: "#ffffff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      width: "100%",
    },
    candidatesList: {
      flex: 1,
      overflowY: "auto",
      padding: "16px",
    },
    candidateCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      border: "1px solid #e5e7eb",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    candidateCardSelected: {
      background: "#eff6ff",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      border: "2px solid #16a34a",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    candidateCardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "12px",
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
    candidateTitle: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "4px",
    },
    activeTag: {
      background: "#d1fae5",
      color: "#065f46",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: 500,
    },
    candidateDetails: {
      fontSize: "11px",
      color: "#9ca3af",
      marginBottom: "4px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    matchingBadge: {
      background: "#fef3c7",
      color: "#92400e",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: 600,
      marginTop: "8px",
      display: "inline-block",
    },
    rightPanel: {
      flex: 1,
      background: "#ffffff",
      overflowY: "auto",
      padding: "32px",
    },
    profileHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "20px",
      marginBottom: "32px",
      paddingBottom: "24px",
      borderBottom: "1px solid #e5e7eb",
    },
    profilePicLarge: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "40px",
      flexShrink: 0,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "4px",
    },
    profileTitle: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "16px",
    },
    sendInviteBtn: {
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
    },
    matchingScore: {
      background: "#fef3c7",
      color: "#92400e",
      padding: "8px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600,
      alignSelf: "flex-start",
    },
    sectionCard: {
      marginBottom: "16px",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      overflow: "hidden",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      background: "#f9fafb",
      cursor: "pointer",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
    },
    sectionCount: {
      fontSize: "12px",
      color: "#6b7280",
      marginLeft: "8px",
    },
    sectionContent: {
      padding: "20px",
      background: "#ffffff",
    },
    sectionText: {
      fontSize: "14px",
      color: "#374151",
      lineHeight: "1.6",
    },
    listItem: {
      padding: "12px 0",
      borderBottom: "1px solid #f3f4f6",
    },
    listItemLast: {
      padding: "12px 0",
      borderBottom: "none",
    },
    itemTitle: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "4px",
    },
    itemSubtitle: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "2px",
    },
    skillsList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },
    skillTag: {
      background: "#eff6ff",
      color: "#1e40af",
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: 500,
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
          <span style={styles.navLinkActive}>Candidates</span>
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
        {/* Left Panel - Candidate List */}
        <div style={styles.leftPanel}>
          <div style={styles.searchSection}>
            <div style={styles.searchBar}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by skills: UX Design, Python Developer"
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button style={styles.filtersBtn}>Filters</button>
          </div>

          <div style={styles.candidatesList}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                Loading candidates...
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                {searchQuery ? "No candidates found matching your search." : "No candidates available."}
              </div>
            ) : (
              filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  style={
                    selectedCandidate?.id === candidate.id
                      ? styles.candidateCardSelected
                      : styles.candidateCard
                  }
                  onClick={() => setSelectedCandidate(candidate)}
                >
                <div style={styles.candidateCardHeader}>
                  <div style={styles.candidatePic}>{candidate.profilePic}</div>
                  <div style={styles.candidateInfo}>
                    <div style={styles.candidateName}>{candidate.name}</div>
                    <div style={styles.candidateTitle}>{candidate.title}</div>
                  </div>
                  <div style={styles.activeTag}>{candidate.status}</div>
                </div>
                <div style={styles.candidateDetails}>
                  <span>📍</span>
                  <span>{candidate.location}</span>
                </div>
                <div style={styles.candidateDetails}>
                  <span>💼</span>
                  <span>Experience: {candidate.experience}</span>
                </div>
                <div style={styles.matchingBadge}>
                  {candidate.matching}% Matching
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Candidate Details */}
        <div style={styles.rightPanel}>
          {selectedCandidate ? (
            <>
              <div style={styles.profileHeader}>
                <div style={styles.profilePicLarge}>
                  {selectedCandidate.profilePic}
                </div>
                <div style={styles.profileInfo}>
                  <div style={styles.profileName}>{selectedCandidate.name}</div>
                  <div style={styles.profileTitle}>{selectedCandidate.title}</div>
                  <button style={styles.sendInviteBtn}>
                    Send Invites for Jobs +
                  </button>
                </div>
                <div style={styles.matchingScore}>
                  {selectedCandidate.matching}% Matching
                </div>
              </div>

              {/* About Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("about")}
                >
                  <div style={styles.sectionTitle}>About</div>
                  <span>{expandedSections.about ? "▼" : "▶"}</span>
                </div>
                {expandedSections.about && (
                  <div style={styles.sectionContent}>
                    <p style={styles.sectionText}>
                      {selectedCandidate.about}
                    </p>
                  </div>
                )}
              </div>

              {/* Cultural Interest Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("culturalInterest")}
                >
                  <div style={styles.sectionTitle}>Cultural Interest</div>
                  <span>{expandedSections.culturalInterest ? "▼" : "▶"}</span>
                </div>
                {expandedSections.culturalInterest && (
                  <div style={styles.sectionContent}>
                    <p style={styles.sectionText}>No cultural interests added.</p>
                  </div>
                )}
              </div>

              {/* Education Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("education")}
                >
                  <div style={styles.sectionTitle}>
                    Education
                    <span style={styles.sectionCount}>
                      {getCount(selectedCandidate.education)} added
                    </span>
                  </div>
                  <span>{expandedSections.education ? "▼" : "▶"}</span>
                </div>
                {expandedSections.education && (
                  <div style={styles.sectionContent}>
                    {selectedCandidate.education?.map((edu, index) => (
                      <div
                        key={index}
                        style={
                          index === selectedCandidate.education.length - 1
                            ? styles.listItemLast
                            : styles.listItem
                        }
                      >
                        <div style={styles.itemTitle}>{edu.degree}</div>
                        <div style={styles.itemSubtitle}>{edu.institution}</div>
                        <div style={styles.itemSubtitle}>{edu.year}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Experience Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("workExperience")}
                >
                  <div style={styles.sectionTitle}>
                    Work Experience
                    <span style={styles.sectionCount}>
                      {getCount(selectedCandidate.workExperience)} added
                    </span>
                  </div>
                  <span>{expandedSections.workExperience ? "▼" : "▶"}</span>
                </div>
                {expandedSections.workExperience && (
                  <div style={styles.sectionContent}>
                    {selectedCandidate.workExperience?.map((exp, index) => (
                      <div
                        key={index}
                        style={
                          index === selectedCandidate.workExperience.length - 1
                            ? styles.listItemLast
                            : styles.listItem
                        }
                      >
                        <div style={styles.itemTitle}>{exp.title}</div>
                        <div style={styles.itemSubtitle}>{exp.company}</div>
                        <div style={styles.itemSubtitle}>{exp.duration}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("skills")}
                >
                  <div style={styles.sectionTitle}>
                    Skills
                    <span style={styles.sectionCount}>
                      {getCount(selectedCandidate.skills)} added
                    </span>
                  </div>
                  <span>{expandedSections.skills ? "▼" : "▶"}</span>
                </div>
                {expandedSections.skills && (
                  <div style={styles.sectionContent}>
                    <div style={styles.skillsList}>
                      {selectedCandidate.skills?.map((skill, index) => (
                        <span key={index} style={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Projects Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("projects")}
                >
                  <div style={styles.sectionTitle}>
                    Projects
                    <span style={styles.sectionCount}>
                      {getCount(selectedCandidate.projects)} added
                    </span>
                  </div>
                  <span>{expandedSections.projects ? "▼" : "▶"}</span>
                </div>
                {expandedSections.projects && (
                  <div style={styles.sectionContent}>
                    {selectedCandidate.projects?.map((project, index) => (
                      <div
                        key={index}
                        style={
                          index === selectedCandidate.projects.length - 1
                            ? styles.listItemLast
                            : styles.listItem
                        }
                      >
                        <div style={styles.itemTitle}>{project.name}</div>
                        <div style={styles.itemSubtitle}>{project.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("achievements")}
                >
                  <div style={styles.sectionTitle}>
                    Achievements
                    <span style={styles.sectionCount}>
                      {getCount(selectedCandidate.achievements)} added
                    </span>
                  </div>
                  <span>{expandedSections.achievements ? "▼" : "▶"}</span>
                </div>
                {expandedSections.achievements && (
                  <div style={styles.sectionContent}>
                    {selectedCandidate.achievements?.map((achievement, index) => (
                      <div
                        key={index}
                        style={
                          index === selectedCandidate.achievements.length - 1
                            ? styles.listItemLast
                            : styles.listItem
                        }
                      >
                        <div style={styles.itemTitle}>{achievement.title}</div>
                        <div style={styles.itemSubtitle}>{achievement.year}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("certifications")}
                >
                  <div style={styles.sectionTitle}>
                    Certifications
                    <span style={styles.sectionCount}>
                      {getCount(selectedCandidate.certifications)} added
                    </span>
                  </div>
                  <span>{expandedSections.certifications ? "▼" : "▶"}</span>
                </div>
                {expandedSections.certifications && (
                  <div style={styles.sectionContent}>
                    {selectedCandidate.certifications?.map((cert, index) => (
                      <div
                        key={index}
                        style={
                          index === selectedCandidate.certifications.length - 1
                            ? styles.listItemLast
                            : styles.listItem
                        }
                      >
                        <div style={styles.itemTitle}>{cert.name}</div>
                        <div style={styles.itemSubtitle}>{cert.issuer}</div>
                        <div style={styles.itemSubtitle}>{cert.year}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preference Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("preference")}
                >
                  <div style={styles.sectionTitle}>Preference</div>
                  <span>{expandedSections.preference ? "▼" : "▶"}</span>
                </div>
                {expandedSections.preference && (
                  <div style={styles.sectionContent}>
                    <p style={styles.sectionText}>No preferences added.</p>
                  </div>
                )}
              </div>

              {/* Other Details Section */}
              <div style={styles.sectionCard}>
                <div
                  style={styles.sectionHeader}
                  onClick={() => toggleSection("otherDetails")}
                >
                  <div style={styles.sectionTitle}>Other details</div>
                  <span>{expandedSections.otherDetails ? "▼" : "▶"}</span>
                </div>
                {expandedSections.otherDetails && (
                  <div style={styles.sectionContent}>
                    <p style={styles.sectionText}>No other details added.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              Select a candidate to view their profile
            </div>
          )}
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
