import BASE_URL from "../config/api";
import { getToken } from "./authService";

export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
};
