import { useMemo } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

const defaultPreference = {
  companySize: [],
  jobType: [],
  jobSearch: [],
};

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [String(value)];
}

export default function Preference({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();

  const preference = useMemo(() => {
    const raw = profile.preference || defaultPreference;
    return {
      companySize: ensureArray(raw.companySize),
      jobType: ensureArray(raw.jobType),
      jobSearch: ensureArray(raw.jobSearch),
    };
  }, [profile.preference]);

  const togglePreference = (field, option) => {
    const current = preference[field] || [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    updateProfile("preference", { ...preference, [field]: next });
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
      marginBottom: "32px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 500,
      marginBottom: "12px",
    },
    radioGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
    },
    radioOption: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      transition: "all 0.2s",
    },
    radioOptionSelected: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      padding: "8px 12px",
      borderRadius: "8px",
      border: "1px solid #c8a45c",
      background: "#fff7ed",
      transition: "all 0.2s",
    },
    radioInput: {
      width: "18px",
      height: "18px",
      cursor: "pointer",
      accentColor: "#c8a45c",
    },
    radioLabel: {
      fontSize: "14px",
      cursor: "pointer",
      margin: 0,
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
      background: "#c8a45c",
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
        <h3 style={styles.sectionTitle}>Preference</h3>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Company Size</label>
        <div style={styles.radioGroup}>
          {["1 - 10", "10 - 100", "100 - 1000", "1000 - 10000"].map((size) => (
            <label
              key={size}
              style={
                preference.companySize.includes(size)
                  ? styles.radioOptionSelected
                  : styles.radioOption
              }
            >
              <input
                type="checkbox"
                name="companySize"
                style={styles.radioInput}
                checked={preference.companySize.includes(size)}
                onChange={() => togglePreference("companySize", size)}
              />
              <span style={styles.radioLabel}>{size}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Type of Job</label>
        <div style={styles.radioGroup}>
          {["Full time", "Contract", "Part time", "Intern"].map((type) => (
            <label
              key={type}
              style={
                preference.jobType.includes(type)
                  ? styles.radioOptionSelected
                  : styles.radioOption
              }
            >
              <input
                type="checkbox"
                name="jobType"
                style={styles.radioInput}
                checked={preference.jobType.includes(type)}
                onChange={() => togglePreference("jobType", type)}
              />
              <span style={styles.radioLabel}>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Job Search</label>
        <div style={styles.radioGroup}>
          {["Open to Offer", "Ready for Interviews"].map((search) => (
            <label
              key={search}
              style={
                preference.jobSearch.includes(search)
                  ? styles.radioOptionSelected
                  : styles.radioOption
              }
            >
              <input
                type="checkbox"
                name="jobSearch"
                style={styles.radioInput}
                checked={preference.jobSearch.includes(search)}
                onChange={() => togglePreference("jobSearch", search)}
              />
              <span style={styles.radioLabel}>{search}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={styles.formActions}>
        <button style={styles.btnSecondary} onClick={onPrev}>
          Previous
        </button>
        <button style={styles.btnPrimary} onClick={onNext}>
          Save & Next
        </button>
      </div>
    </>
  );
}
