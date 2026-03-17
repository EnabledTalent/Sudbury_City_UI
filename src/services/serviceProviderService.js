import { BUSINESS_BASE_URL } from "../config/api";
import { getToken } from "./authService";

const API_BASE = `${BUSINESS_BASE_URL}/api/v1/service-provider/profile`;

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
 * Fetch service provider profile(s) by email
 * Returns array - if API returns single object, wraps it; if array, returns as-is
 */
export const fetchServiceProviderProfile = async (email = null) => {
  const token = getToken();
  if (!token) {
    throw new Error("No auth token found");
  }

  const userEmail = email || getEmailFromToken();
  const response = await fetch(
    `${API_BASE}?email=${encodeURIComponent(userEmail)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
      },
    }
  );

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
  }

  const responseText = await response.text();
  if (!responseText || !responseText.trim()) {
    return [];
  }

  try {
    const data = JSON.parse(responseText);
    return Array.isArray(data) ? data : [data];
  } catch (e) {
    return [];
  }
};

/**
 * Create service provider profile
 */
export const createServiceProviderProfile = async (profileData, email = null) => {
  const token = getToken();
  if (!token) {
    throw new Error("No auth token found");
  }

  const userEmail = email || getEmailFromToken();
  const response = await fetch(
    `${API_BASE}?email=${encodeURIComponent(userEmail)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerType: profileData.providerType || "",
        organizationName: profileData.organizationName || "",
        description: profileData.description || "",
        programsAndServices: profileData.programsAndServices || "",
        contactPreferences: profileData.contactPreferences || "",
        impactReportingPreferences: profileData.impactReportingPreferences || "",
        address: profileData.address || "",
        website: profileData.website || "",
        phone: profileData.phone || "",
        contactEmail: profileData.contactEmail || "",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create profile: ${response.status} ${errorText}`);
  }

  const responseText = await response.text();
  if (!responseText || !responseText.trim()) {
    return { success: true };
  }
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { success: true };
  }
};

/**
 * Update service provider profile by ID
 */
export const updateServiceProviderProfile = async (profileData, profileId, email = null) => {
  const token = getToken();
  if (!token) {
    throw new Error("No auth token found");
  }
  if (!profileId) {
    throw new Error("Profile ID is required for update");
  }

  const userEmail = email || getEmailFromToken();
  const response = await fetch(
    `${API_BASE}/${profileId}?email=${encodeURIComponent(userEmail)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerType: profileData.providerType || "",
        organizationName: profileData.organizationName || "",
        description: profileData.description || "",
        programsAndServices: profileData.programsAndServices || "",
        contactPreferences: profileData.contactPreferences || "",
        impactReportingPreferences: profileData.impactReportingPreferences || "",
        address: profileData.address || "",
        website: profileData.website || "",
        phone: profileData.phone || "",
        contactEmail: profileData.contactEmail || "",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
  }

  const responseText = await response.text();
  if (!responseText || !responseText.trim()) {
    return { success: true };
  }
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { success: true };
  }
};

/**
 * Delete service provider profile by ID
 */
export const deleteServiceProviderProfile = async (profileId, email = null) => {
  const token = getToken();
  if (!token) {
    throw new Error("No auth token found");
  }
  if (!profileId) {
    throw new Error("Profile ID is required for delete");
  }

  const userEmail = email || getEmailFromToken();
  const response = await fetch(
    `${API_BASE}/${profileId}?email=${encodeURIComponent(userEmail)}`,
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
    throw new Error(`Failed to delete profile: ${response.status} ${errorText}`);
  }

  return { success: true };
};
