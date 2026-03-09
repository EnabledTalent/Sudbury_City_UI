import { useProfile } from "../../context/ProfileContext";
import { useState } from "react";
import { validateEducation } from "../../utils/profileValidation";
import ProfileHeader from "./ProfileHeader";

export default function Education({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [errors, setErrors] = useState([]);

  const emptyEducation = {
    degree: "",
    fieldOfStudy: "",
    institution: "",
    startDate: "",
    endDate: "",
    grade: "",
    location: "",
  };

  const normalizeEducation = (edu) => ({
    degree: edu?.degree || "",
    fieldOfStudy: edu?.fieldOfStudy || "",
    institution: edu?.institution || "",
    startDate: edu?.startDate || "",
    endDate: edu?.endDate || "",
    grade: edu?.grade || "",
    location: edu?.location || "",
  });

  const educations =
    profile.education && profile.education.length > 0
      ? profile.education.map(normalizeEducation)
      : [emptyEducation];

  const updateEducation = (index, field, value) => {
    const nextList = [...educations];
    nextList[index] = { ...nextList[index], [field]: value };
    updateProfile("education", nextList);
  };

  const addEducation = () => {
    updateProfile("education", [...educations, emptyEducation]);
  };

  const removeEducation = (index) => {
    if (educations.length === 1) return;
    updateProfile(
      "education",
      educations.filter((_, i) => i !== index)
    );
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const validationErrors = validateEducation(profile);
    const hasAnyErrors = validationErrors.some(
      (e) => Object.keys(e || {}).length > 0
    );

    if (hasAnyErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onNext();
  };

  return (
    <>
      <ProfileHeader />
      <h3>Education</h3>

      {educations.map((edu, index) => (
        <div key={index} className="experience-card">
          <div className="experience-header">
            <h4>Education {index + 1}</h4>
            {educations.length > 1 && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => removeEducation(index)}
              >
                🗑 Delete
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Please enter the Course Name *</label>
            <input
              value={edu.degree}
              onChange={(e) => updateEducation(index, "degree", e.target.value)}
              placeholder="Course name"
              className={errors[index]?.degree ? "input-error" : ""}
            />
            {errors[index]?.degree && (
              <div className="error-text">{errors[index].degree}</div>
            )}
          </div>

          <div className="form-group">
            <label>Major</label>
            <input
              value={edu.fieldOfStudy}
              onChange={(e) =>
                updateEducation(index, "fieldOfStudy", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Institution</label>
            <input
              value={edu.institution}
              onChange={(e) =>
                updateEducation(index, "institution", e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              value={edu.location}
              onChange={(e) => updateEducation(index, "location", e.target.value)}
              placeholder="City, Province/State"
            />
          </div>

          <div className="date-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                value={edu.startDate}
                onChange={(e) =>
                  updateEducation(index, "startDate", e.target.value)
                }
                placeholder="MM/YYYY or YYYY"
              />
            </div>

            <div className="form-group">
              <label>Graduation Date</label>
              <input
                value={edu.endDate}
                onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                placeholder="MM/YYYY or YYYY"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Grade / GPA</label>
            <input
              value={edu.grade}
              onChange={(e) => updateEducation(index, "grade", e.target.value)}
              placeholder="e.g. 3.8/4.0"
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn-secondary" onClick={addEducation}>
        + Add another education
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
