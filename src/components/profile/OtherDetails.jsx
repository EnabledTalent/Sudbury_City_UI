import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

const emptyLanguage = {
  language: "",
  speaking: "",
  reading: "",
  writing: "",
};

const proficiencyLevels = ["Basic", "Intermediate", "Proficient", "Native"];

export default function OtherDetails({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [errors] = useState({});

  const otherDetails = profile.otherDetails || {};
  const languages = otherDetails.languages || [emptyLanguage];
  const careerStage = otherDetails.careerStage || "";
  const earliestAvailability = otherDetails.earliestAvailability || "";
  const desiredSalary = otherDetails.desiredSalary || "";

  const updateLanguage = (index, field, value) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    updateProfile("otherDetails", {
      ...otherDetails,
      languages: updatedLanguages,
    });
  };

  const addLanguage = () => {
    updateProfile("otherDetails", {
      ...otherDetails,
      languages: [...languages, emptyLanguage],
    });
  };

  const removeLanguage = (index) => {
    if (languages.length === 1) return;
    const updatedLanguages = languages.filter((_, i) => i !== index);
    updateProfile("otherDetails", {
      ...otherDetails,
      languages: updatedLanguages,
    });
  };

  const updateField = (field, value) => {
    updateProfile("otherDetails", { ...otherDetails, [field]: value });
  };

  const handleNext = () => {
    // Other details are optional
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
    languageCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      background: "#ffffff",
    },
    languageRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gap: "12px",
      marginBottom: "12px",
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
    selectError: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ef4444",
      background: "#fff1f2",
      fontSize: "14px",
      outline: "none",
      cursor: "pointer",
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
    },
    inputError: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ef4444",
      background: "#fff1f2",
      fontSize: "14px",
      outline: "none",
    },
    inputWrapper: {
      position: "relative",
    },
    errorIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#ef4444",
      fontSize: "16px",
    },
    errorText: {
      fontSize: "12px",
      color: "#ef4444",
      marginTop: "6px",
    },
    deleteBtn: {
      background: "transparent",
      border: "none",
      color: "#ef4444",
      cursor: "pointer",
      fontSize: "13px",
      marginTop: "8px",
    },
    addButton: {
      background: "#f3f4f6",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      marginBottom: "24px",
    },
    questionText: {
      fontSize: "14px",
      fontWeight: 500,
      marginBottom: "8px",
      color: "#374151",
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
    },
  };

  return (
    <>
      <ProfileHeader />
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Other Details</h3>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Language Proficiency</label>
        {languages.map((lang, index) => (
          <div key={index} style={styles.languageCard}>
            <div style={styles.languageRow}>
              <div>
                <label style={styles.label}>Language</label>
                <select
                  style={styles.select}
                  value={lang.language}
                  onChange={(e) =>
                    updateLanguage(index, "language", e.target.value)
                  }
                >
                  <option value="">Select language</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="German">German</option>
                  <option value="Mandarin">Mandarin</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Speaking</label>
                <select
                  style={styles.select}
                  value={lang.speaking}
                  onChange={(e) =>
                    updateLanguage(index, "speaking", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>Reading</label>
                <select
                  style={styles.select}
                  value={lang.reading}
                  onChange={(e) =>
                    updateLanguage(index, "reading", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>Writing</label>
                <select
                  style={styles.select}
                  value={lang.writing}
                  onChange={(e) =>
                    updateLanguage(index, "writing", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {languages.length > 1 && (
              <button
                type="button"
                style={styles.deleteBtn}
                onClick={() => removeLanguage(index)}
              >
                🗑 Delete
              </button>
            )}
          </div>
        ))}
        <button type="button" style={styles.addButton} onClick={addLanguage}>
          + Add another language
        </button>
      </div>

      <div style={styles.formGroup}>
        <div style={styles.questionText}>
          How would you identify your career stage (choose best option)
        </div>
        <select
          style={styles.select}
          value={careerStage}
          onChange={(e) => updateField("careerStage", e.target.value)}
        >
          <option value="">Select career stage</option>
          <option value="Entry level">Entry level</option>
          <option value="Mid career professional (<10 years)">
            Mid career professional (&lt;10 years)
          </option>
          <option value="Senior professional (10+ years)">
            Senior professional (10+ years)
          </option>
          <option value="Executive">Executive</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <div style={styles.questionText}>
          What is your earliest availability for any full-time opportunities
          that may come from the Sudbury Talent Access Service?
        </div>
        <div style={styles.inputWrapper}>
          <input
            type="text"
            style={
              errors.earliestAvailability ? styles.inputError : styles.input
            }
            value={earliestAvailability}
            onChange={(e) => updateField("earliestAvailability", e.target.value)}
            placeholder="Enter earliest availability"
            onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          {errors.earliestAvailability && (
            <span style={styles.errorIcon}>!</span>
          )}
        </div>
        {errors.earliestAvailability && (
          <div style={styles.errorText}>{errors.earliestAvailability}</div>
        )}
      </div>

      <div style={styles.formGroup}>
        <div style={styles.questionText}>Desired salary (CAD)</div>
        <input
          type="text"
          style={styles.input}
          value={desiredSalary}
          onChange={(e) => updateField("desiredSalary", e.target.value)}
          placeholder="e.g., 80000-90000"
          onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>

      <div style={styles.formActions}>
        <button style={styles.btnSecondary} onClick={onPrev}>
          Previous
        </button>
        <button style={styles.btnPrimary} onClick={handleNext}>
          Save & Next
        </button>
      </div>
    </>
  );
}
