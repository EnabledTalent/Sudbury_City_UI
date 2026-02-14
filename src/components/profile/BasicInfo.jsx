import { useState, useEffect } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

export default function BasicInfo({ onNext, onPrev }) {
  const { profile, updateProfile } = useProfile();
  const data = profile.basicInfo || {};
  
  // Get name from various possible sources
  const getName = () => {
    return data.name || profile.fullName || "";
  };
  
  const nameParts = getName().split(" ");
  
  // Local state for form inputs
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(data.email || profile.email || "");
  const [phone, setPhone] = useState(data.phone || profile.phone || "");

  // Update local state when profile changes
  useEffect(() => {
    const name = data.name || profile.fullName || "";
    const nameParts = name.split(" ");
    setFirstName(nameParts[0] || "");
    setLastName(nameParts.slice(1).join(" ") || "");
    setEmail(data.email || profile.email || "");
    setPhone(data.phone || profile.phone || "");
  }, [data, profile]);

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
    const fullName = `${e.target.value} ${lastName}`.trim();
    updateProfile("basicInfo", {
      ...data,
      name: fullName,
    });
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
    const fullName = `${firstName} ${e.target.value}`.trim();
    updateProfile("basicInfo", {
      ...data,
      name: fullName,
    });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    updateProfile("basicInfo", {
      ...data,
      email: e.target.value,
    });
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    updateProfile("basicInfo", {
      ...data,
      phone: e.target.value,
    });
  };

  return (
    <>
      <ProfileHeader />
      <h3>Basic Info</h3>

      <div className="form-group">
        <label>First Name</label>
        <input 
          value={firstName} 
          onChange={handleFirstNameChange}
        />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input 
          value={lastName} 
          onChange={handleLastNameChange}
        />
      </div>

      <div className="form-group">
        <label>Email Address</label>
        <input 
          value={email} 
          onChange={handleEmailChange}
        />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input 
          value={phone} 
          onChange={handlePhoneChange}
        />
      </div>

      <div className="form-actions">
        {onPrev && (
          <button className="btn-secondary" onClick={onPrev}>
            Previous
          </button>
        )}
        {!onPrev && <div />}
        <button className="btn-primary" onClick={onNext}>
          Save & Next
        </button>
      </div>
    </>
  );
}
