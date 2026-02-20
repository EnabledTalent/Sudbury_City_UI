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

  const raw = await res.text();

  const parseApiMessage = (text) => {
    if (!text) return null;
    try {
      const data = JSON.parse(text);
      if (typeof data === "string") return data;
      if (data?.message) return data.message;
      if (data?.error) return data.error;
      if (data?.detail) return data.detail;
      if (data?.title) return data.title;
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.join(", ");
      }
      return text; // fallback: show whatever backend returned
    } catch {
      return text; // plain-text error
    }
  };

  if (!res.ok) {
    const apiMessage = parseApiMessage(raw);
    throw new Error(apiMessage || `Registration failed (${res.status})`);
  }

  const response = raw ? (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  })() : {};
  
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
    const rawError = await response.text();
    throw new Error(rawError || "Login failed");
  }

  // Response can be either:
  // - raw token string
  // - JSON: { token: { token: "...", role: { role: "..." } }, firstTimeLogin: true }
  const raw = await response.text();

  let token = "";
  let role = "";
  let firstTimeLogin = false;

  try {
    const data = JSON.parse(raw);
    if (data?.token?.token) {
      token = data.token.token;
      role = data.token.role?.role || data.token.role || "";
      firstTimeLogin = Boolean(data.firstTimeLogin);
    } else if (typeof data === "string") {
      token = data;
    }
  } catch {
    token = raw;
  }

  if (!token) {
    throw new Error("Token missing");
  }

  // ✅ STORE TOKEN
  localStorage.setItem("token", token);

  // ✅ DECODE ROLE FROM JWT PAYLOAD
  const payload = JSON.parse(atob(token.split(".")[1]));
  localStorage.setItem("role", role || payload.role);
  localStorage.setItem("firstTimeLogin", firstTimeLogin ? "true" : "false");

  return { ...payload, firstTimeLogin }; // contains role, sub, exp, etc.
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