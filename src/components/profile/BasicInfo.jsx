import { useState, useEffect, useMemo } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";
import { getEmailFromToken } from "../../services/authService";
import { validateBasicInfo } from "../../utils/profileValidation";

function getLoginEmail() {
  const fromJwt = getEmailFromToken();
  if (fromJwt) return fromJwt;
  const stored = localStorage.getItem("userEmail");
  if (stored) return stored;
  return "";
}

export default function BasicInfo({ onNext, onPrev }) {

  const { profile, updateProfile } = useProfile();

  const data = useMemo(() => profile.basicInfo || {}, [profile.basicInfo]);

  const loginEmail = getLoginEmail();

  const nameParts = (data.name || "").split(" ");

  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState(data.phone ?? "");
  const [fieldErrors, setFieldErrors] = useState({});

  // Keep profile context email aligned with the logged-in account (JWT), not resume/upload extraction.
  useEffect(() => {
    const em = getEmailFromToken();
    if (!em) return;
    const cur = profile.basicInfo || {};
    if ((cur.email || "") === em) return;
    updateProfile("basicInfo", { ...cur, email: em });
  }, [profile.basicInfo, updateProfile]);

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
    if (fieldErrors.name) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }

    updateProfile("basicInfo", {
      ...data,
      name: `${value} ${lastName}`.trim(),
      email: loginEmail,
    });
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    if (fieldErrors.name) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }

    updateProfile("basicInfo", {
      ...data,
      name: `${firstName} ${value}`.trim(),
      email: loginEmail,
    });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (fieldErrors.phone) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }

    updateProfile("basicInfo", {
      ...data,
      phone: value,
      email: loginEmail,
    });
  };

  const handleNext = () => {
    const errs = validateBasicInfo(profile);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    onNext();
  };

  const nameMissing = Boolean(fieldErrors.name);
  const emailMissing = Boolean(fieldErrors.email);
  const phoneMissing = Boolean(fieldErrors.phone);

  return (
    <>
      <ProfileHeader />

      <h3>Basic Info</h3>

      <div className={`form-group${nameMissing ? " form-group--missing" : ""}`}>
        <label>First Name</label>
        <input
          value={firstName}
          onChange={handleFirstNameChange}
          className={nameMissing ? "input-error" : ""}
          aria-invalid={nameMissing}
        />
      </div>

      <div className={`form-group${nameMissing ? " form-group--missing" : ""}`}>
        <label>Last Name</label>
        <input
          value={lastName}
          onChange={handleLastNameChange}
          className={nameMissing ? "input-error" : ""}
          aria-invalid={nameMissing}
        />
        {nameMissing && (
          <p className="error-text" role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className={`form-group${emailMissing ? " form-group--missing" : ""}`}>
        <label>Email Address</label>

        <input
          value={loginEmail}
          readOnly
          aria-readonly="true"
          title="Cannot edit email"
          className={emailMissing ? "input-error" : ""}
          aria-invalid={emailMissing}
          style={{
            background: emailMissing ? "#fff1f2" : "#f3f4f6",
            cursor: "not-allowed",
          }}
        />
        {emailMissing && <p className="error-text">{fieldErrors.email}</p>}
      </div>

      <div className={`form-group${phoneMissing ? " form-group--missing" : ""}`}>
        <label>Phone Number</label>
        <input
          value={phone}
          onChange={handlePhoneChange}
          className={phoneMissing ? "input-error" : ""}
          aria-invalid={phoneMissing}
        />
        {phoneMissing && <p className="error-text">{fieldErrors.phone}</p>}
      </div>

      <div className="form-actions">

        {onPrev && (
          <button className="btn-secondary" onClick={onPrev}>
            Previous
          </button>
        )}

        {!onPrev && <div />}

        <button type="button" className="btn-primary" onClick={handleNext}>
          Next
        </button>

      </div>
    </>
  );
}