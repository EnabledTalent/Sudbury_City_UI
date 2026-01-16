// API Proxy utility
// This handles both mock data (development) and real API calls (production)

import { mockApi } from "../services/mockApi";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const USE_MOCK = !API_BASE_URL || process.env.REACT_APP_USE_MOCK_API === "true";

export async function fetchSudburyData(endpoint) {
  if (USE_MOCK) {
    // Use mock data for development
    const endpointMap = {
      "/api/sudbury/services": () => mockApi.getServices(),
      "/api/sudbury/events": () => mockApi.getEvents(),
      "/api/sudbury/businesses": () => mockApi.getBusinesses(),
    };

    const handler = endpointMap[endpoint];
    if (handler) {
      return handler();
    }
    throw new Error(`Unknown endpoint: ${endpoint}`);
  } else {
    // Use real API in production
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
}

