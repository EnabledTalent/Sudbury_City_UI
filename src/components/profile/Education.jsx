import { useState, useEffect, useMemo } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

export default function Education({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const edu = useMemo(() => profile.education?.[0] || {}, [profile.education]);

  // Local state for form inputs
  const [degree, setDegree] = useState(edu.degree || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(edu.fieldOfStudy || "");
  const [institution, setInstitution] = useState(edu.institution || "");
  const [endDate, setEndDate] = useState(edu.endDate || "");

  // Update local state when profile changes
  useEffect(() => {
    setDegree(edu.degree || "");
    setFieldOfStudy(edu.fieldOfStudy || "");
    setInstitution(edu.institution || "");
    setEndDate(edu.endDate || "");
  }, [edu]);

  const handleDegreeChange = (e) => {
    setDegree(e.target.value);
    const educationArray = [{
      ...edu,
      degree: e.target.value,
    }];
    updateProfile("education", educationArray);
  };

  const handleFieldOfStudyChange = (e) => {
    setFieldOfStudy(e.target.value);
    const educationArray = [{
      ...edu,
      fieldOfStudy: e.target.value,
    }];
    updateProfile("education", educationArray);
  };

  const handleInstitutionChange = (e) => {
    setInstitution(e.target.value);
    const educationArray = [{
      ...edu,
      institution: e.target.value,
    }];
    updateProfile("education", educationArray);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    const educationArray = [{
      ...edu,
      endDate: e.target.value,
    }];
    updateProfile("education", educationArray);
  };

  const hasError = !degree;

  return (
    <>
     <ProfileHeader />
      <h3>Education</h3>

      <div className="form-group">
        <label>Please enter the Course Name</label>
        <input
          className={hasError ? "input-error" : ""}
          value={degree}
          onChange={handleDegreeChange}
          placeholder="Course name"
        />
        {hasError && (
          <div className="error-text">01 error</div>
        )}
      </div>

      <div className="form-group">
        <label>Major</label>
        <input 
          value={fieldOfStudy} 
          onChange={handleFieldOfStudyChange}
        />
      </div>

      <div className="form-group">
        <label>Institution</label>
        <input 
          value={institution} 
          onChange={handleInstitutionChange}
        />
      </div>

      <div className="form-group">
        <label>Graduation Date</label>
        <input 
          value={endDate} 
          onChange={handleEndDateChange}
        />
      </div>

      <div className="form-actions">
        <button className="btn-secondary" onClick={onPrev}>
          Previous
        </button>
        <button className="btn-primary" onClick={onNext}>
          Save & Next
        </button>
      </div>
    </>
  );
}
