import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveOrganizationProfile } from "../../services/employerService";
import Toast from "../../components/Toast";

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

  const handleSaveAndNext = async () => {
    try {
      // Save organization info to API
      await saveOrganizationProfile(formData);
      setToast({ message: "Organization profile saved successfully!", type: "success" });
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
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    notificationIcon: {
      fontSize: "20px",
      cursor: "pointer",
      color: "#6b7280",
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
      background: "#d97706",
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
      borderRadius: "16px",
      padding: "32px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
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
      borderColor: "#fb923c",
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
      borderColor: "#fb923c",
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
      accentColor: "#fb923c",
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
      background: "linear-gradient(90deg, #fb923c, #f97316)",
      color: "#ffffff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
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
          <span style={styles.navLink}>
            <span>👤</span>
            Profile
          </span>
          <span
            style={styles.navLink}
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
                  placeholder="Search Organization"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#fb923c";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                />
                <span style={styles.searchIcon}>🔍</span>
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
                  e.target.style.borderColor = "#fb923c";
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
                  e.target.style.borderColor = "#fb923c";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
            </div>

            {/* Founded Year */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Founded year</label>
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  name="foundedYear"
                  value={formData.foundedYear}
                  onChange={handleInputChange}
                  placeholder="Select year"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#fb923c";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                  }}
                />
                <span style={styles.searchIcon}>📅</span>
              </div>
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
                  e.target.style.borderColor = "#fb923c";
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
                    e.target.style.borderColor = "#fb923c";
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
