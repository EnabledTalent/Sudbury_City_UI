import { Menu, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";
import "./StudentHeader.css";

const NAV_ITEMS = [
  {
    key: "home",
    label: "Home",
    path: "/student/view-profile",
    tour: "student-nav-home",
  },
  {
    key: "myJobs",
    label: "My Jobs",
    path: "/student/my-jobs",
    tour: "student-nav-myjobs",
  },
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/student/dashboard",
    tour: "student-nav-dashboard",
  },
];

export default function StudentHeader({
  activePage = "",
  showMainNav = true,
  showLogout = true,
  showAiCoach = false,
  onAiCoachClick,
  aiCoachTourId = "student-ai-coach",
  showSearch = false,
  searchValue = "",
  searchPlaceholder = "Search",
  onSearchChange,
  extraActions = null,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);
  const menuButtonRef = useRef(null);
  const menuPanelId = useId();
  const alignActionsRight = !showMainNav && !showSearch;

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
    localStorage.removeItem("profileEditMode");
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
      className={`student-header ${menuOpen ? "student-header--menu-open" : ""}`}
    >
      <nav className="student-header__nav" aria-label="Student navigation">
        <div className="student-header__logo" aria-label="Sudburry">
          <span className="student-header__logo-icon" aria-hidden="true" />
          <span>Sudburry</span>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="student-header__menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls={menuPanelId}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

        <div
          id={menuPanelId}
          className={`student-header__menu-panel ${
            alignActionsRight ? "student-header__menu-panel--actions-right" : ""
          }`}
        >
          {showMainNav && (
            <div className="student-header__nav-links">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`student-header__nav-link ${
                      isActive ? "student-header__nav-link--active" : ""
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

          {showSearch && (
            <label className="student-header__search" aria-label="Search jobs">
              <Search size={14} aria-hidden="true" />
              <input
                type="text"
                value={searchValue}
                placeholder={searchPlaceholder}
                onChange={(event) => onSearchChange?.(event.target.value)}
              />
            </label>
          )}

          <div className="student-header__actions">
            {showAiCoach && (
              <button
                type="button"
                className="student-header__action student-header__action--primary"
                onClick={() => {
                  onAiCoachClick?.();
                  closeMenu();
                }}
                data-tour={aiCoachTourId}
              >
                AI Career Coach
              </button>
            )}

            {extraActions}

            {showLogout && (
              <button
                type="button"
                className="student-header__action student-header__action--danger"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
