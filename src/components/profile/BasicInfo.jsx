import { useProfile } from "../../context/ProfileContext";

export default function BasicInfo({ onNext }) {
  const { profile } = useProfile();
  const data = profile.basicInfo || {};
 
  

  return (
    <>
      <div className="profile-banner">
        <h2>Welcome {data.name || "User"}</h2>
      </div>

      <h3>Basic Info</h3>

      <div className="form-group">
        <label>First Name</label>
        <input value={data.name?.split(" ")[0] || ""} />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input value={data.name?.split(" ")[1] || ""} />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input value={data.email || ""} />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input value={data.phone || ""} />
      </div>

      <div className="form-actions">
        <div />
        <button className="btn-primary" onClick={onNext}>
          Save & Next
        </button>
      </div>
    </>
  );
}
