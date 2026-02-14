import { useState, useEffect, useRef } from "react";
import Stepper from "../components/profile/Stepper";
import BasicInfo from "../components/profile/BasicInfo";
import Education from "../components/profile/Education";
import Work from "../components/profile/Work";
import Skills from "../components/profile/Skills";
import Projects from "../components/profile/Projects";
import Achievements from "../components/profile/Achievements";
import Certification from "../components/profile/Certification";
import Preference from "../components/profile/Preference";
import OtherDetails from "../components/profile/OtherDetails";
import ReviewAgree from "../components/profile/ReviewAgree";
import { fetchProfile } from "../services/profileService";
import { useProfile } from "../context/ProfileContext";
import { getToken } from "../services/authService";


const steps = [
  { key: "basicInfo", label: "Basic Info", component: BasicInfo },
  { key: "education", label: "Education", component: Education },
  { key: "workExperience", label: "Work Experience", component: Work },
  { key: "skills", label: "Skills", component: Skills },
  { key: "projects", label: "Projects", component: Projects },
  { key: "achievements", label: "Achievements", component: Achievements },
  { key: "certification", label: "Certification", component: Certification },
  { key: "preference", label: "Preference", component: Preference },
  { key: "otherDetails", label: "Other Details", component: OtherDetails },
  { key: "reviewAgree", label: "Review And Agree", component: ReviewAgree },
];

export default function ProfileBuilder() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { loadProfileData } = useProfile();
  const hasFetchedProfile = useRef(false);
  const ActiveComponent = steps[activeStep].component;

  // Get email from token (prioritize token over profile data)
  const getEmail = () => {
    // First, try to get email from JWT token (most reliable)
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const email = payload.sub || payload.email || payload.username;
        if (email) {
          return email;
        }
      } catch (e) {
        // Error parsing token
      }
    }
    
    // Fallback to profile data if token doesn't have email
    const profileData = localStorage.getItem("profileData");
    if (profileData) {
      try {
        const parsed = JSON.parse(profileData);
        return parsed.basicInfo?.email || parsed.email;
      } catch (e) {
        console.error("Error parsing profileData:", e);
      }
    }
    
    return null;
  };

  // Fetch profile from API when in edit mode (only once)
  useEffect(() => {
    const isEditMode = localStorage.getItem("profileEditMode") === "true";
    
    // Only fetch if in edit mode and we haven't fetched yet
    if (isEditMode && !hasFetchedProfile.current) {
      hasFetchedProfile.current = true; // Mark as fetched to prevent re-fetching
      
      const loadProfileFromAPI = async () => {
        setLoading(true);
        const email = getEmail();
        
        if (!email) {
          console.error("Email not found. Cannot fetch profile.");
          setLoading(false);
          return;
        }

        try {
          const profileData = await fetchProfile(email);
          
          if (profileData && Object.keys(profileData).length > 0) {
            // Load the fetched profile into the context
            loadProfileData(profileData);
          } else {
            console.warn("No profile data returned from API");
          }
        } catch (error) {
          console.error("Error fetching profile for edit mode:", error);
        } finally {
          setLoading(false);
        }
      };

      loadProfileFromAPI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="profile-layout">
      {/* LEFT PANEL */}
      <Stepper
        steps={steps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
      />

      {/* RIGHT CONTENT */}
      <div className="profile-content">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            Loading profile data...
          </div>
        ) : (
          <ActiveComponent
            onNext={() => {
              if (activeStep < steps.length - 1) {
                setActiveStep((s) => s + 1);
              }
            }}
            onPrev={activeStep > 0 ? () => setActiveStep((s) => s - 1) : undefined}
          />
        )}
      </div>
    </div>
  );
}
