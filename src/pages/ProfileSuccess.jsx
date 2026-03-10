import { useNavigate } from "react-router-dom";
import StudentHeader from "../components/student/StudentHeader";
import "./ProfileSuccess.css";

export default function ProfileSuccess() {
  const navigate = useNavigate();

  return (
    <div className="profile-success">
      <StudentHeader showMainNav={false} showAiCoach={false} />

      <main className="profile-success__main" aria-label="Profile created">
        <section className="profile-success__card" aria-label="Profile created successfully">
          <h1 className="profile-success__title">
            Congrats, your profile has been created successfully
          </h1>
          <p className="profile-success__subtitle">
            You can review your profile and start applying to matching jobs.
          </p>

          <button
            type="button"
            className="profile-success__primary-btn"
            onClick={() => navigate("/student/view-profile")}
          >
            View your profile
          </button>
        </section>
      </main>
    </div>
  );
}
