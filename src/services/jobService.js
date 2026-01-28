import { BUSINESS_BASE_URL } from "../config/api";

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

  // ✅ STEP 2: STORE ACTUAL PROFILE DATA
  localStorage.setItem(
    "profileData",
    JSON.stringify(data)
  );
console.log("Profile data stored", data)
  return data;
};
