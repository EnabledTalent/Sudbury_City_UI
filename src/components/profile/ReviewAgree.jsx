import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

export default function ReviewAgree({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [errors, setErrors] = useState({});

  const reviewAgree = profile.reviewAgree || {
    discovery: "",
    comments: "",
    agreed: false,
  };

  const updateField = (field, value) => {
    updateProfile("reviewAgree", { ...reviewAgree, [field]: value });
  };

  const handleNext = () => {
    const newErrors = {};
    if (!reviewAgree.agreed) {
      newErrors.agreed = "You must agree to the terms and conditions";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onNext();
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
      accentColor: "#d97706",
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
      background: "#d97706",
      color: "#ffffff",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
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
          How did you discover the BReady talent platform?
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
        <label style={styles.label}>Comments</label>
        <textarea
          style={styles.textarea}
          value={reviewAgree.comments}
          onChange={(e) => updateField("comments", e.target.value)}
          placeholder="Please leave any additional comments or feedback"
          onFocus={(e) => (e.target.style.borderColor = "#fb923c")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>

      <div style={styles.termsSection}>
        <div style={styles.termsTitle}>Terms And Conditions</div>
        <ul style={styles.termsList}>
          <li style={styles.termsItem}>
            <span style={styles.termsBullet}>•</span>
            Allow EnabledTalent to share your resume, pitch yourself and
            behaviour question video with third parties (ex. prospective
            employers) to consider you for an internship.
          </li>
          <li style={styles.termsItem}>
            <span style={styles.termsBullet}>•</span>
            The EnabledTalent program has the right to remove you from the
            program if you decline more than three interview requests without
            appropriate justification
          </li>
          <li style={styles.termsItem}>
            <span style={styles.termsBullet}>•</span>
            The EnabledTalent has the right to remove you from the program if
            you decline more than two internship offers without appropriate
            justification
          </li>
        </ul>
        <div style={styles.termsText}>
          Toronto Metropolitan University ("the University") collects personal
          information under the authority of the{" "}
          <strong>Toronto Metropolitan University Act, 1977</strong> and in
          accordance with the{" "}
          <strong>Toronto Metropolitan University Notice of Collection</strong>{" "}
          and the{" "}
          <strong>
            Freedom of Information and Protection of Privacy Act, external link
          </strong>
          .
        </div>
        <div style={styles.contactInfo}>
          If you have questions about the collection, use and disclosure of this
          information by the University, please contact Mohammad Adnan Syed, 350
          Victoria Street, Toronto, M5B 2K3, admin@talent-accelerator.com
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
            I confirm that I have read, understood and agreed with the
            statement.
          </label>
        </div>
        {errors.agreed && (
          <div style={styles.errorText}>{errors.agreed}</div>
        )}
      </div>

      <div style={styles.formActions}>
        <button style={styles.btnSecondary} onClick={onPrev}>
          Previous
        </button>
        <button style={styles.btnPrimary} onClick={handleNext}>
          Save & Proceed
        </button>
      </div>
    </>
  );
}
