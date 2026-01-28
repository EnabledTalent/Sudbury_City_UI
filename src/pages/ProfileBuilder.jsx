import { useState } from "react";
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
  const ActiveComponent = steps[activeStep].component;
  console.log("ProfileBuilder rendered, step:", activeStep);
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
        <ActiveComponent
          onNext={() => setActiveStep((s) => s + 1)}
          onPrev={() => setActiveStep((s) => s - 1)}
        />
      </div>
    </div>
  );
}
