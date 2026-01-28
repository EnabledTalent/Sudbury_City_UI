export const validateBasicInfo = (profile) => {
  const b = profile.basicInfo || {};
  const errors = {};

  if (!b.name) errors.name = "Name is required";
  if (!b.email) errors.email = "Email is required";
  if (!b.phone) errors.phone = "Phone is required";

  return errors;
};

export const validateEducation = (profile) => {
  const e = profile.education?.[0] || {};
  const errors = {};

  // Only degree/course name is required for job application
  if (!e.degree) errors.degree = "Degree/Course name is required";

  return errors;
};
export const validateWorkExperience = (profile) => {
  const list = profile.workExperience || [];
  const errors = [];

  // Only validate if they have added work experience entries
  // If they add an entry, company and job title should be filled
  list.forEach((w, index) => {
    const entryErrors = {};
    
    // Only require company and job title if they've started filling the form
    if (w.company || w.jobTitle || w.startDate || w.endDate || w.description) {
      if (!w.company) entryErrors.company = "Company is required";
      if (!w.jobTitle) entryErrors.jobTitle = "Role is required";
    }

    errors[index] = entryErrors;
  });

  return errors;
};

export const validateSkills = (profile) => {
  const errors = {};
  const primarySkills = profile.primarySkills || [];

  if (primarySkills.length === 0) {
    errors.primarySkills = "At least one primary skill is required";
  }

  return errors;
};

export const validateProjects = (profile) => {
  // Projects are optional for job applications
  return [];
};

export const validateAchievements = (profile) => {
  // Achievements are optional for job applications
  // Only validate if they've started adding achievements
  const list = profile.achievements || [];
  const errors = [];

  list.forEach((ach, index) => {
    const entryErrors = {};
    const achievement = typeof ach === "string" ? { title: ach } : ach;

    // Only require title if they've started filling other fields
    if (achievement.issueDate || achievement.description) {
      if (!achievement.title) entryErrors.title = "Title is required";
    }
    errors[index] = entryErrors;
  });

  return errors;
};

export const validateCertification = (profile) => {
  // Certifications are optional, but if they add one, name should be filled
  const list = profile.certification || [];
  const errors = [];

  list.forEach((cert, index) => {
    const entryErrors = {};
    const certification = typeof cert === "string" ? { name: cert } : cert;

    // Only require name if they've started filling other fields
    if (certification.issueDate || certification.issuedOrganization || certification.credentialId) {
      if (!certification.name) entryErrors.name = "Name of certification is required";
    }
    errors[index] = entryErrors;
  });

  return errors;
};

export const validateOtherDetails = (profile) => {
  // Other details are mostly optional for job applications
  // Earliest availability might be nice to have but not critical
  return {};
};

export const validateReviewAgree = (profile) => {
  const errors = {};
  const reviewAgree = profile.reviewAgree || {};

  if (!reviewAgree.agreed) {
    errors.agreed = "You must agree to the terms and conditions";
  }

  return errors;
};
