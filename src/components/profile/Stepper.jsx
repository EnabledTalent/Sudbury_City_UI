import { useProfile } from "../../context/ProfileContext";
import {
  validateBasicInfo,
  validateEducation,
  validateSkills,
  validateProjects,
  validateAchievements,
  validateCertification,
  validateOtherDetails,
  validateReviewAgree,
} from "../../utils/profileValidation";

const validators = {
  basicInfo: validateBasicInfo,
  education: validateEducation,
  skills: validateSkills,
  projects: validateProjects,
  achievements: validateAchievements,
  certification: validateCertification,
  otherDetails: validateOtherDetails,
  reviewAgree: validateReviewAgree,
};

// Helper function to count errors
const countErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.reduce((count, e) => {
      return count + (e ? Object.keys(e).length : 0);
    }, 0);
  }
  return Object.keys(errors || {}).length;
};

// Helper function to check if step has errors
const hasErrors = (errors) => {
  return countErrors(errors) > 0;
};

export default function Stepper({ steps, activeStep, onStepClick }) {
  const { profile } = useProfile();

  const canNavigateTo = (index) => {
    for (let i = 0; i < index; i++) {
      const stepKey = steps[i].key;
      const validate = validators[stepKey];
      if (validate && hasErrors(validate(profile))) {
        return false; // ❌ BLOCK
      }
    }
    return true;
  };

  const getStepStatus = (stepKey) => {
    const validate = validators[stepKey];
    if (!validate) return { hasError: false, errorCount: 0 };
    
    const errors = validate(profile);
    const errorCount = countErrors(errors);
    return { hasError: errorCount > 0, errorCount };
  };

  const styles = {
    stepper: {
      width: "260px",
      background: "#ffffff",
      borderRadius: "16px",
      padding: "20px",
      position: "relative",
    },
    step: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px",
      cursor: "pointer",
      fontSize: "14px",
      color: "#6b7280",
      position: "relative",
      transition: "all 0.2s",
    },
    stepActive: {
      fontWeight: 600,
      color: "#111827",
    },
    stepDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    iconContainer: {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      fontWeight: "bold",
      flexShrink: 0,
    },
    iconSuccess: {
      background: "#22c55e",
      color: "#ffffff",
    },
    iconError: {
      background: "#ef4444",
      color: "#ffffff",
    },
    stepContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    stepLabel: {
      flex: 1,
    },
    errorText: {
      fontSize: "12px",
      color: "#ef4444",
      fontWeight: 500,
      marginLeft: "8px",
    },
  };

  return (
    <div style={styles.stepper}>
      {/* Connector line */}
      <div
        style={{
          position: "absolute",
          left: "35px",
          top: "48px",
          bottom: "20px",
          width: "2px",
          background: "#e5e7eb",
          zIndex: 0,
        }}
      />
      
      {steps.map((step, idx) => {
        const { hasError, errorCount } = getStepStatus(step.key);
        const isActive = idx === activeStep;
        const canNavigate = canNavigateTo(idx);
        
        return (
          <div
            key={step.key}
            data-tour={`profile-step-${step.key}`}
            style={{
              ...styles.step,
              ...(isActive ? styles.stepActive : {}),
              ...(!canNavigate ? styles.stepDisabled : {}),
              position: "relative",
              zIndex: 1,
            }}
            onClick={() => {
              if (canNavigate) {
                onStepClick(idx);
              }
            }}
          >
            <div
              style={{
                ...styles.iconContainer,
                ...(hasError ? styles.iconError : styles.iconSuccess),
              }}
            >
              {hasError ? "!" : "✓"}
            </div>
            <div style={styles.stepContent}>
              <span style={styles.stepLabel}>{step.label}</span>
              {hasError && errorCount > 0 && (
                <span style={styles.errorText}>
                  {errorCount.toString().padStart(2, "0")} error
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
