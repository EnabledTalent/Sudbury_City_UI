import { BUSINESS_BASE_URL } from "../config/api";

/**
 * Transform profile data from context format to API format
 */
const transformProfileForAPI = (profile) => {
  const transformed = {
    basicInfo: {
      name: profile.basicInfo?.name || "",
      email: profile.basicInfo?.email || "",
      phone: profile.basicInfo?.phone || "",
      linkedin: profile.basicInfo?.linkedin || "",
    },
    education: (profile.education || []).map((edu) => ({
      degree: edu.degree || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      institution: edu.institution || "",
      startDate: edu.startDate ? String(edu.startDate) : "",
      endDate: edu.endDate ? String(edu.endDate) : "",
      grade: edu.grade || "",
      location: edu.location || "",
    })),
    workExperience: (profile.workExperience || []).map((exp) => {
      // Handle date conversion - if it's a full date string, extract year
      let startDate = "";
      let endDate = "";
      
      if (exp.startDate) {
        if (typeof exp.startDate === "string" && exp.startDate.includes("-")) {
          // Extract year from date string (e.g., "2022-01-01" -> "2022")
          startDate = exp.startDate.substring(0, 4);
        } else {
          startDate = String(exp.startDate);
        }
      }
      
      if (exp.endDate) {
        if (typeof exp.endDate === "string" && exp.endDate.includes("-")) {
          endDate = exp.endDate.substring(0, 4);
        } else {
          endDate = String(exp.endDate);
        }
      }
      
      return {
        jobTitle: exp.jobTitle || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: startDate,
        endDate: endDate,
        currentlyWorking: exp.currentlyWorking || false,
        responsibilities: Array.isArray(exp.responsibilities)
          ? exp.responsibilities
          : [],
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
        description: exp.description || "",
      };
    }),
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
    preference: profile.preference
      ? {
          companySize: profile.preference.companySize || "",
          jobType: profile.preference.jobType || "",
          jobSearch: profile.preference.jobSearch || "",
        }
      : {
          companySize: "",
          jobType: "",
          jobSearch: "",
        },
    otherDetails: {
      languages: (profile.otherDetails?.languages || []).map((lang) => ({
        language: lang.language || "",
        speaking: lang.speaking || "",
        reading: lang.reading || "",
        writing: lang.writing || "",
      })),
      careerStage: profile.otherDetails?.careerStage || "",
      earliestAvailability: profile.otherDetails?.earliestAvailability || "",
      desiredSalary: profile.otherDetails?.desiredSalary || "",
      otherDetailsText: profile.otherDetails?.otherDetailsText || profile.otherDetails || "",
    },
    reviewAgree: {
      discovery: profile.reviewAgree?.discovery || "",
      comments: profile.reviewAgree?.comments || "",
      agreed: profile.reviewAgree?.agreed || false,
    },
  };

  return transformed;
};

/**
 * Save profile to backend API
 */
export const saveProfile = async (profile) => {
  const token = localStorage.getItem("token");
  const email = profile.basicInfo?.email;

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!email) {
    throw new Error("Email is required to save profile");
  }

  const transformedData = transformProfileForAPI(profile);
  
  console.log("Saving profile with data:", transformedData);
  console.log("API URL:", `${BUSINESS_BASE_URL}/api/jobseeker/profile?email=${encodeURIComponent(email)}`);

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/jobseeker/profile?email=${encodeURIComponent(email)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    }
  );
  
  console.log("Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to save profile: ${response.status} ${errorText}`
    );
  }

  // Check if response has content and is JSON
  const contentType = response.headers.get("content-type");
  const responseText = await response.text();
  
  // If response is empty, treat as success (common for POST endpoints)
  if (!responseText || !responseText.trim()) {
    console.log("Empty response, treating as success");
    return { success: true, message: "Profile saved successfully" };
  }

  // Try to parse JSON, but handle errors gracefully
  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (parseError) {
    console.warn("Response is not valid JSON:", parseError);
    console.warn("Response text:", responseText.substring(0, 200)); // Log first 200 chars
    // If status is 200, treat as success even if JSON parsing fails
    // This handles cases where backend returns 200 with non-JSON response
    console.log("Status is 200, treating as success despite JSON parse error");
    return { success: true, message: "Profile saved successfully" };
  }
};

/**
 * Update profile to backend API (PUT request)
 */
export const updateProfile = async (profile) => {
  const token = localStorage.getItem("token");
  const email = profile.basicInfo?.email;

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!email) {
    throw new Error("Email is required to update profile");
  }

  const transformedData = transformProfileForAPI(profile);
  
  console.log("Updating profile with data:", transformedData);
  console.log("API URL:", `${BUSINESS_BASE_URL}/api/jobseeker/profile?email=${encodeURIComponent(email)}`);

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/jobseeker/profile?email=${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedData),
    }
  );
  
  console.log("Response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update profile: ${response.status} ${errorText}`
    );
  }

  // Check if response has content and is JSON
  const contentType = response.headers.get("content-type");
  const responseText = await response.text();
  
  // If response is empty, treat as success (common for PUT endpoints)
  if (!responseText || !responseText.trim()) {
    console.log("Empty response, treating as success");
    return { success: true, message: "Profile updated successfully" };
  }

  // Try to parse JSON, but handle errors gracefully
  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (parseError) {
    console.warn("Response is not valid JSON:", parseError);
    console.warn("Response text:", responseText.substring(0, 200));
    // If status is 200, treat as success even if JSON parsing fails
    console.log("Status is 200, treating as success despite JSON parse error");
    return { success: true, message: "Profile updated successfully" };
  }
};

/**
 * Fetch profile from backend API
 */
export const fetchProfile = async (email) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  if (!email) {
    throw new Error("Email is required to fetch profile");
  }

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/jobseeker/profile?email=${encodeURIComponent(email)}`,
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
      `Failed to fetch profile: ${response.status} ${errorText}`
    );
  }

  // Get response as text first to handle potential JSON parsing issues
  const responseText = await response.text();
  
  console.log("Raw response text length:", responseText.length);
  console.log("Raw response text (first 1000 chars):", responseText.substring(0, 1000));
  
  // If response is empty, return empty profile
  if (!responseText || !responseText.trim()) {
    console.log("Empty response from fetch profile");
    return {};
  }

  // Clean the response text - remove any leading/trailing whitespace
  let cleanedText = responseText.trim();
  
  // Try to parse JSON, but handle errors gracefully
  try {
    const data = JSON.parse(cleanedText);
    console.log("Successfully parsed JSON response");
    return data;
  } catch (parseError) {
    console.warn("Initial JSON parse failed:", parseError.message);
    console.warn("Response text (first 1000 chars):", cleanedText.substring(0, 1000));
    console.warn("Response text (last 500 chars):", cleanedText.substring(Math.max(0, cleanedText.length - 500)));
    
    // Try to extract valid JSON from the response if it's partially malformed
    try {
      // Try to find the start of valid JSON object
      const jsonStart = cleanedText.indexOf('{');
      if (jsonStart !== -1) {
        // Try to extract from the first { to the last }
        const jsonEnd = cleanedText.lastIndexOf('}');
        if (jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = cleanedText.substring(jsonStart, jsonEnd + 1);
          console.log("Attempting to extract JSON from position", jsonStart, "to", jsonEnd);
          console.log("Extracted JSON (first 500 chars):", extractedJson.substring(0, 500));
          
          const data = JSON.parse(extractedJson);
          console.log("Successfully extracted valid JSON from malformed response");
          return data;
        }
      }
      
      // If no { found, try to find array start
      const arrayStart = cleanedText.indexOf('[');
      if (arrayStart !== -1) {
        const arrayEnd = cleanedText.lastIndexOf(']');
        if (arrayEnd !== -1 && arrayEnd > arrayStart) {
          const extractedJson = cleanedText.substring(arrayStart, arrayEnd + 1);
          const data = JSON.parse(extractedJson);
          console.log("Successfully extracted valid JSON array from malformed response");
          return data;
        }
      }
    } catch (extractError) {
      console.error("Failed to extract valid JSON:", extractError);
      console.error("Extract error details:", extractError.message);
    }
    
    // If we can't parse it, still try to return the raw response or empty object
    // This way the UI can at least try to display something
    console.error("Could not parse response as JSON. Returning empty object.");
    console.error("Full response text:", responseText);
    
    // Don't throw error, just return empty object so UI doesn't break
    return {};
  }
};

/**
 * Fetch all jobseeker profiles
 */
export const fetchAllJobseekerProfiles = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/jobseeker/profile/all`,
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
      `Failed to fetch all profiles: ${response.status} ${errorText}`
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
    console.error("Error parsing all profiles:", e);
    return [];
  }
};
