import { BUSINESS_BASE_URL } from "../config/api";
import { saveProfile } from "./profileService";
import { normalizeUploadData } from "../utils/normalizeUploadData";
import { getToken } from "./authService";

/**
 * Get email from JWT token
 */
const getEmailFromToken = () => {
  const token = getToken();
  if (!token) {
    throw new Error("No auth token found");
  }
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.email || payload.username;
  } catch (e) {
    throw new Error("Failed to decode token");
  }
};

/**
 * Fetch jobs from backend API
 * GET /api/v1/jobs/job?email=<jobseekerEmail>
 */
export const fetchJobs = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  // Get email from token
  const email = getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/job?email=${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch jobs: ${response.status} ${errorText}`
    );
  }

  // Get response as text first to handle potential JSON parsing issues
  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return [];
  }

  // Try to parse JSON
  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [];
  } catch (parseError) {
    console.warn("Response is not valid JSON:", parseError);
    console.warn("Response text (first 500 chars):", responseText.substring(0, 500));
    
    // Try to extract valid JSON from the response if it's partially malformed
    try {
      const jsonStart = responseText.indexOf('[');
      if (jsonStart !== -1) {
        const jsonEnd = responseText.lastIndexOf(']');
        if (jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = responseText.substring(jsonStart, jsonEnd + 1);
          const data = JSON.parse(extractedJson);
          return Array.isArray(data) ? data : [];
        }
      }
    } catch (extractError) {
      console.error("Failed to extract valid JSON:", extractError);
    }
    
    console.error("Could not parse response as JSON. Returning empty array.");
    return [];
  }
};

/**
 * Fetch all applications for the jobseeker
 * GET /api/v1/jobs/jobseeker/applications?email=...
 * Response contains application objects with job details, status, and application details
 * @param {string} email - Optional email parameter. If not provided, will try to get from profileData or token
 */
export const fetchAllApplications = async (email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  // Get email if not provided
  let userEmail = email;
  if (!userEmail) {
    // Try to get from profileData
    const profileData = localStorage.getItem("profileData");
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        userEmail = parsed.basicInfo?.email;
      } catch (e) {
        console.error("Error parsing profileData:", e);
      }
    }
    
    // If still not found, try to get from token
    if (!userEmail) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userEmail = payload.sub || payload.email;
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }

  // Build URL with email query parameter
  const url = userEmail
    ? `${BUSINESS_BASE_URL}/api/v1/jobs/jobseeker/applications?email=${encodeURIComponent(userEmail)}`
    : `${BUSINESS_BASE_URL}/api/v1/jobs/jobseeker/applications`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch applications: ${response.status} ${errorText}`
    );
  }

  // Get response as text first to handle potential JSON parsing issues
  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return [];
  }

  // Try to parse JSON
  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [];
  } catch (parseError) {
    console.warn("Response is not valid JSON:", parseError);
    console.warn("Response text (first 500 chars):", responseText.substring(0, 500));
    
    // Try to extract valid JSON from the response if it's partially malformed
    try {
      const jsonStart = responseText.indexOf('[');
      if (jsonStart !== -1) {
        const jsonEnd = responseText.lastIndexOf(']');
        if (jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = responseText.substring(jsonStart, jsonEnd + 1);
          const data = JSON.parse(extractedJson);
          return Array.isArray(data) ? data : [];
        }
      }
    } catch (extractError) {
      console.error("Failed to extract valid JSON:", extractError);
    }
    
    console.error("Could not parse response as JSON. Returning empty array.");
    return [];
  }
};

/**
 * Fetch jobseeker metrics
 * GET /api/v1/jobs/jobseeker/metrics?email={email}&windowDays={windowDays}
 */
export const fetchJobseekerMetrics = async (email, windowDays = 30) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!email) {
    throw new Error("Email is required to fetch metrics");
  }

  const url = `${BUSINESS_BASE_URL}/api/v1/jobs/jobseeker/metrics?email=${encodeURIComponent(email)}&windowDays=${windowDays}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch metrics: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return null;
  }

  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (parseError) {
    console.warn("Response is not valid JSON:", parseError);
    console.warn("Response text (first 500 chars):", responseText.substring(0, 500));
    
    // Try to extract valid JSON from the response if it's partially malformed
    try {
      const jsonStart = responseText.indexOf('{');
      if (jsonStart !== -1) {
        const jsonEnd = responseText.lastIndexOf('}');
        if (jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = responseText.substring(jsonStart, jsonEnd + 1);
          const data = JSON.parse(extractedJson);
          return data;
        }
      }
    } catch (extractError) {
      console.error("Failed to extract valid JSON:", extractError);
    }
    
    console.error("Could not parse response as JSON. Returning null.");
    return null;
  }
};

export const uploadResume = async (file) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }
  
  const data = await response.json();

  // ✅ STEP 2: NORMALIZE AND STORE PROFILE DATA
  const normalizedData = normalizeUploadData(data);
  
  localStorage.setItem(
    "profileData",
    JSON.stringify(normalizedData)
  );

  // Trigger custom event to notify context of update (storage event only works across tabs)
  // We'll use a custom event for same-tab updates
  window.dispatchEvent(new CustomEvent("profileDataUpdated", { detail: normalizedData }));

  // ✅ STEP 3: SAVE PROFILE TO BACKEND API
  try {
    await saveProfile(data);
  } catch (saveError) {
    console.error("Error saving profile to backend:", saveError);
    // Don't throw error - upload was successful, just saving failed
    // User can still proceed to edit and save manually
    console.warn("Profile uploaded but not saved to backend. User can save manually later.");
  }

  return data;
};

/**
 * Transform profile data to Application Payload format
 * Matches the DTO structure for apply-with-profile endpoint
 */
const transformProfileForApplication = (profile) => {
  // Calculate years of experience from work experience
  const calculateYearsOfExperience = () => {
    if (!profile.workExperience || profile.workExperience.length === 0) {
      return 0;
    }
    
    let totalYears = 0;
    profile.workExperience.forEach((exp) => {
      if (exp.startDate && exp.endDate) {
        const start = parseInt(exp.startDate.substring(0, 4)) || 0;
        const end = exp.currentlyWorking 
          ? new Date().getFullYear() 
          : (parseInt(exp.endDate.substring(0, 4)) || 0);
        if (end > start) {
          totalYears += (end - start);
        }
      }
    });
    
    return totalYears;
  };

  const transformed = {
    // Basic Info DTO
    basicInfo: {
      name: profile.basicInfo?.name || "",
      email: profile.basicInfo?.email || "",
      phone: profile.basicInfo?.phone || "",
      linkedin: profile.basicInfo?.linkedin || "",
    },
    
    // Collections
    education: (profile.education || []).map((edu) => ({
      degree: edu.degree || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      institution: edu.institution || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      grade: edu.grade || "",
      location: edu.location || "",
    })),
    
    workExperience: (profile.workExperience || []).map((exp) => ({
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
    })),
    
    skills: profile.skills || [],
    primarySkills: profile.primarySkills || [],
    basicSkills: profile.basicSkills || [],
    
    projects: (profile.projects || []).map((proj) => {
      const project = typeof proj === "string" ? { name: proj } : proj;
      return {
        name: project.name || "",
        description: project.description || "",
        currentlyWorking: project.currentlyWorking || false,
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        photoUrl: project.photoUrl || project.photo?.name || "",
      };
    }),
    
    achievements: (profile.achievements || []).map((ach) => {
      const achievement = typeof ach === "string" ? { title: ach } : ach;
      return {
        title: achievement.title || "",
        issueDate: achievement.issueDate || "",
        description: achievement.description || "",
      };
    }),
    
    certification: (profile.certification || []).map((cert) => {
      const certification = typeof cert === "string" ? { name: cert } : cert;
      return {
        name: certification.name || "",
        issueDate: certification.issueDate || "",
        issuedOrganization: certification.issuedOrganization || "",
        credentialId: certification.credentialId || "",
        credentialUrl: certification.credentialUrl || certification.credentialId || "",
      };
    }),
    
    // Single Objects
    preference: profile.preference
      ? {
          companySize: profile.preference.companySize || "",
          jobType: profile.preference.jobType || "",
          jobSearch: profile.preference.jobSearch || "",
        }
      : null,
    
    otherDetails: profile.otherDetails
      ? {
          languages: (profile.otherDetails.languages || []).map((lang) => ({
            language: lang.language || "",
            speaking: lang.speaking || "",
            reading: lang.reading || "",
            writing: lang.writing || "",
          })),
          careerStage: profile.otherDetails.careerStage || "",
          earliestAvailability: profile.otherDetails.earliestAvailability || "",
          desiredSalary: profile.otherDetails.desiredSalary || "",
          otherDetailsText: profile.otherDetails.otherDetailsText || "",
        }
      : null,
    
    reviewAgree: profile.reviewAgree
      ? {
          discovery: profile.reviewAgree.discovery || "",
          comments: profile.reviewAgree.comments || "",
          agreed: profile.reviewAgree.agreed || false,
        }
      : null,
    
    // Additional fields from profile
    yearsOfExperience: calculateYearsOfExperience(),
    resumeUrl: profile.basicInfo?.resumeUrl || "",
    city: profile.basicInfo?.city || "",
    postalCode: profile.basicInfo?.postalCode || "",
  };

  return transformed;
};

/**
 * Apply to a job with profile
 */
export const applyWithProfile = async (jobId, profile) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!jobId) {
    throw new Error("Job ID is required");
  }

  if (!profile || !profile.basicInfo?.email) {
    throw new Error("Profile data is required to apply");
  }

  const profileData = transformProfileForApplication(profile);

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/${jobId}/apply-with-profile`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    }
  );

  if (!response.ok) {
    let errorMessage = "Failed to submit application. Please try again.";
    
    try {
      const errorData = await response.json();
      // Handle structured error response with message, status, error, timestamp
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (parseError) {
      // If response is not JSON, try to get text
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      } catch (textError) {
        // Fallback to default message
        console.error("Error parsing error response:", textError);
      }
    }
    
    // Create error object with message for toast display
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  // Handle response
  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return { success: true, message: "Application submitted successfully" };
  }

  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (parseError) {
    console.warn("Response is not valid JSON:", parseError);
    if (response.status === 200) {
      return { success: true, message: "Application submitted successfully" };
    }
    throw new Error("Invalid response from server");
  }
};

/**
 * Post a new job (employer)
 */
export const postJob = async (jobData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  // Parse salary range from "CAD 2500 - 3000" format
  let salaryMin = 0;
  let salaryMax = 0;
  if (jobData.estimatedSalary) {
    const salaryMatch = jobData.estimatedSalary.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (salaryMatch) {
      salaryMin = parseFloat(salaryMatch[1]);
      salaryMax = parseFloat(salaryMatch[2]);
    }
  }

  // Determine employmentType and typeOfWork from jobType and contractType
  let employmentType = jobData.jobType || "Full time";
  let typeOfWork = jobData.contractType || jobData.jobType || "Remote";

  // Map jobType to employmentType
  const jobTypeMap = {
    "Full time": "Full-time",
    "Part time": "Part-time",
    "Remote": "Remote",
    "Hybrid": "Hybrid",
    "Internship": "Internship",
  };

  if (jobTypeMap[jobData.jobType]) {
    employmentType = jobTypeMap[jobData.jobType];
  }

  // Map contractType to typeOfWork
  const contractTypeMap = {
    "Contract hybrid": "Hybrid",
    "Contract remote": "Remote",
    "Contract onsite": "On-site",
    "Hourly based": "Hourly",
  };

  if (contractTypeMap[jobData.contractType]) {
    typeOfWork = contractTypeMap[jobData.contractType];
  } else if (jobData.jobType && !jobData.contractType) {
    typeOfWork = jobData.jobType;
  }

  const payload = {
    role: jobData.jobTitle || "",
    companyName: jobData.companyName || "",
    jobLocation: jobData.jobLocation || "",
    address: jobData.address || "",
    experienceRange: jobData.yearsOfExperience || "",
    employmentType: employmentType,
    typeOfWork: typeOfWork,
    preferredLanguage: jobData.preferredLanguage || "English",
    urgentlyHiring: jobData.urgentlyHiring === "Yes",
    jobDescription: jobData.jobDescription || "",
    requirements: jobData.jobRequirement || "",
    salaryMin: salaryMin,
    salaryMax: salaryMax,
  };

  // Add externalApplyUrl field if provided (for apply-link type)
  if (jobData.url) {
    payload.externalApplyUrl = jobData.url;
  }

  // Get employer email from token
  const employerEmail = getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to post job: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return { success: true, message: "Job posted successfully" };
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { success: true, message: "Job posted successfully" };
  }
};

/**
 * Fetch employer's jobs
 */
export const fetchEmployerJobs = async (email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  // Note: The endpoint might not require email parameter if it's extracted from token
  // Adjust based on your API requirements
  const employerEmail = email || getEmailFromToken();
  const url = email 
    ? `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs?email=${encodeURIComponent(employerEmail)}`
    : `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs`;

  const response = await fetch(
    url,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch employer jobs: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error parsing employer jobs:", e);
    return [];
  }
};

/**
 * Fetch employer job stats
 */
export const fetchEmployerJobStats = async (email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  const employerEmail = email || getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs/stats?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch job stats: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error parsing job stats:", e);
    return [];
  }
};

/**
 * Fetch applications for a specific job
 * GET /api/v1/jobs/employer/jobs/{jobId}/applications
 */
export const fetchJobApplications = async (jobId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!jobId) {
    throw new Error("Job ID is required");
  }

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs/${jobId}/applications`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch job applications: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error parsing job applications:", e);
    return [];
  }
};

/**
 * Send interview invitation
 * POST /api/v1/jobs/employer/applications/{applicationId}/interview?email={email}
 */
export const sendInterviewInvitation = async (applicationId, email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  const employerEmail = email || getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/applications/${applicationId}/interview?email=${encodeURIComponent(employerEmail)}`,
    {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send interview invitation: ${response.status} ${errorText}`
    );
  }

  try {
    const responseText = await response.text();
    if (responseText && responseText.trim()) {
      return JSON.parse(responseText);
    }
    return { success: true };
  } catch (e) {
    return { success: true };
  }
};

/**
 * Send job offer
 * POST /api/v1/jobs/employer/applications/{applicationId}/offer?email={email}
 */
export const sendJobOffer = async (applicationId, email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  const employerEmail = email || getEmailFromToken();
  const url = `${BUSINESS_BASE_URL}/api/v1/jobs/employer/applications/${applicationId}/offer?email=${encodeURIComponent(employerEmail)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send job offer: ${response.status} ${errorText}`
    );
  }

  try {
    const responseText = await response.text();
    if (responseText && responseText.trim()) {
      return JSON.parse(responseText);
    }
    return { success: true };
  } catch (e) {
    return { success: true };
  }
};

/**
 * Fetch jobseeker notifications
 * GET /api/v1/jobs/jobseeker/notifications?email={email}
 */
export const fetchJobseekerNotifications = async (email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  // Get email if not provided
  let userEmail = email;
  if (!userEmail) {
    // Try to get from profileData
    const profileData = localStorage.getItem("profileData");
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        userEmail = parsed.basicInfo?.email;
      } catch (e) {
        console.error("Error parsing profileData:", e);
      }
    }
    
    // If still not found, try to get from token
    if (!userEmail) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userEmail = payload.sub || payload.email || payload.username;
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }
  }

  const url = userEmail
    ? `${BUSINESS_BASE_URL}/api/v1/jobs/jobseeker/notifications?email=${encodeURIComponent(userEmail)}`
    : `${BUSINESS_BASE_URL}/api/v1/jobs/jobseeker/notifications`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch notifications: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error parsing notifications:", e);
    return [];
  }
};

/**
 * Invite candidate to apply for a job
 * POST /api/v1/jobs/employer/jobs/{jobId}/invite?inviteeEmail={inviteeEmail}&email={email}
 */
export const inviteToApply = async (jobId, inviteeEmail, email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!jobId) {
    throw new Error("Job ID is required");
  }

  if (!inviteeEmail) {
    throw new Error("Invitee email is required");
  }

  const employerEmail = email || getEmailFromToken();
  const url = `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs/${jobId}/invite?inviteeEmail=${encodeURIComponent(inviteeEmail)}&email=${encodeURIComponent(employerEmail)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to invite candidate: ${response.status} ${errorText}`
    );
  }

  try {
    const responseText = await response.text();
    if (responseText && responseText.trim()) {
      return JSON.parse(responseText);
    }
    return { success: true };
  } catch (e) {
    return { success: true };
  }
};

/**
 * Reject application
 * POST /api/v1/jobs/employer/applications/{applicationId}/reject?email={email}
 */
export const rejectApplication = async (applicationId, email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  const employerEmail = email || getEmailFromToken();
  const url = `${BUSINESS_BASE_URL}/api/v1/jobs/employer/applications/${applicationId}/reject?email=${encodeURIComponent(employerEmail)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to reject application: ${response.status} ${errorText}`
    );
  }

  try {
    const responseText = await response.text();
    if (responseText && responseText.trim()) {
      return JSON.parse(responseText);
    }
    return { success: true };
  } catch (e) {
    return { success: true };
  }
};

/**
 * Update application status
 * PUT /api/v1/jobs/employer/applications/{applicationId}/status?status={STATUS}
 */
export const updateApplicationStatus = async (applicationId, status) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  if (!status) {
    throw new Error("Status is required");
  }

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/applications/${applicationId}/status?status=${encodeURIComponent(status)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update application status: ${response.status} ${errorText}`
    );
  }

  // Return success even if response body is empty
  try {
    const responseText = await response.text();
    if (responseText && responseText.trim()) {
      return JSON.parse(responseText);
    }
    return { success: true };
  } catch (e) {
    return { success: true };
  }
};

/**
 * Fetch employer metrics
 * GET /api/v1/jobs/employer/metrics?email={email}&windowDays={windowDays}
 */
export const fetchEmployerMetrics = async (email = null, windowDays = 30) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  const employerEmail = email || getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/metrics?email=${encodeURIComponent(employerEmail)}&windowDays=${windowDays}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch employer metrics: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return null;
  }

  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (e) {
    console.error("Error parsing employer metrics:", e);
    return null;
  }
};

/**
 * Fetch accepted candidates for employer
 * GET /api/v1/jobs/employer/candidates/accepted?email=<employerEmail>
 */
export const fetchAcceptedCandidates = async (email = null) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  const employerEmail = email || getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/candidates/accepted?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch accepted candidates: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error parsing accepted candidates:", e);
    return [];
  }
};

/**
 * Update an existing job
 * PUT /api/v1/jobs/employer/jobs/{jobId}?email=<employerEmail>
 */
export const updateJob = async (jobId, jobData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  // Parse salary range from "CAD 2500 - 3000" format
  let salaryMin = 0;
  let salaryMax = 0;
  if (jobData.estimatedSalary) {
    const salaryMatch = jobData.estimatedSalary.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (salaryMatch) {
      salaryMin = parseFloat(salaryMatch[1]);
      salaryMax = parseFloat(salaryMatch[2]);
    }
  }

  // Determine employmentType and typeOfWork from jobType and contractType
  let employmentType = jobData.jobType || "Full time";
  let typeOfWork = jobData.contractType || jobData.jobType || "Remote";

  // Map jobType to employmentType
  const jobTypeMap = {
    "Full time": "Full-time",
    "Part time": "Part-time",
    "Remote": "Remote",
    "Hybrid": "Hybrid",
    "Internship": "Internship",
  };

  if (jobTypeMap[jobData.jobType]) {
    employmentType = jobTypeMap[jobData.jobType];
  }

  // Map contractType to typeOfWork
  const contractTypeMap = {
    "Contract hybrid": "Hybrid",
    "Contract remote": "Remote",
    "Contract onsite": "On-site",
    "Hourly based": "Hourly",
  };

  if (contractTypeMap[jobData.contractType]) {
    typeOfWork = contractTypeMap[jobData.contractType];
  } else if (jobData.jobType && !jobData.contractType) {
    typeOfWork = jobData.jobType;
  }

  const payload = {
    role: jobData.jobTitle || "",
    companyName: jobData.companyName || "",
    jobLocation: jobData.jobLocation || "",
    address: jobData.address || "",
    experienceRange: jobData.yearsOfExperience || "",
    employmentType: employmentType,
    typeOfWork: typeOfWork,
    preferredLanguage: jobData.preferredLanguage || "English",
    urgentlyHiring: jobData.urgentlyHiring === "Yes" || jobData.urgentlyHiring === true,
    jobDescription: jobData.jobDescription || "",
    requirements: jobData.jobRequirement || "",
    salaryMin: salaryMin,
    salaryMax: salaryMax,
  };

  // Add externalApplyUrl field if provided
  if (jobData.url) {
    payload.externalApplyUrl = jobData.url;
  }

  // Get employer email from token
  const employerEmail = getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs/${jobId}?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update job: ${response.status} ${errorText}`
    );
  }

  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return { success: true, message: "Job updated successfully" };
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { success: true, message: "Job updated successfully" };
  }
};

/**
 * Delete a job
 * DELETE /api/v1/jobs/employer/jobs/{jobId}?email=<employerEmail>
 */
export const deleteJob = async (jobId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No auth token found");
  }

  // Get employer email from token
  const employerEmail = getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/employer/jobs/${jobId}?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete job: ${response.status} ${errorText}`
    );
  }

  return { success: true, message: "Job deleted successfully" };
};
