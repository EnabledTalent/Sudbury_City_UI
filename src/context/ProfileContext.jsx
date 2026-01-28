import { createContext, useContext, useState, useEffect } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({});

  // ✅ LOAD FROM LOCALSTORAGE WHEN CONTEXT IS USED
  useEffect(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const updateProfile = (section, value) => {
    setProfile((prev) => {
      const updated = { ...prev, [section]: value };
      localStorage.setItem("profileData", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
