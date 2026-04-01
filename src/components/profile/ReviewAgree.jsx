import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { saveProfile, updateProfile } from "../../services/profileService";
import ProfileHeader from "./ProfileHeader";

export default function ReviewAgree({ onPrev }) {
  const { profile, updateProfile: updateProfileContext } = useProfile();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const editMode = localStorage.getItem("profileEditMode") === "true";
    setIsEditMode(editMode);
  }, []);

  const reviewAgree = profile.reviewAgree || {
    discovery: "",
    comments: "",
    agreed: false,
    hasDisability: null,
  };

  const updateField = (field, value) => {
    updateProfileContext("reviewAgree", { ...reviewAgree, [field]: value });
  };

  const handleNext = async () => {
    const newErrors = {};

    if (!reviewAgree.agreed) {
      newErrors.agreed = "You must agree to the terms and conditions";
    }

    if (!reviewAgree.hasDisability && reviewAgree.hasDisability !== false) {
      newErrors.hasDisability = "Please select if you have a disability";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaveError("");
    setLoading(true);

    try {
      const updatedProfile = { ...profile, reviewAgree };

      isEditMode
        ? await updateProfile(updatedProfile)
        : await saveProfile(updatedProfile);

      localStorage.removeItem("profileEditMode");
      navigate("/student/success");
    } catch (error) {
      if (error.message?.includes("Invalid JSON")) {
        navigate("/student/success");
      } else {
        setSaveError(error.message || "Failed to save profile.");
        setLoading(false);
      }
    }
  };

  return (
    <>
      <ProfileHeader />

      <h3 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px" }}>
        Review & Agree
      </h3>

      {/* Disability */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontSize: "13px", fontWeight: 500 }}>
          Do you have a disability?{" "}
          <span style={{ color: "#ef4444" }}>*</span>
        </label>

        <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
          <label>
            <input
              type="radio"
              checked={reviewAgree.hasDisability === true}
              onChange={() => updateField("hasDisability", true)}
            />{" "}
            Yes
          </label>

          <label>
            <input
              type="radio"
              checked={reviewAgree.hasDisability === false}
              onChange={() => updateField("hasDisability", false)}
            />{" "}
            No
          </label>
        </div>

        {errors.hasDisability && (
          <div style={{ color: "red", fontSize: "12px" }}>
            {errors.hasDisability}
          </div>
        )}
      </div>

      {/* TERMS SECTION */}
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderLeft: "4px solid #c8a45c",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "10px" }}>
          This platform is powered by{" "}
          <span style={{ color: "#c8a45c" }}>
            Enabled HR Labs Inc.
          </span>
        </div>

        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
          To help match you with the right employers, Enabled HR Labs Inc.
          collects your profile information, including your skills and any
          accessibility needs you choose to share. All your data is handled
          securely, as explained in our{" "}
          <a href="/privacy-policy" style={{ color: "#c8a45c" }}>
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms-of-service" style={{ color: "#c8a45c" }}>
            Terms of Service
          </a>.
        </div>

        <div
          style={{
            background: "#fff7ed",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          <strong>Your privacy matters:</strong> Your information will never be
          shared without your permission. You can withdraw consent anytime at{" "}
          <a href="mailto:support@enabledtalent.ca" style={{ color: "#c8a45c" }}>
            support@enabledtalent.ca
          </a>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input
            type="checkbox"
            checked={reviewAgree.agreed}
            onChange={(e) => updateField("agreed", e.target.checked)}
          />

          <label style={{ fontSize: "14px" }}>
            I agree to the Privacy Policy and Terms and allow Enabled HR Labs Inc.
            to use my data.{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
        </div>

        {errors.agreed && (
          <div style={{ color: "red", fontSize: "12px" }}>
            {errors.agreed}
          </div>
        )}
      </div>

      {saveError && <div style={{ color: "red" }}>{saveError}</div>}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={onPrev}>Previous</button>
        <button onClick={handleNext}>
          {loading ? "Saving..." : "Save & Proceed"}
        </button>
      </div>
    </>
  );
}
