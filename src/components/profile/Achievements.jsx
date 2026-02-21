import { useState, useEffect } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

const emptyAchievement = {
  title: "",
  issueDate: "",
  description: "",
};

const normalizeAchievement = (ach) => {
  if (typeof ach === "string") {
    return {
      title: ach || "",
      issueDate: "",
      description: "",
    };
  }
  return {
    title: ach.title || "",
    issueDate: ach.issueDate || "",
    description: ach.description || "",
  };
};

const denormalizeAchievement = (ach) => ({
  title: ach.title || null,
  issueDate: ach.issueDate || null,
  description: ach.description || null,
});

export default function Achievements({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (profile.achievements && Array.isArray(profile.achievements) && profile.achievements.length > 0) {
      const firstAchievement = profile.achievements[0];
      if (typeof firstAchievement === "string" || !firstAchievement.title) {
        const normalizedAchievements = profile.achievements.map(normalizeAchievement);
        updateProfile("achievements", normalizedAchievements);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const achievements =
    profile.achievements && profile.achievements.length > 0
      ? profile.achievements.map(normalizeAchievement)
      : [emptyAchievement];

  const updateAchievement = (index, field, value) => {
    const uiList = [...achievements];
    uiList[index] = { ...uiList[index], [field]: value };
    const backendList = uiList.map(denormalizeAchievement);
    updateProfile("achievements", backendList);
  };

  const addAchievement = () => {
    const uiList = [...achievements, emptyAchievement];
    const backendList = uiList.map(denormalizeAchievement);
    updateProfile("achievements", backendList);
  };

  const removeAchievement = (index) => {
    if (achievements.length === 1) return;
    const uiList = achievements.filter((_, i) => i !== index);
    const backendList = uiList.map(denormalizeAchievement);
    updateProfile("achievements", backendList);
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const validationErrors = [];
    let hasErrors = false;

    achievements.forEach((ach, index) => {
      const entryErrors = {};
      const hasAnyValue =
        Boolean(ach.title && ach.title.trim()) ||
        Boolean(ach.issueDate && ach.issueDate.trim()) ||
        Boolean(ach.description && ach.description.trim());

      // Achievements are optional. Only validate an entry if user started filling it.
      if (hasAnyValue && !ach.title?.trim()) {
        entryErrors.title = "Title is required";
        hasErrors = true;
      }
      validationErrors[index] = entryErrors;
    });

    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    // If user left the default empty achievement, store as empty list instead
    const hasAtLeastOneFilled = achievements.some(
      (ach) =>
        Boolean(ach.title && ach.title.trim()) ||
        Boolean(ach.issueDate && ach.issueDate.trim()) ||
        Boolean(ach.description && ach.description.trim())
    );
    if (!hasAtLeastOneFilled) {
      updateProfile("achievements", []);
    }
    onNext();
  };

  const styles = {
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "24px",
      fontWeight: 600,
    },
    errorBadge: {
      fontSize: "12px",
      color: "#ef4444",
      fontWeight: 500,
    },
    achievementCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
      background: "#ffffff",
    },
    achievementHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    achievementTitle: {
      margin: 0,
      fontSize: "16px",
      fontWeight: 600,
    },
    deleteBtn: {
      background: "transparent",
      border: "none",
      color: "#ef4444",
      cursor: "pointer",
      fontSize: "13px",
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 500,
      marginBottom: "6px",
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
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      resize: "vertical",
      outline: "none",
      fontFamily: "inherit",
      minHeight: "80px",
    },
    textareaError: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #ef4444",
      background: "#fff1f2",
      fontSize: "14px",
      resize: "vertical",
      outline: "none",
      fontFamily: "inherit",
      minHeight: "80px",
    },
    errorText: {
      fontSize: "12px",
      color: "#ef4444",
      marginTop: "6px",
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
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    addButtonIcon: {
      color: "#16a34a",
      fontSize: "18px",
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

  const hasError = errors.some((e) => Object.keys(e || {}).length > 0);

  return (
    <>
      <ProfileHeader />
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Achievements</h3>
        {hasError && <span style={styles.errorBadge}>01 error</span>}
      </div>

      {achievements.map((ach, index) => (
        <div key={index} style={styles.achievementCard}>
          <div style={styles.achievementHeader}>
            <h4 style={styles.achievementTitle}>Achievement {index + 1}</h4>
            {achievements.length > 1 && (
              <button
                type="button"
                style={styles.deleteBtn}
                onClick={() => removeAchievement(index)}
              >
                🗑 Delete
              </button>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Title</label>
            <input
              style={errors[index]?.title ? styles.inputError : styles.input}
              value={ach.title}
              onChange={(e) => updateAchievement(index, "title", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            {errors[index]?.title && (
              <div style={styles.errorText}>{errors[index].title}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Issue Date</label>
            <input
              type="text"
              style={styles.input}
              value={ach.issueDate}
              onChange={(e) =>
                updateAchievement(index, "issueDate", e.target.value)
              }
              placeholder="e.g., 2022"
              onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              rows="4"
              style={styles.textarea}
              value={ach.description}
              onChange={(e) =>
                updateAchievement(index, "description", e.target.value)
              }
              onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>
      ))}

      <button type="button" style={styles.addButton} onClick={addAchievement}>
        <span style={styles.addButtonIcon}>+</span>
        Add another achievement
      </button>

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
