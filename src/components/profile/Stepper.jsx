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
import "./Stepper.css";

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

const countErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.reduce((count, entry) => count + (entry ? Object.keys(entry).length : 0), 0);
  }
  return Object.keys(errors || {}).length;
};

const hasErrors = (errors) => countErrors(errors) > 0;

export default function Stepper({ steps, activeStep, onStepClick }) {
  const { profile } = useProfile();

  const canNavigateTo = (index) => {
    for (let i = 0; i < index; i += 1) {
      const stepKey = steps[i].key;
      const validate = validators[stepKey];
      if (validate && hasErrors(validate(profile))) {
        return false;
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

  return (
    <nav className="profile-stepper" aria-label="Profile setup steps">
      <ol className="profile-stepper__list">
        {steps.map((step, index) => {
          const { hasError, errorCount } = getStepStatus(step.key);
          const isActive = index === activeStep;
          const isCompleted = index < activeStep && !hasError;
          const shouldShowError = index <= activeStep && hasError;
          const canNavigate = canNavigateTo(index);
          const errorLabel = `${errorCount.toString().padStart(2, "0")} ${errorCount === 1 ? "error" : "errors"}`;
          const iconClassName = `profile-stepper__icon ${
            shouldShowError
              ? "is-error"
              : isCompleted
                ? "is-success"
                : isActive
                  ? "is-active"
                  : "is-pending"
          }`;
          const iconText = shouldShowError ? "!" : isCompleted ? "\u2713" : String(index + 1);

          return (
            <li
              key={step.key}
              className="profile-stepper__item"
              data-tour={`profile-step-${step.key}`}
            >
              <button
                type="button"
                className="profile-stepper__button"
                onClick={() => {
                  if (canNavigate) onStepClick(index);
                }}
                disabled={!canNavigate}
                aria-disabled={!canNavigate}
                aria-current={isActive ? "step" : undefined}
              >
                <span className={iconClassName} aria-hidden="true">
                  {iconText}
                </span>
                <span className="profile-stepper__content">
                  <span className="profile-stepper__label">{step.label}</span>
                  {shouldShowError && errorCount > 0 && (
                    <span className="profile-stepper__error-text">{errorLabel}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
