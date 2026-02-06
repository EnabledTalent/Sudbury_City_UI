import { useState, useEffect } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

const emptyProject = {
  name: "",
  description: "",
  currentlyWorking: false,
  startDate: "",
  endDate: "",
  photo: null,
};

// Backend → UI: Handle both string array and object array
const normalizeProject = (proj, index) => {
  if (typeof proj === "string") {
    // If backend returns simple string, create object from it
    return {
      name: proj || "",
      description: "",
      currentlyWorking: false,
      startDate: "",
      endDate: "",
      photo: null,
    };
  }
  return {
    name: proj.name || "",
    description: proj.description || "",
    currentlyWorking: proj.currentlyWorking || false,
    startDate: proj.startDate || "",
    endDate: proj.endDate || "",
    photo: proj.photo || null,
  };
};

// UI → Backend
const denormalizeProject = (proj) => ({
  name: proj.name || null,
  description: proj.description || null,
  currentlyWorking: proj.currentlyWorking || false,
  startDate: proj.startDate || null,
  endDate: proj.endDate || null,
  photo: proj.photo || null,
});

export default function Projects({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [errors, setErrors] = useState([]);

  // Initialize projects from backend if available
  useEffect(() => {
    if (profile.projects && Array.isArray(profile.projects) && profile.projects.length > 0) {
      // Check if projects are already normalized (objects) or strings
      const firstProject = profile.projects[0];
      if (typeof firstProject === "string" || !firstProject.name) {
        // Normalize string array to object array
        const normalizedProjects = profile.projects.map(normalizeProject);
        updateProfile("projects", normalizedProjects);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projects =
    profile.projects && profile.projects.length > 0
      ? profile.projects.map(normalizeProject)
      : [emptyProject];

  const updateProject = (index, field, value) => {
    const uiList = [...projects];
    uiList[index] = { ...uiList[index], [field]: value };

    const backendList = uiList.map(denormalizeProject);
    updateProfile("projects", backendList);
  };

  const addProject = () => {
    const uiList = [...projects, emptyProject];
    const backendList = uiList.map(denormalizeProject);
    updateProfile("projects", backendList);
  };

  const removeProject = (index) => {
    if (projects.length === 1) return;

    const uiList = projects.filter((_, i) => i !== index);
    const backendList = uiList.map(denormalizeProject);
    updateProfile("projects", backendList);
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, file) => {
    if (file) {
      // Store file object (in real app, you'd upload and store URL)
      updateProject(index, "photo", file);
    }
  };

  const handleNext = () => {
    // Projects are optional, so no validation needed
    onNext();
  };

  // Inline styles
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
    projectCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
      background: "#ffffff",
    },
    projectHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    projectTitle: {
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
    inputDisabled: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      background: "#f3f4f6",
      cursor: "not-allowed",
      color: "#9ca3af",
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
    inputFocus: {
      borderColor: "#fb923c",
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
      accentColor: "#d97706",
    },
    radioLabel: {
      fontSize: "14px",
      cursor: "pointer",
      margin: 0,
    },
    dateRow: {
      display: "flex",
      gap: "16px",
    },
    dateGroup: {
      flex: 1,
    },
    fileUpload: {
      border: "2px dashed #d1d5db",
      borderRadius: "8px",
      padding: "32px",
      textAlign: "center",
      cursor: "pointer",
      background: "#f9fafb",
      transition: "all 0.2s",
    },
    fileUploadHover: {
      borderColor: "#fb923c",
      background: "#fff7ed",
    },
    fileUploadContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
    },
    fileUploadIcon: {
      fontSize: "24px",
      color: "#9ca3af",
    },
    fileUploadText: {
      fontSize: "14px",
      color: "#6b7280",
    },
    fileInput: {
      display: "none",
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

  const hasError = errors.some((e) => Object.keys(e || {}).length > 0);

  return (
    <>
      <ProfileHeader />
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Projects</h3>
        {hasError && <span style={styles.errorBadge}>01 error</span>}
      </div>

      {projects.map((proj, index) => (
        <div key={index} style={styles.projectCard}>
          <div style={styles.projectHeader}>
            <h4 style={styles.projectTitle}>Project {index + 1}</h4>
            {projects.length > 1 && (
              <button
                type="button"
                style={styles.deleteBtn}
                onClick={() => removeProject(index)}
              >
                🗑 Delete
              </button>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Project name *</label>
            <input
              style={
                errors[index]?.name ? styles.inputError : styles.input
              }
              value={proj.name}
              onChange={(e) => updateProject(index, "name", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "#fb923c")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            {errors[index]?.name && (
              <div style={styles.errorText}>{errors[index].name}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Project description *</label>
            <textarea
              rows="4"
              style={
                errors[index]?.description
                  ? styles.textareaError
                  : styles.textarea
              }
              value={proj.description}
              onChange={(e) =>
                updateProject(index, "description", e.target.value)
              }
              onFocus={(e) => (e.target.style.borderColor = "#fb923c")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
            {errors[index]?.description && (
              <div style={styles.errorText}>{errors[index].description}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Currently working on this project?
            </label>
            <div style={styles.radioGroup}>
              <label style={styles.radioOption}>
                <input
                  type="radio"
                  name={`currentlyWorking-${index}`}
                  style={styles.radioInput}
                  checked={proj.currentlyWorking === true}
                  onChange={() => {
                    updateProject(index, "currentlyWorking", true);
                    updateProject(index, "endDate", ""); // Clear end date when currently working
                  }}
                />
                <span style={styles.radioLabel}>Yes</span>
              </label>
              <label style={styles.radioOption}>
                <input
                  type="radio"
                  name={`currentlyWorking-${index}`}
                  style={styles.radioInput}
                  checked={proj.currentlyWorking === false}
                  onChange={() =>
                    updateProject(index, "currentlyWorking", false)
                  }
                />
                <span style={styles.radioLabel}>No</span>
              </label>
            </div>
          </div>

          <div style={styles.dateRow}>
            <div style={{ ...styles.formGroup, ...styles.dateGroup }}>
              <label style={styles.label}>From</label>
              <input
                type="date"
                style={styles.input}
                value={proj.startDate}
                onChange={(e) =>
                  updateProject(index, "startDate", e.target.value)
                }
                onFocus={(e) => (e.target.style.borderColor = "#fb923c")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div style={{ ...styles.formGroup, ...styles.dateGroup }}>
              <label style={styles.label}>To</label>
              <input
                type="date"
                style={proj.currentlyWorking ? styles.inputDisabled : styles.input}
                value={proj.endDate}
                onChange={(e) =>
                  updateProject(index, "endDate", e.target.value)
                }
                disabled={proj.currentlyWorking}
                onFocus={(e) => {
                  if (!proj.currentlyWorking) {
                    e.target.style.borderColor = "#fb923c";
                  }
                }}
                onBlur={(e) => {
                  if (!proj.currentlyWorking) {
                    e.target.style.borderColor = "#e5e7eb";
                  }
                }}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Profile photo</label>
            <div
              style={styles.fileUpload}
              onClick={() =>
                document.getElementById(`file-input-${index}`).click()
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#fb923c";
                e.currentTarget.style.background = "#fff7ed";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.background = "#f9fafb";
              }}
            >
              <div style={styles.fileUploadContent}>
                <div style={styles.fileUploadIcon}>📤</div>
                <div style={styles.fileUploadText}>
                  Drag and drop or, Browse
                </div>
                {proj.photo && (
                  <div style={{ fontSize: "12px", color: "#22c55e", marginTop: "4px" }}>
                    {proj.photo.name || "File selected"}
                  </div>
                )}
              </div>
            </div>
            <input
              id={`file-input-${index}`}
              type="file"
              accept="image/*"
              style={styles.fileInput}
              onChange={(e) =>
                handleFileChange(index, e.target.files[0])
              }
            />
          </div>
        </div>
      ))}

      <button type="button" style={styles.addButton} onClick={addProject}>
        + Add another project
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
