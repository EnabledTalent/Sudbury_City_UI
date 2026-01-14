import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const userRoles = [
  {
    id: "student",
    title: "Student",
    description: "Studying, training, or early career",
    icon: "🎓",
    color: "#3b82f6",
  },
  {
    id: "resident",
    title: "Resident",
    description: "Living and working in Sudbury",
    icon: "🏠",
    color: "#10b981",
  },
  {
    id: "newcomer",
    title: "Newcomer",
    description: "New to the city or recently moved",
    icon: "🌍",
    color: "#8b5cf6",
  },
  {
    id: "traveller",
    title: "Traveller",
    description: "Visiting Sudbury",
    icon: "✈️",
    color: "#f59e0b",
  },
];

export default function UserSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    // Navigate to respective hub page after selection
    const hubRoutes = {
      student: "/student-hub",
      resident: "/resident-hub",
      newcomer: "/newcomer-hub",
      traveller: "/traveller-hub",
    };
    navigate(hubRoutes[roleId] || "/");
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <>
      <div 
        className="user-selection-page"
        style={{
          backgroundImage: 'url("/images/home-page-image.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(1.3)'
        }}
      >
      {/* Dark overlay */}
      <div className="user-selection-overlay"></div>

      {/* Main card */}
      <div className="user-selection-card">
        <h1 className="user-selection-title">
          How are you using <span className="highlight-blue">Sudbury</span> today?
        </h1>
        <p className="user-selection-subtitle">
          This helps us show you what's most useful. You can change this anytime.
        </p>

        {/* Role options grid */}
        <div className="user-roles-grid">
          {userRoles.map((role) => (
            <div
              key={role.id}
              className={`user-role-card ${selectedRole === role.id ? "selected" : ""}`}
              onClick={() => handleRoleSelect(role.id)}
              style={{ "--role-color": role.color }}
            >
              <div className="user-role-icon" style={{ backgroundColor: `${role.color}20` }}>
                <span style={{ fontSize: "32px" }}>{role.icon}</span>
              </div>
              <h3 className="user-role-title">{role.title}</h3>
              <p className="user-role-description">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Skip option */}
        <button className="user-selection-skip" onClick={handleSkip}>
          Skip for now
        </button>
      </div>
    </div>
    <AiCtaFooter />
    </>
  );
}

