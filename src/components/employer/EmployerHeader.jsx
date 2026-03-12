import { Menu, User, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import "./EmployerHeader.css";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/employer/dashboard",
    tour: "employer-nav-dashboard",
  },
  {
    key: "candidates",
    label: "Candidates",
    path: "/employer/candidates",
    tour: "employer-nav-candidates",
  },
  {
    key: "listedJobs",
    label: "Listed Jobs",
    path: "/employer/listed-jobs",
    tour: "employer-nav-listedjobs",
  },
];

export default function EmployerHeader({
  activePage = "",
  showMainNav = true,
  showProfileShortcut = true,
  showPostJob = true,
  showLogout = true,
  extraActions = null,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuPanelId = useId();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Continue local logout even if API call fails.
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileData");
    closeMenu();
    navigate("/");
  };

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        if (menuButtonRef.current) {
          menuButtonRef.current.focus();
        }
      }
    };

    const onMouseDown = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [menuOpen]);

  return (
    <header
      ref={rootRef}
      className={`employer-header ${menuOpen ? "employer-header--menu-open" : ""}`}
    >
      <nav className="employer-header__nav" aria-label="Employer navigation">
        <div className="employer-header__logo" aria-label="Sudburry">
          <span className="employer-header__logo-icon" aria-hidden="true" />
          <span>Sudburry</span>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="employer-header__menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls={menuPanelId}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

        <div id={menuPanelId} className="employer-header__menu-panel">
          {showMainNav && (
            <div className="employer-header__nav-links">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`employer-header__nav-link ${
                      isActive ? "employer-header__nav-link--active" : ""
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      if (!isActive) {
                        navigate(item.path);
                      }
                      closeMenu();
                    }}
                    data-tour={item.tour}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="employer-header__actions">
            {showProfileShortcut && (
              <button
                type="button"
                className="employer-header__action employer-header__action--secondary"
                onClick={() => {
                  navigate("/employer/company-profile");
                  closeMenu();
                }}
              >
                <User size={16} aria-hidden="true" />
                Profile
              </button>
            )}

            {extraActions}

            {showLogout && (
              <button
                type="button"
                className="employer-header__action employer-header__action--danger"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}

            {showPostJob && (
              <button
                type="button"
                className="employer-header__action employer-header__action--primary"
                onClick={() => {
                  navigate("/employer/post-job");
                  closeMenu();
                }}
                data-tour="employer-postjob"
              >
                Post a Job +
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
