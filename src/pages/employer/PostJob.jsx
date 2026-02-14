import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJob } from "../../services/jobService";
import Toast from "../../components/Toast";

export default function PostJob() {
  const navigate = useNavigate();
  const [applicationType, setApplicationType] = useState(null); // null, "easy-apply", or "apply-link"
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobLocation: "",
    address: "",
    yearsOfExperience: "",
    jobType: "",
    contractType: "",
    preferredLanguage: "",
    urgentlyHiring: "",
    jobDescription: "",
    jobRequirement: "",
    estimatedSalary: "",
    url: "", // For apply-link type
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Use the same endpoint for both types, URL will be included if it's apply-link
      await postJob(formData);
      setToast({ message: "Job posted successfully!", type: "success" });
      // Navigate to listed jobs on success after a short delay
      setTimeout(() => {
        navigate("/employer/listed-jobs");
      }, 1500);
    } catch (error) {
      console.error("Error posting job:", error);
      setToast({ message: `Failed to post job: ${error.message}`, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    page: {
      background: "#f2f7fd",
      minHeight: "100vh",
      padding: "20px",
    },
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      background: "#ffffff",
      borderRadius: "20px",
      border: "2px solid #16a34a",
      padding: "40px",
      boxShadow: "0 10px 30px rgba(22, 163, 74, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "32px",
      paddingBottom: "20px",
      borderBottom: "1px solid #e5e7eb",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      color: "#374151",
      fontWeight: 500,
    },
    closeButton: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "24px",
      color: "#6b7280",
      padding: "4px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 700,
      color: "#111827",
      textAlign: "center",
      flex: 1,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
    },
    inputWrapper: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#16a34a",
    },
    calendarIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      fontSize: "18px",
    },
    textarea: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      minHeight: "120px",
      resize: "vertical",
      fontFamily: "inherit",
      boxSizing: "border-box",
      lineHeight: "1.6",
    },
    textareaFocus: {
      borderColor: "#16a34a",
    },
    radioGroup: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
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
      accentColor: "#16a34a",
    },
    radioLabel: {
      fontSize: "14px",
      color: "#374151",
      cursor: "pointer",
    },
    selectWrapper: {
      position: "relative",
    },
    select: {
      width: "100%",
      padding: "12px 16px",
      paddingRight: "40px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      fontSize: "14px",
      outline: "none",
      background: "#ffffff",
      cursor: "pointer",
      appearance: "none",
      boxSizing: "border-box",
    },
    selectArrow: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      pointerEvents: "none",
    },
    jobTypeGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: "12px",
      marginBottom: "12px",
    },
    contractTypeGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "12px",
    },
    submitButton: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "16px 36px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: 600,
      width: "100%",
      marginTop: "12px",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "12px",
    },
    selectionContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      alignItems: "center",
      padding: "40px 20px",
    },
    selectionTitle: {
      fontSize: "20px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "12px",
    },
    selectionOptions: {
      display: "flex",
      gap: "24px",
      width: "100%",
      maxWidth: "600px",
    },
    selectionCard: {
      flex: 1,
      padding: "40px",
      borderRadius: "16px",
      border: "2px solid #e5e7eb",
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.3s ease",
      background: "#ffffff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
    },
    selectionCardHover: {
      borderColor: "#16a34a",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
    },
    selectionCardSelected: {
      borderColor: "#16a34a",
      background: "#f0fdf4",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
    },
    selectionCardTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "8px",
    },
    selectionCardDescription: {
      fontSize: "14px",
      color: "#6b7280",
      lineHeight: "1.5",
    },
    continueButton: {
      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
      color: "#ffffff",
      border: "none",
      padding: "16px 36px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: 600,
      marginTop: "32px",
      minWidth: "200px",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
      transition: "all 0.3s ease",
    },
    continueButtonDisabled: {
      background: "#d1d5db",
      cursor: "not-allowed",
    },
  };

  // Show selection screen if application type is not selected
  if (applicationType === null) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <button
              style={styles.backButton}
              onClick={() => navigate(-1)}
            >
              <span>←</span>
              Back
            </button>
            <h1 style={styles.title}>Post a Job</h1>
            <button
              style={styles.closeButton}
              onClick={() => navigate(-1)}
            >
              ×
            </button>
          </div>

          {/* Selection Screen */}
          <div style={styles.selectionContainer}>
            <h2 style={styles.selectionTitle}>Choose Application Type</h2>
            <div style={styles.selectionOptions}>
              <div
                style={{
                  ...styles.selectionCard,
                  ...(applicationType === "easy-apply" ? styles.selectionCardSelected : {}),
                }}
                onClick={() => setApplicationType("easy-apply")}
                onMouseEnter={(e) => {
                  if (applicationType !== "easy-apply") {
                    e.currentTarget.style.borderColor = "#16a34a";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (applicationType !== "easy-apply") {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div style={styles.selectionCardTitle}>Easy Apply</div>
                <div style={styles.selectionCardDescription}>
                  Candidates can apply directly through the platform using their profile
                </div>
              </div>
              <div
                style={{
                  ...styles.selectionCard,
                  ...(applicationType === "apply-link" ? styles.selectionCardSelected : {}),
                }}
                onClick={() => setApplicationType("apply-link")}
                onMouseEnter={(e) => {
                  if (applicationType !== "apply-link") {
                    e.currentTarget.style.borderColor = "#16a34a";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (applicationType !== "apply-link") {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div style={styles.selectionCardTitle}>Apply Link</div>
                <div style={styles.selectionCardDescription}>
                  Candidates will be redirected to your external application URL
                </div>
              </div>
            </div>
            <button
              style={{
                ...styles.continueButton,
                ...(!applicationType ? styles.continueButtonDisabled : {}),
              }}
              onClick={() => {
                if (applicationType) {
                  // Form will be shown on next render
                }
              }}
              disabled={!applicationType}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button
            style={styles.backButton}
            onClick={() => setApplicationType(null)}
          >
            <span>←</span>
            Back
          </button>
          <h1 style={styles.title}>Post a Job</h1>
          <button
            style={styles.closeButton}
            onClick={() => navigate(-1)}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Job Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* Company Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* Job Location */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Location</label>
            <input
              type="text"
              name="jobLocation"
              value={formData.jobLocation}
              onChange={handleInputChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* Address */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* Years of Experience */}
          <div style={styles.formGroup}>
            <div style={styles.sectionTitle}>Years of experience</div>
            <div style={styles.radioGroup}>
              {["1-2", "2-3", "3-5", "5+"].map((option) => (
                <div
                  key={option}
                  style={styles.radioOption}
                  onClick={() => handleRadioChange("yearsOfExperience", option)}
                >
                  <input
                    type="radio"
                    name="yearsOfExperience"
                    value={option}
                    checked={formData.yearsOfExperience === option}
                    onChange={() => handleRadioChange("yearsOfExperience", option)}
                    style={styles.radioInput}
                  />
                  <label style={styles.radioLabel}>{option}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div style={styles.formGroup}>
            <div style={styles.sectionTitle}>Job Type</div>
            <div style={styles.jobTypeGrid}>
              {["Full time", "Remote", "Part time", "Hybrid", "Internship"].map(
                (option) => (
                  <div
                    key={option}
                    style={styles.radioOption}
                    onClick={() => handleRadioChange("jobType", option)}
                  >
                    <input
                      type="radio"
                      name="jobType"
                      value={option}
                      checked={formData.jobType === option}
                      onChange={() => handleRadioChange("jobType", option)}
                      style={styles.radioInput}
                    />
                    <label style={styles.radioLabel}>{option}</label>
                  </div>
                )
              )}
            </div>
            <div style={styles.contractTypeGrid}>
              {[
                "Contract hybrid",
                "Contract remote",
                "Contract onsite",
                "Hourly based",
              ].map((option) => (
                <div
                  key={option}
                  style={styles.radioOption}
                  onClick={() => handleRadioChange("contractType", option)}
                >
                  <input
                    type="radio"
                    name="contractType"
                    value={option}
                    checked={formData.contractType === option}
                    onChange={() => handleRadioChange("contractType", option)}
                    style={{
                      ...styles.radioInput,
                      accentColor:
                        formData.contractType === option ? "#15803d" : "#16a34a",
                    }}
                  />
                  <label style={styles.radioLabel}>{option}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Language */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Preferred language</label>
            <div style={styles.selectWrapper}>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleInputChange}
                style={styles.select}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              >
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="Spanish">Spanish</option>
                <option value="German">German</option>
                <option value="Other">Other</option>
              </select>
              <span style={styles.selectArrow}>▼</span>
            </div>
          </div>

          {/* Urgently Hiring */}
          <div style={styles.formGroup}>
            <div style={styles.sectionTitle}>Are you urgently hiring?</div>
            <div style={styles.radioGroup}>
              {["Yes", "No"].map((option) => (
                <div
                  key={option}
                  style={styles.radioOption}
                  onClick={() => handleRadioChange("urgentlyHiring", option)}
                >
                  <input
                    type="radio"
                    name="urgentlyHiring"
                    value={option}
                    checked={formData.urgentlyHiring === option}
                    onChange={() => handleRadioChange("urgentlyHiring", option)}
                    style={styles.radioInput}
                  />
                  <label style={styles.radioLabel}>{option}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleInputChange}
              style={styles.textarea}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* Job Requirement */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Requirement</label>
            <textarea
              name="jobRequirement"
              value={formData.jobRequirement}
              onChange={handleInputChange}
              style={styles.textarea}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* Estimated Salary */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Estimated Salary</label>
            <input
              type="text"
              name="estimatedSalary"
              value={formData.estimatedSalary}
              onChange={handleInputChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = "#16a34a";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* URL Field - Only shown for Apply Link */}
          {applicationType === "apply-link" && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Application URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com/apply"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16a34a";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? "Posting Job..." : "Post Job"}
          </button>
        </form>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
