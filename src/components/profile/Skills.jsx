import { useState, useEffect } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

export default function Skills({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [primarySkillInput, setPrimarySkillInput] = useState("");
  const [basicSkillInput, setBasicSkillInput] = useState("");

  // Initialize primarySkills from backend 'skills' array if needed
  useEffect(() => {
    // If backend has 'skills' but we don't have 'primarySkills', initialize it
    if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
      if (!profile.primarySkills || profile.primarySkills.length === 0) {
        updateProfile("primarySkills", [...profile.skills]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.skills, profile.primarySkills]); // Only depend on the data, not updateProfile function

  // Use primarySkills if available, otherwise fall back to skills from backend
  const primarySkills = profile.primarySkills || profile.skills || [];
  const basicSkills = profile.basicSkills || [];

  const hasError = primarySkills.length === 0;

  const addPrimarySkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !primarySkills.includes(trimmedSkill)) {
      updateProfile("primarySkills", [...primarySkills, trimmedSkill]);
    }
  };

  const removePrimarySkill = (skillToRemove) => {
    updateProfile(
      "primarySkills",
      primarySkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const addBasicSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !basicSkills.includes(trimmedSkill)) {
      updateProfile("basicSkills", [...basicSkills, trimmedSkill]);
    }
  };

  const removeBasicSkill = (skillToRemove) => {
    updateProfile(
      "basicSkills",
      basicSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handlePrimarySkillKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPrimarySkill(primarySkillInput);
      setPrimarySkillInput("");
    }
  };

  const handleBasicSkillKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBasicSkill(basicSkillInput);
      setBasicSkillInput("");
    }
  };

  return (
    <>
      <ProfileHeader />
      <div className="section-header">
        <h3>Skills</h3>
        {hasError && <span className="error-badge">01 error</span>}
      </div>

      {/* Primary Skills Section */}
      <div className="form-group">
        <label>Primary Skills</label>
        <input
          className={hasError ? "input-error" : ""}
          value={primarySkillInput}
          onChange={(e) => setPrimarySkillInput(e.target.value)}
          onKeyPress={handlePrimarySkillKeyPress}
          placeholder="Type skill and press Enter"
        />
        {hasError && (
          <div className="error-text">Please add at least one primary skill</div>
        )}
        {primarySkills.length > 0 && (
          <div className="skills-tags">
            {primarySkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  className="skill-tag-remove"
                  onClick={() => removePrimarySkill(skill)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Basic Skills Section */}
      <div className="form-group">
        <label className="label-error">Basic Skills</label>
        <input
          value={basicSkillInput}
          onChange={(e) => setBasicSkillInput(e.target.value)}
          onKeyPress={handleBasicSkillKeyPress}
          placeholder="Type skill and press Enter"
        />
        {basicSkills.length > 0 && (
          <div className="skills-tags">
            {basicSkills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  className="skill-tag-remove"
                  onClick={() => removeBasicSkill(skill)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onPrev}>
          Previous
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            if (!hasError) {
              onNext();
            }
          }}
        >
          Save & Next
        </button>
      </div>
    </>
  );
}
