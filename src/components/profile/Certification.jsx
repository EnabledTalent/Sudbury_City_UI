import { useState, useEffect } from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileHeader from "./ProfileHeader";

const emptyCertification = {
  name: "",
  issueDate: "",
  issuedOrganization: "",
  credentialId: "",
};

const normalizeCertification = (cert) => {
  if (typeof cert === "string") {
    return {
      name: cert || "",
      issueDate: "",
      issuedOrganization: "",
      credentialId: "",
    };
  }
  return {
    name: cert.name || "",
    issueDate: cert.issueDate || "",
    issuedOrganization: cert.issuedOrganization || "",
    credentialId: cert.credentialId || cert.credentialURL || "",
  };
};

const denormalizeCertification = (cert) => ({
  name: cert.name || null,
  issueDate: cert.issueDate || null,
  issuedOrganization: cert.issuedOrganization || null,
  credentialId: cert.credentialId || null,
});

export default function Certification({ onPrev, onNext }) {
  const { profile, updateProfile } = useProfile();
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (
      profile.certification &&
      Array.isArray(profile.certification) &&
      profile.certification.length > 0
    ) {
      const firstCert = profile.certification[0];
      if (typeof firstCert === "string" || !firstCert.name) {
        const normalizedCerts = profile.certification.map(normalizeCertification);
        updateProfile("certification", normalizedCerts);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const certifications =
    profile.certification && profile.certification.length > 0
      ? profile.certification.map(normalizeCertification)
      : [emptyCertification];

  const updateCertification = (index, field, value) => {
    const uiList = [...certifications];
    uiList[index] = { ...uiList[index], [field]: value };
    const backendList = uiList.map(denormalizeCertification);
    updateProfile("certification", backendList);
  };

  const addCertification = () => {
    const uiList = [...certifications, emptyCertification];
    const backendList = uiList.map(denormalizeCertification);
    updateProfile("certification", backendList);
  };

  const removeCertification = (index) => {
    if (certifications.length === 1) return;
    const uiList = certifications.filter((_, i) => i !== index);
    const backendList = uiList.map(denormalizeCertification);
    updateProfile("certification", backendList);
    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const validationErrors = [];
    let hasErrors = false;

    certifications.forEach((cert, index) => {
      const entryErrors = {};
      if (!cert.name) {
        entryErrors.name = "Name of certification is required";
        hasErrors = true;
      }
      if (!cert.credentialId) {
        entryErrors.credentialId = "Credential ID/URL is required";
        hasErrors = true;
      }
      validationErrors[index] = entryErrors;
    });

    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onNext();
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
    },
    sectionTitle: {
      margin: 0,
      fontSize: "28px",
      fontWeight: 700,
      color: "#111827",
      letterSpacing: "-0.5px",
    },
    errorBadge: {
      fontSize: "12px",
      color: "#ef4444",
      fontWeight: 600,
      padding: "4px 8px",
      borderRadius: "4px",
      background: "#fff1f2",
    },
    certCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      padding: "32px",
      marginBottom: "24px",
      background: "#ffffff",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      transition: "all 0.2s ease",
    },
    certCardHover: {
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    certHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: "1px solid #f3f4f6",
    },
    certTitle: {
      margin: 0,
      fontSize: "18px",
      fontWeight: 600,
      color: "#111827",
    },
    deleteBtn: {
      background: "transparent",
      border: "none",
      color: "#ef4444",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      padding: "6px 12px",
      borderRadius: "6px",
      transition: "all 0.2s ease",
    },
    deleteBtnHover: {
      background: "#fff1f2",
    },
    formGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "8px",
      color: "#374151",
    },
    labelRequired: {
      display: "inline",
      color: "#ef4444",
      marginLeft: "2px",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      borderRadius: "10px",
      border: "2px solid #e5e7eb",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease",
      background: "#ffffff",
      color: "#111827",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#fb923c",
      boxShadow: "0 0 0 3px rgba(251, 146, 60, 0.1)",
    },
    inputError: {
      width: "100%",
      padding: "14px 16px",
      paddingRight: "40px",
      borderRadius: "10px",
      border: "2px solid #ef4444",
      background: "#fff1f2",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s ease",
      color: "#111827",
      boxSizing: "border-box",
    },
    inputErrorFocus: {
      borderColor: "#ef4444",
      boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
    },
    inputWrapper: {
      position: "relative",
    },
    errorIcon: {
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#ef4444",
      fontSize: "18px",
      fontWeight: "bold",
    },
    errorText: {
      fontSize: "13px",
      color: "#ef4444",
      marginTop: "8px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    placeholder: {
      color: "#9ca3af",
    },
    addButton: {
      background: "#ffffff",
      border: "2px dashed #d1d5db",
      padding: "14px 24px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 600,
      color: "#6b7280",
      marginBottom: "8px",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      justifyContent: "center",
    },
    addButtonHover: {
      borderColor: "#fb923c",
      color: "#fb923c",
      background: "#fff7ed",
    },
    addButtonIcon: {
      fontSize: "18px",
      fontWeight: "bold",
    },
    formActions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "40px",
      paddingTop: "24px",
      borderTop: "1px solid #f3f4f6",
      gap: "16px",
    },
    btnSecondary: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      padding: "14px 28px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 600,
      color: "#374151",
      transition: "all 0.2s ease",
      minWidth: "120px",
    },
    btnSecondaryHover: {
      background: "#f3f4f6",
      borderColor: "#d1d5db",
    },
    btnPrimary: {
      background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      color: "#ffffff",
      border: "none",
      padding: "14px 28px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: 600,
      transition: "all 0.2s ease",
      boxShadow: "0 4px 6px -1px rgba(217, 119, 6, 0.3)",
      minWidth: "120px",
    },
    btnPrimaryHover: {
      transform: "translateY(-1px)",
      boxShadow: "0 6px 8px -1px rgba(217, 119, 6, 0.4)",
    },
  };

  const hasError = errors.some((e) => Object.keys(e || {}).length > 0);

  return (
    <div style={styles.container}>
      <ProfileHeader />
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Certifications</h3>
        {hasError && <span style={styles.errorBadge}>01 error</span>}
      </div>

      {certifications.map((cert, index) => (
        <div
          key={index}
          style={styles.certCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = styles.certCardHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = styles.certCard.boxShadow;
          }}
        >
          <div style={styles.certHeader}>
            <h4 style={styles.certTitle}>Certification {index + 1}</h4>
            {certifications.length > 1 && (
              <button
                type="button"
                style={styles.deleteBtn}
                onClick={() => removeCertification(index)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = styles.deleteBtnHover.background;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                🗑 Delete
              </button>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Name of certification
              <span style={styles.labelRequired}>*</span>
            </label>
            <input
              style={errors[index]?.name ? styles.inputError : styles.input}
              value={cert.name}
              onChange={(e) => updateCertification(index, "name", e.target.value)}
              placeholder="Enter certification name"
              onFocus={(e) => {
                if (errors[index]?.name) {
                  Object.assign(e.target.style, styles.inputErrorFocus);
                } else {
                  Object.assign(e.target.style, styles.inputFocus);
                }
              }}
              onBlur={(e) => {
                if (errors[index]?.name) {
                  e.target.style.borderColor = "#ef4444";
                  e.target.style.boxShadow = "none";
                } else {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }
              }}
            />
            {errors[index]?.name && (
              <div style={styles.errorText}>
                <span>⚠</span>
                {errors[index].name}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Issue Date</label>
            <input
              type="text"
              style={styles.input}
              value={cert.issueDate}
              onChange={(e) =>
                updateCertification(index, "issueDate", e.target.value)
              }
              placeholder="e.g., Aug 2021"
              onFocus={(e) => {
                Object.assign(e.target.style, styles.inputFocus);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Issued organization</label>
            <input
              style={styles.input}
              value={cert.issuedOrganization}
              onChange={(e) =>
                updateCertification(index, "issuedOrganization", e.target.value)
              }
              placeholder="Enter organization name"
              onFocus={(e) => {
                Object.assign(e.target.style, styles.inputFocus);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Credential ID/URL
              <span style={styles.labelRequired}>*</span>
            </label>
            <div style={styles.inputWrapper}>
              <input
                style={
                  errors[index]?.credentialId ? styles.inputError : styles.input
                }
                value={cert.credentialId}
                onChange={(e) =>
                  updateCertification(index, "credentialId", e.target.value)
                }
                placeholder="Enter credential ID or URL"
                onFocus={(e) => {
                  if (errors[index]?.credentialId) {
                    Object.assign(e.target.style, styles.inputErrorFocus);
                  } else {
                    Object.assign(e.target.style, styles.inputFocus);
                  }
                }}
                onBlur={(e) => {
                  if (errors[index]?.credentialId) {
                    e.target.style.borderColor = "#ef4444";
                    e.target.style.boxShadow = "none";
                  } else {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
              {errors[index]?.credentialId && (
                <span style={styles.errorIcon}>!</span>
              )}
            </div>
            {errors[index]?.credentialId && (
              <div style={styles.errorText}>
                <span>⚠</span>
                {errors[index].credentialId}
              </div>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        style={styles.addButton}
        onClick={addCertification}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.addButtonHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = styles.addButton.background;
          e.currentTarget.style.borderColor = styles.addButton.border;
          e.currentTarget.style.color = styles.addButton.color;
        }}
      >
        <span style={styles.addButtonIcon}>+</span>
        Add another certification
      </button>

      <div style={styles.formActions}>
        <button
          style={styles.btnSecondary}
          onClick={onPrev}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.btnSecondaryHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = styles.btnSecondary.background;
            e.currentTarget.style.borderColor = styles.btnSecondary.border;
          }}
        >
          Previous
        </button>
        <button
          style={styles.btnPrimary}
          onClick={handleNext}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, styles.btnPrimaryHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = styles.btnPrimary.boxShadow;
          }}
        >
          Save & Next
        </button>
      </div>
    </div>
  );
}
