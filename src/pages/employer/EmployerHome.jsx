import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrganizationProfile, saveOrganizationProfile } from "../../services/employerService";
import { logoutUser } from "../../services/authService";
import Toast from "../../components/Toast";
import YearPicker from "../../components/YearPicker";

export default function EmployerHome() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organizationName: "",
    aboutOrganization: "",
    location: "Allentown, New Mexico 31134",
    foundedYear: "",
    website: "",
    companySize: "10-100",
    industry: "Information Technology",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "organizationName") {
      localStorage.setItem("employer:orgName:draft", value);
    }
  };

  const handleCompanySizeChange = (size) => {
    setFormData((prev) => ({
      ...prev,
      companySize: size,
    }));
  };

  const handleCancel = () => {
    // Navigate back or clear form
    setFormData({
      organizationName: "",
      aboutOrganization: "",
      location: "Allentown, New Mexico 31134",
      foundedYear: "",
      website: "",
      companySize: "10-100",
      industry: "Information Technology",
    });
  };

  const [toast, setToast] = useState({ message: "", type: "error" });

  useEffect(() => {
    const draftName = localStorage.getItem("employer:orgName:draft");
    if (draftName) {
      setFormData((prev) => ({
        ...prev,
        organizationName: prev.organizationName || draftName,
      }));
    }

    const loadExistingOrg = async () => {
      try {
        const existing = await fetchOrganizationProfile();
        if (existing && (existing.organizationName || existing.aboutOrganization)) {
          setFormData((prev) => ({
            ...prev,
            organizationName: prev.organizationName || existing.organizationName || "",
            aboutOrganization: prev.aboutOrganization || existing.aboutOrganization || "",
            location: prev.location || existing.location || "",
            foundedYear:
              prev.foundedYear || (existing.foundedYear ? String(existing.foundedYear) : ""),
            website: prev.website || existing.website || "",
            companySize: prev.companySize || existing.companySize || prev.companySize,
            industry: prev.industry || existing.industry || prev.industry,
          }));
        }
      } catch {
        // ignore prefill errors; user can still enter manually
      }
    };

    loadExistingOrg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveAndNext = async () => {
    try {
      // Save organization info to API
      await saveOrganizationProfile(formData);
      setToast({ message: "Organization profile saved successfully!", type: "success" });
      // Trigger first-time tour on employer dashboard
      localStorage.setItem("tour:employer:mainNav:pending", "true");
      // Navigate to dashboard on success after a short delay
      setTimeout(() => {
        navigate("/employer/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error saving organization profile:", error);
      setToast({ message: `Failed to save organization profile: ${error.message}`, type: "error" });
    }
  };

  // Get user name from localStorage or token
  const getUserName = () => {
    const profileData = localStorage.getItem("profileData");
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        return parsed.fullName || parsed.basicInfo?.name || "Employer";
      } catch (e) {
        return "Employer";
      }
    }
    return "Employer";
  };

  const userName = getUserName();

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
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    notificationIcon: {
      fontSize: "20px",
      cursor: "pointer",
      color: "#6b7280",
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
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "32px 40px",
      display: "flex",
      gap: "24px",
    },
    leftPanel: {
      flex: "0 0 320px",
    },
    userCard: {
      background: "linear-gradient(135deg, #fef3c7, #fde68a)",
      borderRadius: "16px",
      padding: "32px 24px",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    backgroundIcon: {
      position: "absolute",
      right: "-20px",
      top: "-20px",
      fontSize: "120px",
      color: "rgba(217, 119, 6, 0.1)",
      fontWeight: 700,
    },
    profilePicture: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#16a34a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "32px",
      fontWeight: 600,
      marginBottom: "16px",
      border: "4px solid #ffffff",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    welcomeText: {
      fontSize: "14px",
      color: "#92400e",
      marginBottom: "4px",
      fontWeight: 500,
    },
    userName: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#78350f",
      marginBottom: "0",
    },
    rightPanel: {
      flex: 1,
    },
    formCard: {
      background: "#ffffff",
      borderRadius: "20px",
      padding: "40px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      border: "1px solid rgba(0, 0, 0, 0.04)",
    },
    formTitle: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "24px",
    },
    formGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
      marginBottom: "8px",
    },
    inputWrapper: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#16a34a",
    },
    searchIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      cursor: "pointer",
    },
    textarea: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      minHeight: "120px",
      resize: "vertical",
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
    textareaFocus: {
      borderColor: "#16a34a",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      paddingRight: "40px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      background: "#ffffff",
      cursor: "pointer",
      appearance: "none",
      boxSizing: "border-box",
    },
    selectWrapper: {
      position: "relative",
    },
    selectArrow: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      pointerEvents: "none",
    },
    radioGroup: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
    },
    radioOption: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
    },
    radioInput: {
      width: "18px",
      height: "18px",
      cursor: "pointer",
      accentColor: "#16a34a",
    },
    radioLabel: {
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
    },
    actions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "32px",
      paddingTop: "24px",
      borderTop: "1px solid #e5e7eb",
    },
    cancelBtn: {
      background: "#f3f4f6",
      color: "#374151",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
    },
    saveBtn: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "14px 28px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
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
          <span style={styles.notificationIcon}>🔔</span>
          <button
            style={styles.postJobBtn}
            onClick={() => navigate("/employer/post-job")}
          >
            Post a Job →
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.container}>
        {/* Left Panel - User Card */}
        <div style={styles.leftPanel}>
          <div style={styles.userCard}>
            <div style={styles.backgroundIcon}>e</div>
            <div style={styles.profilePicture}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={styles.welcomeText}>Welcome</div>
            <div style={styles.userName}>{userName}</div>
          </div>
        </div>

        {/* Right Panel - Organization Info Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>Organization Info</h2>

            {/* Organization Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Organization name</label>
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Organization name"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#16a34a";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                />
              </div>
            </div>

            {/* About Organization */}
            <div style={styles.formGroup}>
              <label style={styles.label}>About Organization</label>
              <textarea
                name="aboutOrganization"
                value={formData.aboutOrganization}
                onChange={handleInputChange}
                placeholder="Enter description about company"
                style={styles.textarea}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
            </div>

            {/* Location */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
            </div>

            {/* Founded Year */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Founded year</label>
              <YearPicker
                value={formData.foundedYear}
                onChange={(year) =>
                  setFormData((prev) => ({
                    ...prev,
                    foundedYear: year,
                  }))
                }
              />
            </div>

            {/* Website */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="Enter website link"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
            </div>

            {/* Company Size */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Company Size</label>
              <div style={styles.radioGroup}>
                {["1-10", "10-100", "100-1000", "1000-10000"].map((size) => (
                  <div
                    key={size}
                    style={styles.radioOption}
                    onClick={() => handleCompanySizeChange(size)}
                  >
                    <input
                      type="radio"
                      name="companySize"
                      value={size}
                      checked={formData.companySize === size}
                      onChange={() => handleCompanySizeChange(size)}
                      style={styles.radioInput}
                    />
                    <label style={styles.radioLabel}>{size}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Industry */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Industry</label>
              <div style={styles.selectWrapper}>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  style={styles.select}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#16a34a";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                >
                  <option value="Information Technology">
                    Information Technology
                  </option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
                <span style={styles.selectArrow}>▼</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.actions}>
              <button style={styles.cancelBtn} onClick={handleCancel}>
                Cancel
              </button>
              <button style={styles.saveBtn} onClick={handleSaveAndNext}>
                Save & Next
              </button>
            </div>
          </div>
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
