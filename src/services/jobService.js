import { BUSINESS_BASE_URL } from "../config/api";
import { saveProfile } from "./profileService";
import { normalizeUploadData } from "../utils/normalizeUploadData";

/**
 * Fetch jobs from backend API
 */
export const fetchJobs = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/v1/jobs/job`,
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
    console.log("Empty response from fetch jobs");
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
          console.log("Successfully extracted valid JSON from malformed response");
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
  const token = localStorage.getItem("token");

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
    console.log("Empty response from fetch applications");
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
          console.log("Successfully extracted valid JSON from malformed response");
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
  const token = localStorage.getItem("token");

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
    console.log("Empty response from fetch metrics");
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
          console.log("Successfully extracted valid JSON from malformed response");
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
  const token = localStorage.getItem("token");

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
  console.log("Upload response status:", response.status);

  if (!response.ok) {
    throw new Error("Upload failed");
  }
  
  const data = await response.json();
  console.log("Parsed resume data:", data);

  // ✅ STEP 2: NORMALIZE AND STORE PROFILE DATA
  const normalizedData = normalizeUploadData(data);
  
  localStorage.setItem(
    "profileData",
    JSON.stringify(normalizedData)
  );
  console.log("Normalized profile data stored in localStorage", normalizedData);
  
  // Trigger custom event to notify context of update (storage event only works across tabs)
  // We'll use a custom event for same-tab updates
  window.dispatchEvent(new CustomEvent("profileDataUpdated", { detail: normalizedData }));

  // ✅ STEP 3: SAVE PROFILE TO BACKEND API
  try {
    console.log("Saving profile to backend...");
    await saveProfile(data);
    console.log("Profile saved to backend successfully");
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
  const token = localStorage.getItem("token");

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
  
  console.log("Applying to job:", jobId);
  console.log("Profile data:", profileData);

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

  console.log("Apply response status:", response.status);

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
    console.log("Empty response, treating as success");
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
