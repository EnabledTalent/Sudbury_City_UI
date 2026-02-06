import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { validateWorkExperience } from "../../utils/profileValidation";
import ProfileHeader from "./ProfileHeader";

/* ---------- Helpers ---------- */

const emptyExperience = {
  company: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  description: "",
};

// backend → UI
const normalizeExperience = (exp) => ({
  company: exp.company || "",
  jobTitle: exp.jobTitle || "",
  startDate: exp.startDate ? `${exp.startDate}-01-01` : "",
  endDate: exp.endDate ? `${exp.endDate}-12-31` : "",
  description: Array.isArray(exp.responsibilities)
    ? exp.responsibilities.join("\n")
    : "",
});

// UI → backend
const denormalizeExperience = (exp) => ({
  jobTitle: exp.jobTitle || null,
  company: exp.company || null,
  location: null,
  startDate: exp.startDate ? exp.startDate.substring(0, 4) : null,
  endDate: exp.endDate ? exp.endDate.substring(0, 4) : null,
  currentlyWorking: null,
  responsibilities: exp.description
    ? exp.description
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : [],
  technologies: null,
});

/* ---------- Component ---------- */

export default function Work({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [errors, setErrors] = useState([]);

  const experiences =
    profile.workExperience && profile.workExperience.length > 0
      ? profile.workExperience.map(normalizeExperience)
      : [emptyExperience];

  /* ---------- Actions ---------- */

  const updateExperience = (index, field, value) => {
    const uiList = [...experiences];
    uiList[index] = { ...uiList[index], [field]: value };

    const backendList = uiList.map(denormalizeExperience);
    updateProfile("workExperience", backendList);
  };

  const addExperience = () => {
    const uiList = [...experiences, emptyExperience];
    const backendList = uiList.map(denormalizeExperience);
    updateProfile("workExperience", backendList);
  };

  const removeExperience = (index) => {
    if (experiences.length === 1) return;

    const uiList = experiences.filter((_, i) => i !== index);
    const backendList = uiList.map(denormalizeExperience);

    updateProfile("workExperience", backendList);
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const validationErrors = validateWorkExperience(profile);
    const hasErrors = validationErrors.some(
      (e) => Object.keys(e || {}).length > 0
    );

    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onNext();
  };

  /* ---------- UI ---------- */

  return (
    <>
    <ProfileHeader />
      <h3>Work Experience</h3>

      {experiences.map((exp, index) => (
        <div key={index} className="experience-card">
          <div className="experience-header">
            <h4>Experience {index + 1}</h4>
            {experiences.length > 1 && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => removeExperience(index)}
              >
                🗑 Delete
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Company *</label>
            <input
              value={exp.company}
              onChange={(e) =>
                updateExperience(index, "company", e.target.value)
              }
              className={errors[index]?.company ? "input-error" : ""}
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <input
              value={exp.jobTitle}
              onChange={(e) =>
                updateExperience(index, "jobTitle", e.target.value)
              }
              className={errors[index]?.jobTitle ? "input-error" : ""}
            />
          </div>

          <div className="date-row">
            <div className="form-group">
              <label>From *</label>
              <input
                type="date"
                value={exp.startDate}
                onChange={(e) =>
                  updateExperience(index, "startDate", e.target.value)
                }
                className={errors[index]?.startDate ? "input-error" : ""}
              />
            </div>

            <div className="form-group">
              <label>To *</label>
              <input
                type="date"
                value={exp.endDate}
                onChange={(e) =>
                  updateExperience(index, "endDate", e.target.value)
                }
                className={errors[index]?.endDate ? "input-error" : ""}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows="4"
              value={exp.description}
              onChange={(e) =>
                updateExperience(index, "description", e.target.value)
              }
              className={errors[index]?.description ? "input-error" : ""}
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn-secondary" onClick={addExperience}>
        + Add another experience
      </button>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onPrev}>
          Previous
        </button>
        <button className="btn-primary" onClick={handleNext}>
          Save & Next
        </button>
      </div>
    </>
  );
}
