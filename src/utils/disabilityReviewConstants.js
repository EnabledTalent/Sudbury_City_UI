/**
 * Disability & accessibility section for Review & Agree (job seeker profile).
 * Use the same keys in API / DB (camelCase JSON).
 *
 * Example `reviewAgree` payload sent from the UI (POST/PUT jobseeker profile & apply-with-profile):
 *
 * {
 *   "discovery": "LinkedIn",
 *   "comments": "",
 *   "agreed": true,
 *   "hasDisability": true,
 *   "disability": {
 *     "identifiesAs": "yes",
 *     "disabilityTypes": ["VISUAL_IMPAIRMENT", "OTHER"],
 *     "disabilityTypesOther": "Color blindness",
 *     "workplaceAccommodations": "yes",
 *     "accommodationSupport": ["ASSISTIVE_TECHNOLOGY", "FLEXIBLE_HOURS"],
 *     "accommodationSupportOther": "",
 *     "platformAccessibilityNeeded": true,
 *     "platformAccessibilityFeatures": ["SCREEN_READER", "KEYBOARD_NAVIGATION"],
 *     "platformAccessibilityOther": "",
 *     "discussWithHr": "maybe_later"
 *   }
 * }
 *
 * `hasDisability` is derived: true if identifiesAs === "yes", false if "no", null if "prefer_not_to_say".
 * Enum strings match the constants in this file (DISABILITY_TYPE_OPTIONS, etc.).
 */

export const DEFAULT_DISABILITY = {
  /** @type {"yes"|"no"|"prefer_not_to_say"|null} */
  identifiesAs: null,
  /** @type {string[]} */
  disabilityTypes: [],
  disabilityTypesOther: "",
  /** @type {"yes"|"no"|"not_sure"|null} */
  workplaceAccommodations: null,
  /** @type {string[]} */
  accommodationSupport: [],
  accommodationSupportOther: "",
  /** @type {boolean|null} */
  platformAccessibilityNeeded: null,
  /** @type {string[]} */
  platformAccessibilityFeatures: [],
  platformAccessibilityOther: "",
  /** @type {"yes"|"no"|"maybe_later"|null} */
  discussWithHr: null,
};

export const DISABILITY_TYPE_OPTIONS = [
  { value: "VISUAL_IMPAIRMENT", label: "Visual impairment (low vision / blindness)" },
  { value: "HEARING_IMPAIRMENT", label: "Hearing impairment (deaf / hard of hearing)" },
  { value: "MOBILITY_PHYSICAL", label: "Mobility / physical disability" },
  { value: "NEURODIVERGENT", label: "Neurodivergent (ADHD, autism, etc.)" },
  { value: "LEARNING_DISABILITY", label: "Learning disability (dyslexia, etc.)" },
  { value: "MENTAL_HEALTH", label: "Mental health condition" },
  { value: "CHRONIC_ILLNESS", label: "Chronic illness / medical condition" },
  { value: "SPEECH_COMMUNICATION", label: "Speech or communication disability" },
  { value: "OTHER", label: "Other (please specify)" },
];

export const ACCOMMODATION_SUPPORT_OPTIONS = [
  { value: "ASSISTIVE_TECHNOLOGY", label: "Assistive technology (screen reader, magnifier, etc.)" },
  { value: "FLEXIBLE_HOURS", label: "Flexible working hours" },
  { value: "REMOTE_HYBRID", label: "Remote / hybrid work option" },
  { value: "ADDITIONAL_TIME_TRAINING", label: "Additional time for tasks or training (KT)" },
  { value: "MODIFIED_WORKSTATION", label: "Modified workstation / ergonomic setup" },
  { value: "WRITTEN_VS_VERBAL_INSTRUCTIONS", label: "Written instructions instead of verbal (or vice versa)" },
  { value: "QUIET_WORKSPACE", label: "Quiet workspace / reduced distractions" },
  { value: "ACCESSIBLE_DOCUMENTS", label: "Accessible documents/materials" },
  { value: "OTHER", label: "Other (please specify)" },
];

export const PLATFORM_ACCESSIBILITY_OPTIONS = [
  { value: "SCREEN_READER", label: "Screen reader compatibility" },
  { value: "KEYBOARD_NAVIGATION", label: "Keyboard navigation" },
  { value: "HIGH_CONTRAST_LARGE_TEXT", label: "High contrast / large text" },
  { value: "CAPTIONS", label: "Captions for audio/video" },
  { value: "OTHER", label: "Other" },
];

export function deriveHasDisabilityFromIdentifiesAs(identifiesAs) {
  if (identifiesAs === "yes") return true;
  if (identifiesAs === "no") return false;
  return null;
}

/**
 * Merge saved profile reviewAgree with defaults and legacy hasDisability → identifiesAs.
 */
export function mergeReviewAgree(raw) {
  const base = {
    discovery: "",
    comments: "",
    agreed: false,
    hasDisability: null,
    disability: { ...DEFAULT_DISABILITY },
  };
  if (!raw || typeof raw !== "object") return base;

  const disability = { ...DEFAULT_DISABILITY, ...(raw.disability || {}) };
  let identifiesAs = disability.identifiesAs;
  if (
    identifiesAs == null &&
    raw.hasDisability !== undefined &&
    raw.hasDisability !== null &&
    raw.hasDisability !== ""
  ) {
    if (raw.hasDisability === true || raw.hasDisability === "yes") identifiesAs = "yes";
    else if (raw.hasDisability === false || raw.hasDisability === "no") identifiesAs = "no";
  }

  return {
    ...base,
    ...raw,
    disability: { ...disability, identifiesAs },
  };
}

/**
 * Shape sent to backend under reviewAgree (see profileService / jobService).
 */
export function buildDisabilityPayload(disability) {
  const d = { ...DEFAULT_DISABILITY, ...disability };
  return {
    identifiesAs: d.identifiesAs,
    disabilityTypes: Array.isArray(d.disabilityTypes) ? d.disabilityTypes : [],
    disabilityTypesOther: d.disabilityTypesOther || "",
    workplaceAccommodations: d.workplaceAccommodations,
    accommodationSupport: Array.isArray(d.accommodationSupport) ? d.accommodationSupport : [],
    accommodationSupportOther: d.accommodationSupportOther || "",
    platformAccessibilityNeeded: d.platformAccessibilityNeeded,
    platformAccessibilityFeatures: Array.isArray(d.platformAccessibilityFeatures)
      ? d.platformAccessibilityFeatures
      : [],
    platformAccessibilityOther: d.platformAccessibilityOther || "",
    discussWithHr: d.discussWithHr,
  };
}

/** Stepper / profile validation for disability block (same rules as ReviewAgree submit). */
export function validateDisabilityReview(profile) {
  const ra = mergeReviewAgree(profile.reviewAgree);
  const d = ra.disability;
  const newErrors = {};

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
}
