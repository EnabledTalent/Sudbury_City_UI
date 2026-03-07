import { useState, useEffect, useMemo } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

export default function BasicInfo({ onNext, onPrev }) {

  const { profile, updateProfile } = useProfile();

  const data = useMemo(() => profile.basicInfo || {}, [profile.basicInfo]);

  const loginEmail = localStorage.getItem("userEmail") || "";

  const nameParts = (data.name || "").split(" ");

  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState(data.phone ?? "");

  useEffect(() => {
    const name = data.name || "";
    const parts = name.split(" ");

    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setPhone(data.phone ?? "");

  }, [data]);

  const handleFirstNameChange = (e) => {

    const value = e.target.value;
    setFirstName(value);

    updateProfile("basicInfo", {
      ...data,
      name: `${value} ${lastName}`.trim(),
      email: loginEmail,
    });
  };

  const handleLastNameChange = (e) => {

    const value = e.target.value;
    setLastName(value);

    updateProfile("basicInfo", {
      ...data,
      name: `${firstName} ${value}`.trim(),
      email: loginEmail,
    });
  };

  const handlePhoneChange = (e) => {

    const value = e.target.value;
    setPhone(value);

    updateProfile("basicInfo", {
      ...data,
      phone: value,
      email: loginEmail,
    });
  };

  return (
    <>
      <ProfileHeader />

      <h3>Basic Info</h3>

      <div className="form-group">
        <label>First Name</label>
        <input value={firstName} onChange={handleFirstNameChange} />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input value={lastName} onChange={handleLastNameChange} />
      </div>

      <div className="form-group">
        <label>Email Address</label>

        <input
          value={loginEmail}
          disabled
          title="Email is linked to your account and cannot be edited"
          style={{
            background: "#f3f4f6",
            cursor: "not-allowed",
          }}
        />
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input value={phone} onChange={handlePhoneChange} />
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