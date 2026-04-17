import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { saveProfile, updateProfile } from "../../services/profileService";
import ProfileHeader from "./ProfileHeader";
import {
  mergeReviewAgree,
  deriveHasDisabilityFromIdentifiesAs,
  DISABILITY_TYPE_OPTIONS,
  ACCOMMODATION_SUPPORT_OPTIONS,
  PLATFORM_ACCESSIBILITY_OPTIONS,
} from "../../utils/disabilityReviewConstants";

export default function ReviewAgree({ onPrev, onNext }) {
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

  const reviewAgree = useMemo(
    () => mergeReviewAgree(profile.reviewAgree),
    [profile.reviewAgree]
  );

  const d = reviewAgree.disability;

  const updateField = (field, value) => {
    updateProfileContext("reviewAgree", { ...reviewAgree, [field]: value });
  };

  const patchReviewAgree = useCallback(
    (next) => {
      const hasDisability = deriveHasDisabilityFromIdentifiesAs(next.disability?.identifiesAs);
      updateProfileContext("reviewAgree", { ...next, hasDisability });
    },
    [updateProfileContext]
  );

  const patchDisability = useCallback(
    (partial) => {
      const nextDisability = { ...d, ...partial };
      patchReviewAgree({
        ...reviewAgree,
        hasDisability: deriveHasDisabilityFromIdentifiesAs(nextDisability.identifiesAs),
        disability: nextDisability,
      });
    },
    [d, reviewAgree, patchReviewAgree]
  );

  const toggleInArray = (field, value, maxOther) => {
    const arr = d[field] || [];
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    const patch = { [field]: next };
    if (value === "OTHER" && !next.includes("OTHER")) {
      patch[maxOther] = "";
    }
    patchDisability(patch);
  };

  const q2Disabled = d.identifiesAs !== "yes";
  const q4Disabled = d.workplaceAccommodations !== "yes";

  const setIdentifiesAs = (val) => {
    const patch = { identifiesAs: val };
    if (val !== "yes") {
      patch.disabilityTypes = [];
      patch.disabilityTypesOther = "";
    }
    patchDisability(patch);
  };

  const setWorkplaceAccommodations = (val) => {
    const patch = { workplaceAccommodations: val };
    if (val !== "yes") {
      patch.accommodationSupport = [];
      patch.accommodationSupportOther = "";
    }
    patchDisability(patch);
  };

  const validate = () => {
    const newErrors = {};

    if (!reviewAgree.agreed) {
      newErrors.agreed = "You must agree to the terms and conditions";
    }

    if (!d.identifiesAs) {
      newErrors.identifiesAs = "Please select an option";
    }

    if (d.identifiesAs === "yes") {
      if (!d.disabilityTypes?.length) {
        newErrors.disabilityTypes = "Select at least one option";
      }
      if (d.disabilityTypes?.includes("OTHER") && !String(d.disabilityTypesOther || "").trim()) {
        newErrors.disabilityTypesOther = "Please specify";
      }
    }

    if (!d.workplaceAccommodations) {
      newErrors.workplaceAccommodations = "Please select an option";
    }

    if (d.workplaceAccommodations === "yes") {
      if (!d.accommodationSupport?.length) {
        newErrors.accommodationSupport = "Select at least one option";
      }
      if (d.accommodationSupport?.includes("OTHER") && !String(d.accommodationSupportOther || "").trim()) {
        newErrors.accommodationSupportOther = "Please specify";
      }
    }

    if (d.platformAccessibilityNeeded !== true && d.platformAccessibilityNeeded !== false) {
      newErrors.platformAccessibilityNeeded = "Please select Yes or No";
    }

    if (d.platformAccessibilityNeeded === true) {
      if (!d.platformAccessibilityFeatures?.length) {
        newErrors.platformAccessibilityFeatures = "Select at least one option";
      }
      if (
        d.platformAccessibilityFeatures?.includes("OTHER") &&
        !String(d.platformAccessibilityOther || "").trim()
      ) {
        newErrors.platformAccessibilityOther = "Please specify";
      }
    }

    if (!d.discussWithHr) {
      newErrors.discussWithHr = "Please select an option";
    }

    return newErrors;
  };

  const handleNext = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSaveError("");

    const hasDisability = deriveHasDisabilityFromIdentifiesAs(d.identifiesAs);
    const updatedProfile = {
      ...profile,
      reviewAgree: { ...reviewAgree, hasDisability },
    };

    setLoading(true);

    try {
      isEditMode ? await updateProfile(updatedProfile) : await saveProfile(updatedProfile);

      localStorage.removeItem("profileEditMode");

      navigate("/student/success");
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "saving"} profile:`, error);
      if (error.message && error.message.includes("Invalid JSON")) {
        localStorage.removeItem("profileEditMode");
        navigate("/student/success");
      } else {
        setSaveError(error.message || `Failed to ${isEditMode ? "update" : "save"} profile. Please try again.`);
        setLoading(false);
      }
    }
  };

  const styles = {
    sectionHeader: {
      marginBottom: "24px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "24px",
      fontWeight: 600,
    },
    subsectionTitle: {
      margin: "0 0 16px 0",
      fontSize: "17px",
      fontWeight: 600,
      color: "#111827",
    },
    subsectionHint: {
      fontSize: "13px",
      color: "#6b7280",
      marginBottom: "12px",
      lineHeight: 1.5,
    },
    formGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 500,
      marginBottom: "6px",
    },
    select: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      background: "#ffffff",
      cursor: "pointer",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      resize: "vertical",
      outline: "none",
      fontFamily: "inherit",
      minHeight: "100px",
    },
    termsSection: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "20px",
      marginBottom: "20px",
    },
    termsTitle: {
      fontSize: "16px",
      fontWeight: 600,
      marginBottom: "16px",
      color: "#111827",
    },
    termsText: {
      fontSize: "13px",
      color: "#6b7280",
      lineHeight: "1.6",
      marginBottom: "12px",
    },
    checkboxWrapper: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      marginTop: "16px",
    },
    checkbox: {
      width: "20px",
      height: "20px",
      cursor: "pointer",
      accentColor: "#c8a45c",
      marginTop: "2px",
    },
    checkboxLabel: {
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
      lineHeight: "1.5",
    },
    errorText: {
      fontSize: "12px",
      color: "#ef4444",
      marginTop: "6px",
    },
    radioGroup: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
      marginTop: "8px",
    },
    radioOption: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
    },
    radioInput: {
      width: "18px",
      height: "18px",
      cursor: "pointer",
      accentColor: "#c8a45c",
    },
    radioLabel: {
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
    },
    checkGrid: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginTop: "8px",
    },
    checkRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    },
    disabilityBox: {
      background: "#fafafa",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
    },
    formActions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "32px",
    },
    btnSecondary: {
      background: "#f3f4f6",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
    },
    btnPrimary: {
      background: "#c8a45c",
      color: "#ffffff",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      minWidth: "140px",
    },
    btnPrimaryDisabled: {
      background: "#c8a45c",
      color: "#ffffff",
      border: "none",
      padding: "12px 20px",
      borderRadius: "8px",
      cursor: "not-allowed",
      fontSize: "14px",
      fontWeight: 500,
      opacity: 0.7,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      minWidth: "140px",
    },
    loadingSpinner: {
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderTop: "2px solid #ffffff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    },
    errorMessage: {
      background: "#fff1f2",
      border: "1px solid #ef4444",
      borderRadius: "8px",
      padding: "12px 16px",
      marginBottom: "20px",
      color: "#ef4444",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    errorIcon: {
      fontSize: "18px",
    },
    questionDivider: {
      border: "none",
      borderTop: "1px solid #e5e7eb",
      margin: "20px 0",
    },
    disabledBlock: {
      opacity: 0.55,
    },
    disabledHint: {
      fontSize: "12px",
      color: "#6b7280",
      marginBottom: "8px",
      fontStyle: "italic",
    },
    questionHeading: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#111827",
      margin: "0 0 10px 0",
      lineHeight: 1.4,
    },
  };

  const radioTriplet = (name, value, onChange, options) => (
    <div style={styles.radioGroup} role="radiogroup" aria-label={name}>
      {options.map(({ val, label }) => (
        <div key={val} style={styles.radioOption}>
          <input
            type="radio"
            id={`${name}-${val}`}
            name={name}
            value={val}
            style={styles.radioInput}
            checked={value === val}
            onChange={() => onChange(val)}
          />
          <label htmlFor={`${name}-${val}`} style={styles.radioLabel}>
            {label}
          </label>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <ProfileHeader />
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Review & Agree</h3>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>How did you discover the Sudbury Jobs talent platform?</label>
        <select
          style={styles.select}
          value={reviewAgree.discovery}
          onChange={(e) => updateField("discovery", e.target.value)}
        >
          <option value="">Select an option</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Facebook">Facebook</option>
          <option value="Twitter">Twitter</option>
          <option value="Friend/Colleague">Friend/Colleague</option>
          <option value="University">University</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div style={styles.disabilityBox} data-tour="profile-step-reviewAgree">
        <h4 style={styles.subsectionTitle}>Accessibility & disability</h4>
        <p style={styles.subsectionHint}>
          All six questions below are part of your profile. Questions 2 and 4 use multiple choice (select all that apply)
          when the previous answer is Yes.
        </p>

        <div style={styles.formGroup}>
          <p id="disability-q1" style={styles.questionHeading}>
            1. Do you identify as a person with a disability?
          </p>
          {radioTriplet(
            "identifies-as",
            d.identifiesAs,
            setIdentifiesAs,
            [
              { val: "yes", label: "Yes" },
              { val: "no", label: "No" },
              { val: "prefer_not_to_say", label: "Prefer not to say" },
            ]
          )}
          {errors.identifiesAs && <div style={styles.errorText}>{errors.identifiesAs}</div>}
        </div>

        <hr style={styles.questionDivider} aria-hidden="true" />

        <div style={styles.formGroup}>
          <p style={styles.questionHeading}>2. Type of disability (select all that apply)</p>
          {q2Disabled && (
            <p style={styles.disabledHint}>
              Select &quot;Yes&quot; in question 1 to choose one or more types. Multiple selections are allowed.
            </p>
          )}
          <div style={q2Disabled ? styles.disabledBlock : undefined}>
            <label style={styles.label}>
              Options <span style={{ color: "#ef4444" }}>*</span> <span style={{ fontWeight: 400 }}>(if you selected Yes in question 1)</span>
            </label>
            <div style={styles.checkGrid} role="group" aria-label="Type of disability, select all that apply">
              {DISABILITY_TYPE_OPTIONS.map((opt) => (
                <div key={opt.value} style={styles.checkRow}>
                  <input
                    type="checkbox"
                    id={`dtype-${opt.value}`}
                    style={styles.checkbox}
                    disabled={q2Disabled}
                    checked={d.disabilityTypes?.includes(opt.value)}
                    onChange={() => toggleInArray("disabilityTypes", opt.value, "disabilityTypesOther")}
                  />
                  <label htmlFor={`dtype-${opt.value}`} style={styles.checkboxLabel}>
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
            {d.disabilityTypes?.includes("OTHER") && !q2Disabled && (
              <input
                type="text"
                style={{ ...styles.select, marginTop: "10px" }}
                placeholder="Please specify"
                value={d.disabilityTypesOther || ""}
                onChange={(e) => patchDisability({ disabilityTypesOther: e.target.value })}
                aria-label="Other disability specification"
              />
            )}
            {errors.disabilityTypes && <div style={styles.errorText}>{errors.disabilityTypes}</div>}
            {errors.disabilityTypesOther && <div style={styles.errorText}>{errors.disabilityTypesOther}</div>}
          </div>
        </div>

        <hr style={styles.questionDivider} aria-hidden="true" />

        <div style={styles.formGroup}>
          <p style={styles.questionHeading}>3. Do you require workplace accommodations?</p>
          {radioTriplet(
            "workplace-accommodations",
            d.workplaceAccommodations,
            setWorkplaceAccommodations,
            [
              { val: "yes", label: "Yes" },
              { val: "no", label: "No" },
              { val: "not_sure", label: "Not sure yet" },
            ]
          )}
          {errors.workplaceAccommodations && (
            <div style={styles.errorText}>{errors.workplaceAccommodations}</div>
          )}
        </div>

        <hr style={styles.questionDivider} aria-hidden="true" />

        <div style={styles.formGroup}>
          <p style={styles.questionHeading}>
            4. What kind of support/accommodations do you need? (select all that apply)
          </p>
          {q4Disabled && (
            <p style={styles.disabledHint}>
              Select &quot;Yes&quot; in question 3 to choose support options. Multiple selections are allowed.
            </p>
          )}
          <div style={q4Disabled ? styles.disabledBlock : undefined}>
            <label style={styles.label}>
              Options <span style={{ color: "#ef4444" }}>*</span>{" "}
              <span style={{ fontWeight: 400 }}>(if you selected Yes in question 3)</span>
            </label>
            <div style={styles.checkGrid} role="group" aria-label="Support and accommodations, select all that apply">
              {ACCOMMODATION_SUPPORT_OPTIONS.map((opt) => (
                <div key={opt.value} style={styles.checkRow}>
                  <input
                    type="checkbox"
                    id={`acc-${opt.value}`}
                    style={styles.checkbox}
                    disabled={q4Disabled}
                    checked={d.accommodationSupport?.includes(opt.value)}
                    onChange={() => toggleInArray("accommodationSupport", opt.value, "accommodationSupportOther")}
                  />
                  <label htmlFor={`acc-${opt.value}`} style={styles.checkboxLabel}>
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
            {d.accommodationSupport?.includes("OTHER") && !q4Disabled && (
              <input
                type="text"
                style={{ ...styles.select, marginTop: "10px" }}
                placeholder="Please specify"
                value={d.accommodationSupportOther || ""}
                onChange={(e) => patchDisability({ accommodationSupportOther: e.target.value })}
                aria-label="Other accommodation specification"
              />
            )}
            {errors.accommodationSupport && <div style={styles.errorText}>{errors.accommodationSupport}</div>}
            {errors.accommodationSupportOther && (
              <div style={styles.errorText}>{errors.accommodationSupportOther}</div>
            )}
          </div>
        </div>

        <hr style={styles.questionDivider} aria-hidden="true" />

        <div style={styles.formGroup}>
          <p style={styles.questionHeading}>5. Accessibility needs for platforms/tools</p>
          <label style={styles.label}>
            Do you need accessibility features enabled? <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={styles.radioGroup}>
            <div style={styles.radioOption}>
              <input
                type="radio"
                id="plat-yes"
                name="platformAccessibility"
                style={styles.radioInput}
                checked={d.platformAccessibilityNeeded === true}
                onChange={() => patchDisability({ platformAccessibilityNeeded: true })}
              />
              <label htmlFor="plat-yes" style={styles.radioLabel}>
                Yes
              </label>
            </div>
            <div style={styles.radioOption}>
              <input
                type="radio"
                id="plat-no"
                name="platformAccessibility"
                style={styles.radioInput}
                checked={d.platformAccessibilityNeeded === false}
                onChange={() =>
                  patchDisability({
                    platformAccessibilityNeeded: false,
                    platformAccessibilityFeatures: [],
                    platformAccessibilityOther: "",
                  })
                }
              />
              <label htmlFor="plat-no" style={styles.radioLabel}>
                No
              </label>
            </div>
          </div>
          {errors.platformAccessibilityNeeded && (
            <div style={styles.errorText}>{errors.platformAccessibilityNeeded}</div>
          )}

          {d.platformAccessibilityNeeded === true && (
            <>
              <label style={{ ...styles.label, marginTop: "16px" }}>
                If yes, select all that apply <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={styles.checkGrid} role="group" aria-label="Platform accessibility features">
                {PLATFORM_ACCESSIBILITY_OPTIONS.map((opt) => (
                  <div key={opt.value} style={styles.checkRow}>
                    <input
                      type="checkbox"
                      id={`platf-${opt.value}`}
                      style={styles.checkbox}
                      checked={d.platformAccessibilityFeatures?.includes(opt.value)}
                      onChange={() =>
                        toggleInArray("platformAccessibilityFeatures", opt.value, "platformAccessibilityOther")
                      }
                    />
                    <label htmlFor={`platf-${opt.value}`} style={styles.checkboxLabel}>
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
              {d.platformAccessibilityFeatures?.includes("OTHER") && (
                <input
                  type="text"
                  style={{ ...styles.select, marginTop: "10px" }}
                  placeholder="Please specify"
                  value={d.platformAccessibilityOther || ""}
                  onChange={(e) => patchDisability({ platformAccessibilityOther: e.target.value })}
                  aria-label="Other platform accessibility specification"
                />
              )}
              {errors.platformAccessibilityFeatures && (
                <div style={styles.errorText}>{errors.platformAccessibilityFeatures}</div>
              )}
              {errors.platformAccessibilityOther && (
                <div style={styles.errorText}>{errors.platformAccessibilityOther}</div>
              )}
            </>
          )}
        </div>

        <hr style={styles.questionDivider} aria-hidden="true" />

        <div style={styles.formGroup}>
          <p style={styles.questionHeading}>6. Would you like to discuss accommodations with HR?</p>
          {radioTriplet(
            "discuss-hr",
            d.discussWithHr,
            (val) => patchDisability({ discussWithHr: val }),
            [
              { val: "yes", label: "Yes" },
              { val: "no", label: "No" },
              { val: "maybe_later", label: "Maybe later" },
            ]
          )}
          {errors.discussWithHr && <div style={styles.errorText}>{errors.discussWithHr}</div>}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Comments</label>
        <textarea
          style={styles.textarea}
          value={reviewAgree.comments}
          onChange={(e) => updateField("comments", e.target.value)}
          placeholder="Please leave any additional comments or feedback"
          onFocus={(e) => (e.target.style.borderColor = "#c8a45c")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>

      <div style={styles.termsSection}>
        <div style={styles.termsTitle}>Terms And Conditions</div>
        <div style={styles.termsText}>
          This platform is powered by <strong>Enabled HR Labs Inc.</strong>
        </div>
        <div style={styles.termsText}>
          To help match you with the right employers, Enabled HR Labs Inc. collects your profile information, including
          your skills and any accessibility needs you choose to share. All your data is handled securely, as explained in
          our{" "}
          <a
            href="https://sudburyjobs.ca/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#c8a45c", textDecoration: "underline" }}
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://sudburyjobs.ca/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#c8a45c", textDecoration: "underline" }}
          >
            Terms of Service
          </a>
          .
        </div>
        <div style={styles.termsText}>
          Most importantly, your information will never be shared with an employer without your direct permission. You are
          always in control. You can withdraw your consent at any time by contacting us at{" "}
          <a href="mailto:support@enabledtalent.ca" style={{ color: "#c8a45c", textDecoration: "underline" }}>
            support@enabledtalent.ca
          </a>
          .
        </div>
        <div style={styles.checkboxWrapper}>
          <input
            type="checkbox"
            id="agree-checkbox"
            style={styles.checkbox}
            checked={reviewAgree.agreed}
            onChange={(e) => updateField("agreed", e.target.checked)}
          />
          <label htmlFor="agree-checkbox" style={styles.checkboxLabel}>
            I have read the Privacy Policy and Terms of Service, and I agree to let Enabled HR Labs Inc. collect and use
            my personal information as described to support my job search. <span style={{ color: "#ef4444" }}>*</span>
          </label>
        </div>
        {errors.agreed && <div style={styles.errorText}>{errors.agreed}</div>}
      </div>

      {saveError && (
        <div style={styles.errorMessage}>
          <span style={styles.errorIcon}>⚠</span>
          <span>{saveError}</span>
        </div>
      )}

      <div style={styles.formActions}>
        <button
          style={{
            ...styles.btnSecondary,
            ...(loading ? { opacity: 0.6, cursor: "not-allowed" } : {}),
          }}
          onClick={onPrev}
          disabled={loading}
        >
          Previous
        </button>
        <button
          style={loading ? styles.btnPrimaryDisabled : styles.btnPrimary}
          onClick={handleNext}
          disabled={loading}
        >
          {loading && (
            <span style={styles.loadingSpinner} className="loading-spinner"></span>
          )}
          {loading
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
              ? "Update profile"
              : "Save profile"}
        </button>
      </div>
    </>
  );
}
