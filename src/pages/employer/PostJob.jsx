import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJob } from "../../services/jobService";
import Toast from "../../components/Toast";

export default function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    jobTitle: "System Assistant",
    companyName: "Meta",
    jobLocation: "Toronto",
    address: "Allentown, New Mexico 31134",
    yearsOfExperience: "2-3",
    jobType: "Remote",
    contractType: "Contract onsite",
    preferredLanguage: "English",
    urgentlyHiring: "No",
    jobDescription: `• Create wireframes, prototypes, and user flows to visualize and communicate design concepts.
• Collaborate with cross-functional teams including product managers, developers, and other designers to ensure seamless implementation.
• Translate research insights into actionable design solutions that enhance user satisfaction and engagement.`,
    jobRequirement: `• 7+ years of experience evolving and scaling high-performing design systems in a highly matrixed company
• 3+ years of experience in people leadership, with experience in hiring, leading, and coaching high performing teams
• Solid understanding of Design Systems - creating, designing, governing, and scaling reusable component libraries - and an ability to communicate its value to a large, complex organizations
• Understanding of best practices and process around governance and maintenance of large-scale design systems
• Influence strategy by developing partnerships, engaging and collaborating effectively with design, product, and engineering
• Operate comfortably in agile environments (e.g. sprints), helping the team prioritize work considering needs, resources and capacity`,
    estimatedSalary: "CAD 2500 - 3000",
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
      borderRadius: "12px",
      border: "2px solid #3b82f6",
      padding: "32px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
      borderColor: "#fb923c",
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
      borderColor: "#fb923c",
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
      accentColor: "#fb923c",
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
      background: "linear-gradient(90deg, #fb923c, #f97316)",
      color: "#ffffff",
      border: "none",
      padding: "14px 32px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: 600,
      width: "100%",
      marginTop: "8px",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
      marginBottom: "12px",
    },
  };

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

        {/* Form */}
        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Job Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Location</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = "#fb923c";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

          {/* Company Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Company Name</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#fb923c";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
              <span style={styles.calendarIcon}>📅</span>
            </div>
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
                e.target.style.borderColor = "#fb923c";
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
                e.target.style.borderColor = "#fb923c";
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
                        formData.contractType === option ? "#ec4899" : "#fb923c",
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
                  e.target.style.borderColor = "#fb923c";
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
                e.target.style.borderColor = "#fb923c";
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
                e.target.style.borderColor = "#fb923c";
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
                e.target.style.borderColor = "#fb923c";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>

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
