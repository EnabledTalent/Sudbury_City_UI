// Calculate profile completion percentage
export const calculateProfileCompletion = (profile) => {
  let totalFields = 0;
  let filledFields = 0;

  // Helper to check if value is filled
  const isFilled = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "boolean") return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
      return Object.keys(value).length > 0 && Object.values(value).some((v) => isFilled(v));
    }
    return true;
  };

  // Basic Info
  const basicInfo = profile.basicInfo || {};
  totalFields += 3; // name, email, phone
  if (isFilled(basicInfo.name)) filledFields++;
  if (isFilled(basicInfo.email)) filledFields++;
  if (isFilled(basicInfo.phone)) filledFields++;

  // Education
  const education = profile.education?.[0] || {};
  totalFields += 1; // degree (required)
  if (isFilled(education.degree)) filledFields++;

  // Work Experience
  const workExp = profile.workExperience || [];
  if (workExp.length > 0) {
    workExp.forEach((exp) => {
      totalFields += 2; // company, jobTitle (required if adding experience)
      if (isFilled(exp.company)) filledFields++;
      if (isFilled(exp.jobTitle)) filledFields++;
    });
  }

  // Skills
  const primarySkills = profile.primarySkills || profile.skills || [];
  totalFields += 1; // at least one primary skill
  if (primarySkills.length > 0) filledFields++;

  // Projects (optional, but count if filled)
  const projects = profile.projects || [];
  if (projects.length > 0) {
    projects.forEach((proj) => {
      const project = typeof proj === "string" ? { name: proj } : proj;
      if (project.name || project.description || project.startDate) {
        totalFields += 1;
        if (isFilled(project.name)) filledFields++;
      }
    });
  }

  // Achievements (optional, but count if filled)
  const achievements = profile.achievements || [];
  if (achievements.length > 0) {
    achievements.forEach((ach) => {
      const achievement = typeof ach === "string" ? { title: ach } : ach;
      if (achievement.title || achievement.issueDate || achievement.description) {
        totalFields += 1;
        if (isFilled(achievement.title)) filledFields++;
      }
    });
  }

  // Certification (optional, but count if filled)
  const certification = profile.certification || [];
  if (certification.length > 0) {
    certification.forEach((cert) => {
      const certObj = typeof cert === "string" ? { name: cert } : cert;
      if (certObj.name || certObj.issueDate || certObj.issuedOrganization) {
        totalFields += 1;
        if (isFilled(certObj.name)) filledFields++;
      }
    });
  }

  // Preference (optional)
  const preference = profile.preference || {};
  if (preference.companySize || preference.jobType || preference.jobSearch) {
    totalFields += 3;
    if (isFilled(preference.companySize)) filledFields++;
    if (isFilled(preference.jobType)) filledFields++;
    if (isFilled(preference.jobSearch)) filledFields++;
  }

  // Other Details (optional)
  const otherDetails = profile.otherDetails || {};
  if (otherDetails.languages || otherDetails.careerStage || otherDetails.earliestAvailability || otherDetails.desiredSalary) {
    totalFields += 4;
    if (otherDetails.languages && otherDetails.languages.length > 0 && otherDetails.languages.some(l => l.language)) filledFields++;
    if (isFilled(otherDetails.careerStage)) filledFields++;
    if (isFilled(otherDetails.earliestAvailability)) filledFields++;
    if (isFilled(otherDetails.desiredSalary)) filledFields++;
  }

  // Review & Agree
  const reviewAgree = profile.reviewAgree || {};
  totalFields += 1; // agreement required
  if (isFilled(reviewAgree.agreed)) filledFields++;

  // Calculate percentage
  if (totalFields === 0) return 0;
  const percentage = Math.round((filledFields / totalFields) * 100);
  return Math.min(percentage, 100);
};
