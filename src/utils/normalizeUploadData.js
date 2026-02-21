/**
 * Normalize upload endpoint response to profile format
 * This function converts the upload API response to match the profile structure
 */
export const normalizeUploadData = (uploadData) => {
  if (!uploadData) return {};

  const pickFirstString = (...values) => {
    for (const v of values) {
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return "";
  };

  const normalizeMonthYear = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (!raw) return "";

    // Already in MM/YYYY
    if (/^(0[1-9]|1[0-2])\/\d{4}$/.test(raw)) return raw;

    // YYYY-MM or YYYY-MM-DD
    const iso = raw.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (iso) {
      const [, y, m] = iso;
      return `${m}/${y}`;
    }

    // MM-YYYY or MM.YYYY
    const mmYYYY = raw.match(/^(0?[1-9]|1[0-2])[./-](\d{4})$/);
    if (mmYYYY) {
      const m = String(mmYYYY[1]).padStart(2, "0");
      const y = mmYYYY[2];
      return `${m}/${y}`;
    }

    // Month name + year (e.g., Aug 2021, August 2021)
    const monthNames = {
      jan: "01", january: "01",
      feb: "02", february: "02",
      mar: "03", march: "03",
      apr: "04", april: "04",
      may: "05",
      jun: "06", june: "06",
      jul: "07", july: "07",
      aug: "08", august: "08",
      sep: "09", sept: "09", september: "09",
      oct: "10", october: "10",
      nov: "11", november: "11",
      dec: "12", december: "12",
    };
    const mon = raw
      .toLowerCase()
      .replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .match(/^([a-z]{3,9})\s+(\d{4})$/);
    if (mon) {
      const [, mName, y] = mon;
      const m = monthNames[mName];
      if (m) return `${m}/${y}`;
    }

    // Year only
    if (/^\d{4}$/.test(raw)) return raw;

    return raw;
  };

  const normalized = {
    basicInfo: {
      name: pickFirstString(
        uploadData.basicInfo?.name,
        uploadData.basicInfo?.fullName,
        uploadData.fullName,
        uploadData.name,
        uploadData.personalInfo?.name,
        uploadData.contact?.name
      ),
      email: pickFirstString(uploadData.basicInfo?.email, uploadData.email, uploadData.contact?.email),
      phone: pickFirstString(uploadData.basicInfo?.phone, uploadData.phone, uploadData.contact?.phone),
      linkedin: pickFirstString(uploadData.basicInfo?.linkedin, uploadData.linkedin, uploadData.contact?.linkedin),
    },
    // Also preserve root-level fields for compatibility
    fullName: pickFirstString(
      uploadData.fullName,
      uploadData.basicInfo?.name,
      uploadData.basicInfo?.fullName,
      uploadData.name
    ),
    email: pickFirstString(uploadData.email, uploadData.basicInfo?.email),
    phone: pickFirstString(uploadData.phone, uploadData.basicInfo?.phone),
    linkedin: pickFirstString(uploadData.linkedin, uploadData.basicInfo?.linkedin),
    education: Array.isArray(uploadData.education)
      ? uploadData.education.map((edu) => ({
          degree: pickFirstString(edu.degree, edu.course, edu.courseName, edu.program, edu.qualification),
          fieldOfStudy: pickFirstString(edu.fieldOfStudy, edu.major, edu.specialization),
          institution: pickFirstString(edu.institution, edu.school, edu.university, edu.college),
          startDate: normalizeMonthYear(pickFirstString(edu.startDate, edu.from, edu.start, edu.startYear)),
          endDate: normalizeMonthYear(
            pickFirstString(edu.endDate, edu.to, edu.end, edu.graduationDate, edu.graduatedOn, edu.endYear)
          ),
          grade: pickFirstString(edu.grade, edu.gpa),
          location: pickFirstString(edu.location, edu.city),
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
            issueDate: normalizeMonthYear(certification.issueDate || ""),
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
