import { useMemo } from "react";
import { useProfile } from "../../context/ProfileContext";
import { calculateProfileCompletion } from "../../utils/profileCompletion";

export default function ProfileHeader() {
  const { profile } = useProfile();
  const name = profile.basicInfo?.name || "User";
  
  const completionPercentage = useMemo(() => {
    return calculateProfileCompletion(profile);
  }, [profile]);

  // Calculate SVG circle progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercentage / 100) * circumference;

  const styles = {
    banner: {
      background: "linear-gradient(90deg, #fb923c 0%, #ea580c 100%)",
      color: "#ffffff",
      borderRadius: "16px",
      padding: "28px 36px",
      marginBottom: "32px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "relative",
      overflow: "visible",
      minHeight: "120px",
    },
    leftContent: {
      flex: 1,
      zIndex: 2,
    },
    welcomeText: {
      fontSize: "16px",
      fontWeight: 500,
      marginBottom: "8px",
      color: "#ffffff",
    },
    title: {
      margin: 0,
      fontSize: "36px",
      fontWeight: 700,
      letterSpacing: "-0.5px",
      color: "#ffffff",
    },
    progressContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
      position: "relative",
      flexShrink: 0,
      marginLeft: "24px",
    },
    progressWrapper: {
      position: "relative",
      width: "110px",
      height: "110px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    svg: {
      position: "absolute",
      top: "0",
      left: "0",
      transform: "rotate(-90deg)",
      width: "110px",
      height: "110px",
    },
    progressRing: {
      fill: "none",
      stroke: "#3b82f6",
      strokeWidth: "5",
      strokeLinecap: "round",
      transition: "stroke-dashoffset 0.6s ease",
    },
    progressCircle: {
      width: "100px",
      height: "100px",
      position: "relative",
      background: "#ffffff",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      zIndex: 2,
    },
    progressText: {
      position: "relative",
      zIndex: 3,
      textAlign: "center",
      width: "100%",
    },
    progressNumber: {
      fontSize: "48px",
      fontWeight: 700,
      color: "#111827",
      lineHeight: 1,
      marginBottom: "6px",
    },
    progressLabel: {
      fontSize: "11px",
      fontWeight: 500,
      color: "#6b7280",
      lineHeight: 1.4,
      textAlign: "center",
    },
  };

  return (
    <div style={styles.banner}>
      <div style={styles.leftContent}>
        <div style={styles.welcomeText}>Welcome</div>
        <h2 style={styles.title}>{name}</h2>
      </div>
      <div style={styles.progressContainer}>
        <div style={styles.progressWrapper}>
          <svg style={styles.svg}>
            {/* Blue progress ring around the circle */}
            <circle
              cx="55"
              cy="55"
              r={radius}
              style={styles.progressRing}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div style={styles.progressCircle}>
            <div style={styles.progressText}>
              <div style={styles.progressNumber}>{completionPercentage}</div>
              <div style={styles.progressLabel}>
                Profile<br />Completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
