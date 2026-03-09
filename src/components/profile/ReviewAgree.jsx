import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { saveProfile, updateProfile } from "../../services/profileService";
import ProfileHeader from "./ProfileHeader";

export default function ReviewAgree({ onPrev, onNext }) {
  const { profile, updateProfile: updateProfileContext } = useProfile();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if we're in edit mode
  useEffect(() => {
    const editMode = localStorage.getItem("profileEditMode") === "true";
    setIsEditMode(editMode);
  }, []);

  const reviewAgree = profile.reviewAgree || {
    discovery: "",
    comments: "",
    agreed: false,
    hasDisability: null,
  };

  const updateField = (field, value) => {
    updateProfileContext("reviewAgree", { ...reviewAgree, [field]: value });
  };

  const handleNext = async () => {
    const newErrors = {};
    if (!reviewAgree.agreed) {
      newErrors.agreed = "You must accept the privacy and consent statement";
    }
    // Validate disability selection (mandatory)
    if (reviewAgree.hasDisability === undefined || reviewAgree.hasDisability === null || reviewAgree.hasDisability === "") {
      newErrors.hasDisability = "Please select if you have a disability";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSaveError("");

    // Ensure reviewAgree is saved to profile before saving
    const updatedProfile = {
      ...profile,
      reviewAgree: reviewAgree,
    };

    // Save or update profile to API
    setLoading(true);
    
    try {
      isEditMode 
        ? await updateProfile(updatedProfile)
        : await saveProfile(updatedProfile);
      
      // Clear edit mode flag
      localStorage.removeItem("profileEditMode");
      
      // On success, navigate to success page
      navigate("/student/success");
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} profile:`, error);
      // Only show error if it's not a JSON parsing issue with 200 status
      if (error.message && error.message.includes("Invalid JSON")) {
        // If we got 200 but invalid JSON, still treat as success
        localStorage.removeItem("profileEditMode");
        navigate("/student/success");
      } else {
        setSaveError(error.message || `Failed to ${isEditMode ? 'update' : 'save'} profile. Please try again.`);
        setLoading(false);
      }
    }
  };

  const styles = {
    sectionHeader: {
      marginBottom: "24px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "24px",
      fontWeight: 600,
    },
    formGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 500,
      marginBottom: "6px",
    },
    select: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      background: "#ffffff",
      cursor: "pointer",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      resize: "vertical",
      outline: "none",
      fontFamily: "inherit",
      minHeight: "100px",
    },
    termsSection: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "20px",
    },
    termsTitle: {
      fontSize: "16px",
      fontWeight: 600,
      marginBottom: "16px",
      color: "#111827",
    },
    termsList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      marginBottom: "16px",
    },
    termsItem: {
      fontSize: "14px",
      color: "#374151",
      marginBottom: "12px",
      paddingLeft: "20px",
      position: "relative",
    },
    termsBullet: {
      position: "absolute",
      left: 0,
      color: "#6b7280",
    },
    termsText: {
      fontSize: "13px",
      color: "#6b7280",
      lineHeight: "1.6",
      marginBottom: "12px",
    },
    contactInfo: {
      fontSize: "13px",
      color: "#6b7280",
      lineHeight: "1.6",
    },
    checkboxWrapper: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      marginTop: "16px",
    },
    checkbox: {
      width: "20px",
      height: "20px",
      cursor: "pointer",
      accentColor: "#16a34a",
      marginTop: "2px",
    },
    checkboxLabel: {
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
      lineHeight: "1.5",
    },
    errorText: {
      fontSize: "12px",
      color: "#ef4444",
      marginTop: "6px",
    },
    radioGroup: {
      display: "flex",
      gap: "24px",
      marginTop: "8px",
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
    formActions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "32px",
    },
    btnSecondary: {
      background: "#f3f4f6",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
    },
    btnPrimary: {
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      minWidth: "140px",
    },
    btnPrimaryDisabled: {
      background: "#16a34a",
      color: "#ffffff",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "not-allowed",
      fontSize: "14px",
      fontWeight: 500,
      opacity: 0.7,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      minWidth: "140px",
    },
    loadingSpinner: {
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderTop: "2px solid #ffffff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    errorMessage: {
      background: "#fff1f2",
      border: "1px solid #ef4444",
      borderRadius: "8px",
      padding: "12px 16px",
      marginBottom: "20px",
      color: "#ef4444",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    errorIcon: {
      fontSize: "18px",
    },
  };

  return (
    <>
      <ProfileHeader />
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Review & Agree</h3>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          How did you discover the Sudbury talent platform?
        </label>
        <select
          style={styles.select}
          value={reviewAgree.discovery}
          onChange={(e) => updateField("discovery", e.target.value)}
        >
          <option value="">Select an option</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Facebook">Facebook</option>
          <option value="Twitter">Twitter</option>
          <option value="Friend/Colleague">Friend/Colleague</option>
          <option value="University">University</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>
          Do you have a disability? <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div style={styles.radioGroup}>
          <div style={styles.radioOption}>
            <input
              type="radio"
              id="disability-yes"
              name="disability"
              value="yes"
              style={styles.radioInput}
              checked={reviewAgree.hasDisability === true || reviewAgree.hasDisability === "yes"}
              onChange={() => updateField("hasDisability", true)}
            />
            <label htmlFor="disability-yes" style={styles.radioLabel}>Yes</label>
          </div>
          <div style={styles.radioOption}>
            <input
              type="radio"
              id="disability-no"
              name="disability"
              value="no"
              style={styles.radioInput}
              checked={reviewAgree.hasDisability === false || reviewAgree.hasDisability === "no"}
              onChange={() => updateField("hasDisability", false)}
            />
            <label htmlFor="disability-no" style={styles.radioLabel}>No</label>
          </div>
        </div>
        {errors.hasDisability && (
          <div style={styles.errorText}>{errors.hasDisability}</div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Comments</label>
        <textarea
          style={styles.textarea}
          value={reviewAgree.comments}
          onChange={(e) => updateField("comments", e.target.value)}
          placeholder="Please leave any additional comments or feedback"
          onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>

      <div style={styles.termsSection}>
        <div style={styles.termsTitle}>Privacy, Consent, and Accommodation</div>
        <ul style={styles.termsList}>
          <li style={styles.termsItem}>
            <span style={styles.termsBullet}>•</span>
            I consent to the City of Greater Sudbury using my profile and
            application details to assess my eligibility for employment
            opportunities.
          </li>
          <li style={styles.termsItem}>
            <span style={styles.termsBullet}>•</span>
            I understand my information may be shared with authorized City
            staff and hiring managers involved in recruitment and selection.
          </li>
          <li style={styles.termsItem}>
            <span style={styles.termsBullet}>•</span>
            I understand this information is collected and managed in
            accordance with applicable Ontario privacy laws, including MFIPPA.
          </li>
        </ul>
        <div style={styles.termsText}>
          The City of Greater Sudbury collects personal information for
          recruitment and employment processing. You may request accommodation
          at any stage of the hiring process.
        </div>
        <div style={styles.contactInfo}>
          For questions about collection, use, disclosure, or accommodation,
          please contact the City of Greater Sudbury Human Resources team. If
          you require accommodation at any stage of recruitment, please contact
          myJOBS@greatersudbury.ca.
        </div>
        <div style={styles.checkboxWrapper}>
          <input
            type="checkbox"
            id="agree-checkbox"
            style={styles.checkbox}
            checked={reviewAgree.agreed}
            onChange={(e) => updateField("agreed", e.target.checked)}
          />
          <label htmlFor="agree-checkbox" style={styles.checkboxLabel}>
            I have read and understood this privacy and consent statement, and
            I consent to the City of Greater Sudbury processing my information
            for recruitment purposes.
          </label>
        </div>
        {errors.agreed && (
          <div style={styles.errorText}>{errors.agreed}</div>
        )}
      </div>

      {saveError && (
        <div style={styles.errorMessage}>
          <span style={styles.errorIcon}>⚠</span>
          <span>{saveError}</span>
        </div>
      )}

      <div style={styles.formActions}>
        <button
          style={{
            ...styles.btnSecondary,
            ...(loading ? { opacity: 0.6, cursor: "not-allowed" } : {}),
          }}
          onClick={onPrev}
          disabled={loading}
        >
          Previous
        </button>
        <button
          style={loading ? styles.btnPrimaryDisabled : styles.btnPrimary}
          onClick={handleNext}
          disabled={loading}
        >
          {loading && (
            <span
              style={styles.loadingSpinner}
              className="loading-spinner"
            ></span>
          )}
          {loading 
            ? (isEditMode ? "Updating..." : "Saving...") 
            : (isEditMode ? "Update" : "Save & Proceed")}
        </button>
      </div>
    </>
  );
}
