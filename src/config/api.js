const ENV = import.meta.env.MODE; // "development" | "production"

// Base URL for all endpoints post login (business endpoints)
export const BUSINESS_BASE_URL = "https://java-services-sudburry.onrender.com";

// Base URL for login/register/signup/logout (API Gateway)
const BASE_URL = "https://api-gateway-c0io.onrender.com";

// Auth service URL (same as BASE_URL for login/signup/logout)
export const AUTH_BASE_URL = "https://api-gateway-c0io.onrender.com";

export default BASE_URL;
