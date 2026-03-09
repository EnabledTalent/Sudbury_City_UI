import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";
import "./ProfileSuccess.css";

export default function ProfileSuccess() {
  const brandLogoSrc = `${process.env.PUBLIC_URL}/images/Sudbury logo.svg`;
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logoutUser();
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="profile-success">
      <header className="profile-success__header">
        <div className="profile-success__brand" aria-label="Sudburry">
          <img
            className="profile-success__brand-image"
            src={brandLogoSrc}
            alt=""
            aria-hidden="true"
          />
          <span className="profile-success__brand-text">Sudburry</span>
        </div>

        <nav className="profile-success__actions" aria-label="User actions">
          <span className="profile-success__profile-label">Profile</span>
          <button
            type="button"
            className="profile-success__logout-btn"
            onClick={handleLogout}
          >
            Log Out
          </button>
          <button
            type="button"
            className="profile-success__coach-btn"
            onClick={() => navigate("/student/view-profile")}
          >
            AI Career Coach
          </button>
        </nav>
      </header>

      <main className="profile-success__main" aria-labelledby="profile-success-heading">
        <section className="profile-success__card">
          <h1 id="profile-success-heading" className="profile-success__title">
            Congrats, your profile has been created successfully
          </h1>

          <p className="profile-success__description">
            You can now view and update your profile, track your applications, and continue exploring roles.
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
