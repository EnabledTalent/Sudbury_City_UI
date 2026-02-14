/**
 * Normalize upload endpoint response to profile format
 * This function converts the upload API response to match the profile structure
 */
export const normalizeUploadData = (uploadData) => {
  if (!uploadData) return {};

  const normalized = {
    basicInfo: {
      name: uploadData.basicInfo?.name || uploadData.fullName || "",
      email: uploadData.basicInfo?.email || uploadData.email || "",
      phone: uploadData.basicInfo?.phone || uploadData.phone || "",
      linkedin: uploadData.basicInfo?.linkedin || uploadData.linkedin || "",
    },
    // Also preserve root-level fields for compatibility
    fullName: uploadData.fullName || uploadData.basicInfo?.name || "",
    email: uploadData.email || uploadData.basicInfo?.email || "",
    phone: uploadData.phone || uploadData.basicInfo?.phone || "",
    linkedin: uploadData.linkedin || uploadData.basicInfo?.linkedin || "",
    education: Array.isArray(uploadData.education) 
      ? uploadData.education.map((edu) => ({
          degree: edu.degree || "",
          fieldOfStudy: edu.fieldOfStudy || "",
          institution: edu.institution || "",
          startDate: edu.startDate || "",
          endDate: edu.endDate || "",
          grade: edu.grade || "",
          location: edu.location || "",
        }))
      : [],
    workExperience: Array.isArray(uploadData.workExperience)
      ? uploadData.workExperience.map((exp) => ({
          jobTitle: exp.jobTitle || "",
          company: exp.company || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          currentlyWorking: exp.currentlyWorking || false,
          responsibilities: Array.isArray(exp.responsibilities)
            ? exp.responsibilities
            : [],
          technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
          description: exp.description || "",
        }))
      : [],
    skills: Array.isArray(uploadData.skills) ? uploadData.skills : [],
    primarySkills: Array.isArray(uploadData.skills) ? uploadData.skills : [],
    basicSkills: [],
    projects: Array.isArray(uploadData.projects)
      ? uploadData.projects.map((proj) => {
          const project = typeof proj === "string" ? { name: proj } : proj;
          return {
            name: project.name || "",
            description: project.description || "",
            currentlyWorking: project.currentlyWorking || false,
            startDate: project.startDate || "",
            endDate: project.endDate || "",
            photoUrl: project.photoUrl || "",
          };
        })
      : [],
    achievements: Array.isArray(uploadData.achievements)
      ? uploadData.achievements.map((ach) => {
          const achievement = typeof ach === "string" ? { title: ach } : ach;
          return {
            title: achievement.title || achievement || "",
            issueDate: achievement.issueDate || "",
            description: achievement.description || "",
          };
        })
      : [],
    certification: Array.isArray(uploadData.certification)
      ? uploadData.certification.map((cert) => {
          const certification = typeof cert === "string" ? { name: cert } : cert;
          return {
            name: certification.name || certification || "",
            issueDate: certification.issueDate || "",
            issuedOrganization: certification.issuedOrganization || "",
            credentialId: certification.credentialId || "",
            credentialUrl: certification.credentialUrl || "",
          };
        })
      : [],
    preference: uploadData.preference && Array.isArray(uploadData.preference) && uploadData.preference.length > 0
      ? uploadData.preference[0]
      : uploadData.preference && typeof uploadData.preference === "object"
      ? uploadData.preference
      : {
          companySize: "",
          jobType: "",
          jobSearch: "",
        },
    otherDetails: {
      otherDetailsText: typeof uploadData.otherDetails === "string"
        ? uploadData.otherDetails
        : uploadData.otherDetails?.otherDetailsText || "",
      languages: uploadData.otherDetails?.languages || [],
      careerStage: uploadData.otherDetails?.careerStage || "",
      earliestAvailability: uploadData.otherDetails?.earliestAvailability || "",
      desiredSalary: uploadData.otherDetails?.desiredSalary || "",
    },
    reviewAgree: {
      discovery: uploadData.reviewAgree?.discovery || "",
      comments: uploadData.reviewAgree?.comments || "",
      agreed: uploadData.reviewAgree === true || uploadData.reviewAgree?.agreed || false,
    },
  };

  return normalized;
};
