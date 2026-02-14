import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { normalizeUploadData } from "../utils/normalizeUploadData";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({});

  // ✅ LOAD FROM LOCALSTORAGE WHEN CONTEXT IS USED
  useEffect(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize the data to ensure it matches the expected profile structure
        const normalized = normalizeUploadData(parsed);
        setProfile(normalized);
        // Update localStorage with normalized data
        localStorage.setItem("profileData", JSON.stringify(normalized));
      } catch (e) {
        console.error("Error parsing profile data:", e);
      }
    }
  }, []);

  // Listen for profile data updates (when upload happens)
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        const normalized = normalizeUploadData(e.detail);
        setProfile(normalized);
        localStorage.setItem("profileData", JSON.stringify(normalized));
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "profileData" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const normalized = normalizeUploadData(parsed);
          setProfile(normalized);
        } catch (err) {
          console.error("Error parsing updated profile data:", err);
        }
      }
    };

    window.addEventListener("profileDataUpdated", handleProfileUpdate);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("profileDataUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateProfile = (section, value) => {
    setProfile((prev) => {
      const updated = { ...prev, [section]: value };
      localStorage.setItem("profileData", JSON.stringify(updated));
      return updated;
    });
  };

  // Function to load and normalize profile data (called after upload)
  // Memoized to prevent unnecessary re-renders
  const loadProfileData = useCallback((data) => {
    const normalized = normalizeUploadData(data);
    setProfile(normalized);
    localStorage.setItem("profileData", JSON.stringify(normalized));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, loadProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
