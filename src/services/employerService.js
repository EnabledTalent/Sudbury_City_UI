import { BUSINESS_BASE_URL } from "../config/api";

/**
 * Get email from JWT token
 */
const getEmailFromToken = () => {
  const token = localStorage.getItem("token");
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
 * Fetch organization profile for employer
 */
export const fetchOrganizationProfile = async (email = null) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const employerEmail = email || getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/employer/profile/organization?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  // If 404, organization profile doesn't exist
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch organization profile: ${response.status} ${errorText}`
    );
  }

  // Check if response has content
  const responseText = await response.text();
  
  if (!responseText || !responseText.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    // If parsing fails, return null (profile doesn't exist)
    return null;
  }
};

/**
 * Save organization profile for employer
 */
export const saveOrganizationProfile = async (organizationData, email = null) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const employerEmail = email || getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/employer/profile/organization?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationName: organizationData.organizationName || "",
        aboutOrganization: organizationData.aboutOrganization || "",
        location: organizationData.location || "",
        foundedYear: organizationData.foundedYear ? parseInt(organizationData.foundedYear) : 0,
        website: organizationData.website || "",
        companySize: organizationData.companySize || "",
        industry: organizationData.industry || "",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to save organization profile: ${response.status} ${errorText}`
    );
  }

  // Check if response has content
  const responseText = await response.text();
  
  // If response is empty, treat as success (common for POST endpoints)
  if (!responseText || !responseText.trim()) {
    return { success: true, message: "Organization profile saved successfully" };
  }

  // Try to parse JSON, but handle errors gracefully
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { success: true, message: "Organization profile saved successfully" };
  }
};

/**
 * Update organization profile for employer (PUT request)
 */
export const updateOrganizationProfile = async (organizationData, email = null) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const employerEmail = email || getEmailFromToken();

  const response = await fetch(
    `${BUSINESS_BASE_URL}/api/employer/profile/organization?email=${encodeURIComponent(employerEmail)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        organizationName: organizationData.organizationName || "",
        aboutOrganization: organizationData.aboutOrganization || "",
        location: organizationData.location || "",
        foundedYear: organizationData.foundedYear ? parseInt(organizationData.foundedYear) : 0,
        website: organizationData.website || "",
        companySize: organizationData.companySize || "",
        industry: organizationData.industry || "",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update organization profile: ${response.status} ${errorText}`
    );
  }

  // Check if response has content
  const responseText = await response.text();
  
  // If response is empty, treat as success (common for PUT endpoints)
  if (!responseText || !responseText.trim()) {
    return { success: true, message: "Organization profile updated successfully" };
  }

  // Try to parse JSON, but handle errors gracefully
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { success: true, message: "Organization profile updated successfully" };
  }
};
