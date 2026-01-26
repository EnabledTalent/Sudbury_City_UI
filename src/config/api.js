const ENV = import.meta.env.MODE; // "development" | "production"
export const AUTH_BASE_URL = "http://localhost:8081";
export const BUSINESS_BASE_URL = "http://localhost:8083";

const BASE_URL =
  ENV === "production"
    ? "https://your-cloud-url.com"
    : "http://localhost:8081";

export default BASE_URL;
