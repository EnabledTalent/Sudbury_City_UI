import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

export default function Education({ onPrev, onNext }) {
  const { profile } = useProfile();
  const edu = profile.education?.[0] || {};

  const hasError = !edu.degree;

  return (
    <>
     <ProfileHeader />
      <h3>Education</h3>

      <div className="form-group">
        <label>Please enter the Course Name</label>
        <input
          className={hasError ? "input-error" : ""}
          value={edu.degree || ""}
          placeholder="Course name"
        />
        {hasError && (
          <div className="error-text">01 error</div>
        )}
      </div>

      <div className="form-group">
        <label>Major</label>
        <input value={edu.fieldOfStudy || ""} />
      </div>

      <div className="form-group">
        <label>Institution</label>
        <input value={edu.institution || ""} />
      </div>

      <div className="form-group">
        <label>Graduation Date</label>
        <input value={edu.endDate || ""} />
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
