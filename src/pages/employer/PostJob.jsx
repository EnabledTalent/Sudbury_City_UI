import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJob, uploadEmployerJobPdf } from "../../services/jobService";
import { fetchOrganizationProfile } from "../../services/employerService";
import Toast from "../../components/Toast";

export default function PostJob() {
  const navigate = useNavigate();
  const pdfInputRef = useRef(null);
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
  const [pdfUploading, setPdfUploading] = useState(false);

  useEffect(() => {
    const draftName = localStorage.getItem("employer:orgName:draft");
    if (draftName) {
      setFormData((prev) => ({
        ...prev,
        companyName: prev.companyName || draftName,
      }));
    }

    const loadOrgName = async () => {
      try {
        const org = await fetchOrganizationProfile();
        const orgName = org?.organizationName || "";
        if (!orgName) return;

        setFormData((prev) => ({
          ...prev,
          companyName: prev.companyName || orgName,
        }));
      } catch {
        // Ignore prefill errors; user can still type company name
      }
    };

    loadOrgName();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "companyName") {
      localStorage.setItem("employer:orgName:draft", value);
    }
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });

  const normalizeUploadedJob = (raw) => {
    const root = raw && typeof raw === "object" ? raw : null;
    if (root && Array.isArray(root.jobs) && root.jobs.length > 0) {
      return normalizeUploadedJob(root.jobs[0]);
    }

    const job = raw?.job ? raw.job : raw;
    if (!job || typeof job !== "object") return null;

    const toNullableString = (value) => {
      if (value === null || value === undefined) return null;
      const str = String(value).trim();
      return str ? str : null;
    };

    const toNullableNumber = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const toBool = (value) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (v === "true" || v === "yes") return true;
        if (v === "false" || v === "no") return false;
      }
      return false;
    };

    // Ensure EXACT field set
    return {
      role: toNullableString(job.role ?? job.jobTitle ?? job.title),
      companyName: toNullableString(job.companyName ?? job.company ?? job.employer?.companyName),
      jobLocation: toNullableString(job.jobLocation ?? job.location ?? job.city),
      address: toNullableString(job.address),
      experienceRange: toNullableString(job.experienceRange ?? job.yearsOfExperience),
      employmentType: toNullableString(job.employmentType ?? job.jobType),
      typeOfWork: toNullableString(job.typeOfWork ?? job.workMode),
      preferredLanguage: toNullableString(job.preferredLanguage),
      urgentlyHiring: toBool(job.urgentlyHiring),
      jobDescription: toNullableString(job.jobDescription ?? job.description) || "",
      requirements: toNullableString(job.requirements ?? job.jobRequirement) || "",
      salaryMin: toNullableNumber(job.salaryMin),
      salaryMax: toNullableNumber(job.salaryMax),
      externalApplyUrl: toNullableString(job.externalApplyUrl ?? job.url),
    };
  };

  const mapExtractedJobToFormData = (extracted) => {
    const mapEmploymentToJobType = (value) => {
      if (!value) return "";
      const v = String(value).toLowerCase();
      if (v.includes("intern")) return "Internship";
      if (v.includes("part")) return "Part time";
      if (v.includes("full")) return "Full time";
      if (v.includes("contract")) return "";
      return "";
    };

    const mapWorkModeToJobType = (value) => {
      if (!value) return "";
      const v = String(value).toLowerCase();
      if (v.includes("remote")) return "Remote";
      if (v.includes("hybrid")) return "Hybrid";
      if (v.includes("on") && v.includes("site")) return "Onsite";
      return "";
    };

    const mapWorkModeToContractType = (value) => {
      if (!value) return "";
      const v = String(value).toLowerCase();
      if (v.includes("hybrid")) return "Contract hybrid";
      if (v.includes("remote")) return "Contract remote";
      if (v.includes("on") && v.includes("site")) return "Contract onsite";
      if (v.includes("hour")) return "Hourly based";
      return "";
    };

    const jobTypeFromEmployment = mapEmploymentToJobType(extracted.employmentType);
    const jobTypeFromWorkMode = mapWorkModeToJobType(extracted.typeOfWork);
    const nextJobType = jobTypeFromEmployment || jobTypeFromWorkMode;
    const employmentRaw = extracted.employmentType || "";
    const employmentLower = String(employmentRaw).toLowerCase();
    const isContractOrHourly =
      employmentLower.includes("contract") || employmentLower.includes("hour");
    const nextContractType = isContractOrHourly
      ? mapWorkModeToContractType(extracted.typeOfWork)
      : "";

    const salaryText =
      extracted.salaryMin !== null && extracted.salaryMax !== null
        ? `${extracted.salaryMin} - ${extracted.salaryMax}`
        : extracted.salaryMin !== null
        ? `${extracted.salaryMin}`
        : extracted.salaryMax !== null
        ? `${extracted.salaryMax}`
        : "";

    setFormData((prev) => ({
      ...prev,
      jobTitle: extracted.role || "",
      companyName: extracted.companyName || prev.companyName || "",
      jobLocation: extracted.jobLocation || "",
      address: extracted.address || "",
      yearsOfExperience: extracted.experienceRange || "",
      jobType: nextJobType,
      contractType: nextContractType,
      preferredLanguage: extracted.preferredLanguage || prev.preferredLanguage || "English",
      urgentlyHiring: extracted.urgentlyHiring ? "Yes" : "No",
      jobDescription: extracted.jobDescription || "",
      jobRequirement: extracted.requirements || "",
      estimatedSalary: salaryText,
      url: extracted.externalApplyUrl || prev.url || "",
    }));

    if (extracted.externalApplyUrl) {
      setApplicationType("apply-link");
      return;
    }
    setApplicationType((prev) => prev || "easy-apply");
  };

  const handlePdfPick = () => {
    pdfInputRef.current?.click();
  };

  const handlePdfChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setToast({ message: "Only PDF files are allowed", type: "error" });
      e.target.value = "";
      return;
    }

    setPdfUploading(true);
    try {
      const result = await uploadEmployerJobPdf(file);

      const candidate = Array.isArray(result)
        ? result[0]
        : result && Array.isArray(result.jobs)
        ? result.jobs[0]
        : result;
      const extracted = normalizeUploadedJob(candidate || result);
      if (!extracted) {
        throw new Error("Could not extract job fields from the uploaded PDF");
      }

      mapExtractedJobToFormData(extracted);
      setToast({ message: "Job details extracted from PDF.", type: "success" });
    } catch (error) {
      console.error("Error uploading job PDF:", error);
      setToast({ message: `Failed to upload PDF: ${error.message}`, type: "error" });
    } finally {
      setPdfUploading(false);
      e.target.value = "";
    }
  };

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
      background: "#f5f3ef",
      minHeight: "100vh",
      padding: "20px",
    },
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      background: "#ffffff",
      borderRadius: "20px",
      border: "2px solid #c8a45c",
      padding: "40px",
      boxShadow: "0 10px 30px rgba(200, 164, 92, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
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
      borderColor: "#c8a45c",
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
      borderColor: "#c8a45c",
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
      accentColor: "#c8a45c",
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
      background: "linear-gradient(135deg, #c8a45c 0%, #b8943f 100%)",
      color: "#ffffff",
      border: "none",
      padding: "16px 36px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: 600,
      width: "100%",
      marginTop: "12px",
      boxShadow: "0 4px 12px rgba(200, 164, 92, 0.3)",
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
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      width: "100%",
      maxWidth: "820px",
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
      borderColor: "#c8a45c",
      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
    },
    selectionCardSelected: {
      borderColor: "#c8a45c",
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
      background: "linear-gradient(135deg, #c8a45c 0%, #b8943f 100%)",
      color: "#ffffff",
      border: "none",
      padding: "16px 36px",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: 600,
      marginTop: "32px",
      minWidth: "200px",
      boxShadow: "0 4px 12px rgba(200, 164, 92, 0.3)",
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
                    e.currentTarget.style.borderColor = "#c8a45c";
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
                    e.currentTarget.style.borderColor = "#c8a45c";
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
              <div
                style={{
                  ...styles.selectionCard,
                  ...(pdfUploading ? styles.selectionCardSelected : {}),
                }}
                onClick={handlePdfPick}
                onMouseEnter={(e) => {
                  if (!pdfUploading) {
                    e.currentTarget.style.borderColor = "#c8a45c";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!pdfUploading) {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
                title="Upload a PDF job description to auto-fill fields."
              >
                <div style={styles.selectionCardTitle}>
                  {pdfUploading ? "Uploading…" : "Upload from PDF"}
                </div>
                <div style={styles.selectionCardDescription}>
                  Upload a PDF job description. We’ll extract details and fill the form for you.
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onChange={handlePdfChange}
                />
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
          {/* Upload from PDF */}
          <div
            style={{
              padding: "16px",
              borderRadius: "14px",
              border: "1px dashed #c7d2fe",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: "14px" }}>
                Upload from PDF{" "}
                <span
                  title="Upload a PDF job description to auto-fill the form fields."
                  style={{
                    display: "inline-flex",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e0f2fe",
                    color: "#0369a1",
                    fontSize: "12px",
                    cursor: "help",
                    marginLeft: "6px",
                  }}
                  aria-label="Upload PDF help"
                >
                  i
                </span>
              </div>
              <div style={{ color: "#6b7280", fontSize: "13px" }}>
                Please upload a <strong>PDF</strong> file to extract job details.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={handlePdfPick}
                disabled={pdfUploading}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  cursor: pdfUploading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {pdfUploading ? "Uploading..." : "Upload PDF"}
              </button>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={handlePdfChange}
              />
            </div>
          </div>

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
                e.target.style.borderColor = "#c8a45c";
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
                e.target.style.borderColor = "#c8a45c";
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
                e.target.style.borderColor = "#c8a45c";
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
                e.target.style.borderColor = "#c8a45c";
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
              {["Full time", "Remote", "Part time", "Hybrid", "Onsite", "Internship"].map(
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
                        formData.contractType === option ? "#b8943f" : "#c8a45c",
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
                  e.target.style.borderColor = "#c8a45c";
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
                e.target.style.borderColor = "#c8a45c";
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
                e.target.style.borderColor = "#c8a45c";
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
                e.target.style.borderColor = "#c8a45c";
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
                  e.target.style.borderColor = "#c8a45c";
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
