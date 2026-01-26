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

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
};
