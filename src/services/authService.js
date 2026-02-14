import BASE_URL, { AUTH_BASE_URL } from "../config/api";

/**
 * Get token string from localStorage
 * Handles both string token and JSON object format
 * This is the centralized function to get token across the entire application
 */
export const getToken = () => {
  const tokenData = localStorage.getItem("token");
  if (!tokenData) {
    return null;
  }
  
  try {
    // Try to parse as JSON first (in case it's stored as JSON string)
    const parsed = JSON.parse(tokenData);
    // If it's the new format: { token: { token: "...", role: {...} } }
    if (parsed.token && typeof parsed.token === 'object' && parsed.token.token) {
      return parsed.token.token;
    }
    // If it's just a string token, return it
    if (typeof parsed === 'string') {
      return parsed;
    }
    // If parsed is an object but not the expected format, try to get token property
    if (parsed.token && typeof parsed.token === 'string') {
      return parsed.token;
    }
  } catch (e) {
    // If parsing fails, it's likely already a string token
    return tokenData;
  }
  
  // Fallback: return as-is if it's a string
  return typeof tokenData === 'string' ? tokenData : null;
};

export const registerUser = async (payload) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Registration failed");
  
  const response = await res.json();
  
  // Handle new response format: { token: { token: "...", role: { role: "..." } } }
  if (response.token) {
    const token = response.token.token;
    const role = response.token.role?.role || response.token.role;
    
    if (token) {
      localStorage.setItem("token", token);
    }
    
    if (role) {
      localStorage.setItem("role", role);
    }
    
    return {
      token,
      role,
      ...response
    };
  }
  
  return response;
};



export const loginUser = async (username, password) => {
  const response = await fetch(
    `${BASE_URL}/signin?username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}`,
    {
      method: "POST",
      headers: {
        accept: "*/*",
      },
    }
  );

  // ⛔ must be 200
  if (!response.ok) {
    throw new Error("Login failed");
  }

  // ✅ READ RAW TOKEN STRING
  const token = await response.text();

  if (!token) {
    throw new Error("Token missing");
  }

  // ✅ STORE TOKEN
  localStorage.setItem("token", token);

  // ✅ DECODE ROLE FROM JWT PAYLOAD
  const payload = JSON.parse(atob(token.split(".")[1]));
  localStorage.setItem("role", payload.role);

  return payload; // contains role, sub, exp, etc.
};

/**
 * Logout user by calling logout API
 */
export const logoutUser = async () => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        accept: "*/*",
      },
    });

    // Even if the API call fails, we should still clear local storage
    // The response might not be critical for logout
    if (!response.ok) {
      console.warn("Logout API call failed, but continuing with local logout");
    }
  } catch (error) {
    // If there's a network error, still proceed with local logout
    console.warn("Error calling logout API:", error);
  }
};