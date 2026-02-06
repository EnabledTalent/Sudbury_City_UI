import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrganizationProfile, updateOrganizationProfile } from "../../services/employerService";
import Toast from "../../components/Toast";

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [companyData, setCompanyData] = useState({
    name: "",
    subtitle: "Software development company",
    logo: "∞",
    location: "",
    foundedYear: "",
    industry: "",
    employees: "",
    website: "",
    about: "",
  });
  const [formData, setFormData] = useState({
    organizationName: "",
    aboutOrganization: "",
    location: "",
    foundedYear: "",
    website: "",
    companySize: "10-100",
    industry: "Information Technology",
  });
  const [rawProfile, setRawProfile] = useState(null);

  const loadOrganizationProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await fetchOrganizationProfile();
      
      if (profile) {
        setRawProfile(profile);
        const orgName = profile.organizationName || "";
        setCompanyData({
          name: orgName,
          subtitle: profile.industry ? `${profile.industry} company` : "Software development company",
          logo: orgName ? orgName.charAt(0).toUpperCase() : "∞",
          location: profile.location || "",
          foundedYear: profile.foundedYear ? profile.foundedYear.toString() : "N/A",
          industry: profile.industry || "",
          employees: profile.companySize || "",
          website: profile.website || "",
          about: profile.aboutOrganization || "",
        });
        // Pre-fill form data
        setFormData({
          organizationName: profile.organizationName || "",
          aboutOrganization: profile.aboutOrganization || "",
          location: profile.location || "",
          foundedYear: profile.foundedYear ? profile.foundedYear.toString() : "",
          website: profile.website || "",
          companySize: profile.companySize || "10-100",
          industry: profile.industry || "Information Technology",
        });
      } else {
        setError("Organization profile not found");
      }
    } catch (err) {
      console.error("Error fetching organization profile:", err);
      setError(err.message || "Failed to load organization profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizationProfile();
  }, []);

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

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form data to original values
    if (rawProfile) {
      setFormData({
        organizationName: rawProfile.organizationName || "",
        aboutOrganization: rawProfile.aboutOrganization || "",
        location: rawProfile.location || "",
        foundedYear: rawProfile.foundedYear ? rawProfile.foundedYear.toString() : "",
        website: rawProfile.website || "",
        companySize: rawProfile.companySize || "10-100",
        industry: rawProfile.industry || "Information Technology",
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateOrganizationProfile(formData);
      setToast({ message: "Organization profile updated successfully!", type: "success" });
      // Reload profile data
      await loadOrganizationProfile();
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating organization profile:", error);
      setToast({ message: `Failed to update organization profile: ${error.message}`, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const styles = {
    page: {
      background: "#f2f7fd",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
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
      paddingBottom: "4px",
    },
    navLinkActive: {
      fontSize: "14px",
      color: "#3b82f6",
      cursor: "pointer",
      textDecoration: "none",
      paddingBottom: "4px",
      borderBottom: "2px solid #3b82f6",
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
      flex: 1,
    },
    companyBanner: {
      background: "linear-gradient(135deg, #fef3c7, #fde68a)",
      borderRadius: "16px",
      padding: "40px",
      marginBottom: "32px",
      display: "flex",
      alignItems: "center",
      gap: "24px",
      position: "relative",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    companyLogoContainer: {
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      flexShrink: 0,
    },
    companyLogo: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: "40px",
      fontWeight: 700,
    },
    companyInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: "36px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "8px",
    },
    companySubtitle: {
      fontSize: "18px",
      color: "#6b7280",
    },
    editIcon: {
      fontSize: "24px",
      color: "#6b7280",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "8px",
      transition: "background 0.2s",
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "24px",
      marginBottom: "40px",
    },
    aboutCard: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "32px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    aboutTitle: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#111827",
      marginBottom: "20px",
    },
    aboutText: {
      fontSize: "14px",
      color: "#374151",
      lineHeight: "1.8",
      whiteSpace: "pre-line",
    },
    detailsSidebar: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    detailCard: {
      background: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    detailLabel: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "8px",
      fontWeight: 500,
    },
    detailValue: {
      fontSize: "16px",
      color: "#111827",
      fontWeight: 500,
    },
    websiteCard: {
      background: "linear-gradient(90deg, #fb923c, #f97316)",
      borderRadius: "12px",
      padding: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      boxShadow: "0 2px 4px rgba(251, 146, 60, 0.3)",
    },
    websiteText: {
      fontSize: "16px",
      color: "#ffffff",
      fontWeight: 500,
    },
    websiteArrow: {
      fontSize: "20px",
      color: "#ffffff",
    },
    footer: {
      background: "#ffffff",
      padding: "24px 40px",
      borderTop: "1px solid #e5e7eb",
      textAlign: "center",
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "auto",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
      fontSize: "16px",
      color: "#6b7280",
    },
    errorContainer: {
      background: "#fee2e2",
      border: "1px solid #fca5a5",
      borderRadius: "8px",
      padding: "16px",
      margin: "20px 0",
      color: "#991b1b",
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
    searchIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      cursor: "pointer",
    },
    selectWrapper: {
      position: "relative",
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
          <span
            style={styles.navLink}
            onClick={() => navigate("/employer/listed-jobs")}
          >
            Listed Jobs
          </span>
          <span style={styles.navLinkActive}>Company Profile</span>
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
            Post a Job →
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.container}>
        {loading ? (
          <div style={styles.loadingContainer}>Loading organization profile...</div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <>
            {/* Company Banner */}
            <div style={styles.companyBanner}>
              <div style={styles.companyLogoContainer}>
                <div style={styles.companyLogo}>{companyData.logo}</div>
              </div>
              <div style={styles.companyInfo}>
                <div style={styles.companyName}>
                  {companyData.name || "Organization Name"}
                </div>
                <div style={styles.companySubtitle}>{companyData.subtitle}</div>
              </div>
              <span
                style={styles.editIcon}
                onClick={handleEdit}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                }}
              >
                ✏️
              </span>
            </div>

            {/* Content Grid or Edit Form */}
            {isEditMode ? (
              <div style={styles.formCard}>
                <h2 style={styles.formTitle}>Edit Organization Info</h2>

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
                  <button
                    style={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    style={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.contentGrid}>
              {/* About Section */}
              <div style={styles.aboutCard}>
                <h2 style={styles.aboutTitle}>About</h2>
                <div style={styles.aboutText}>
                  {companyData.about || "No description available."}
                </div>
              </div>

              {/* Company Details Sidebar */}
              <div style={styles.detailsSidebar}>
                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>Location:</div>
                  <div style={styles.detailValue}>
                    {companyData.location || "N/A"}
                  </div>
                </div>
                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>Founded in:</div>
                  <div style={styles.detailValue}>
                    {companyData.foundedYear || "N/A"}
                  </div>
                </div>
                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>Industry:</div>
                  <div style={styles.detailValue}>
                    {companyData.industry || "N/A"}
                  </div>
                </div>
                <div style={styles.detailCard}>
                  <div style={styles.detailLabel}>Employees:</div>
                  <div style={styles.detailValue}>
                    {companyData.employees || "N/A"}
                  </div>
                </div>
                {companyData.website && (
                  <div
                    style={styles.websiteCard}
                    onClick={() => {
                      const url = companyData.website.startsWith("http")
                        ? companyData.website
                        : `https://${companyData.website}`;
                      window.open(url, "_blank");
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.transition = "transform 0.2s";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <div style={styles.websiteText}>{companyData.website}</div>
                    <span style={styles.websiteArrow}>→</span>
                  </div>
                )}
              </div>
            </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        ©2025 {companyData.name || "Organization"}. All rights reserved. You may print or download
        extracts for personal, non-commercial use only, and must acknowledge the
        website as the source.
      </footer>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
