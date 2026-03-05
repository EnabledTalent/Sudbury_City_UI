import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchOrganizationProfile,
  saveOrganizationProfile,
} from "../../services/employerService";
import { logoutUser } from "../../services/authService";
import Toast from "../../components/Toast";
import YearPicker from "../../components/YearPicker";
import "./EmployerHome.css";

const DEFAULT_FORM_DATA = {
  organizationName: "",
  aboutOrganization: "",
  location: "Allentown, New Mexico 31134",
  foundedYear: "",
  website: "",
  companySize: "10-100",
  industry: "Information Technology",
};

export default function EmployerHome() {
  const navigate = useNavigate();
  const [websiteError, setWebsiteError] = useState("");
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [toast, setToast] = useState({ message: "", type: "error" });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "organizationName") {
      localStorage.setItem("employer:orgName:draft", value);
    }

    if (name === "website") {
      setWebsiteError("");
    }
  };

  const handleCompanySizeChange = (size) => {
    setFormData((prev) => ({
      ...prev,
      companySize: size,
    }));
  };

  const handleCancel = () => {
    setFormData(DEFAULT_FORM_DATA);
    setWebsiteError("");
  };

  const normalizeHttpsUrl = (raw) => {
    const value = String(raw || "").trim();

    if (!value) return "";
    if (value.startsWith("https://")) return value;
    if (value.startsWith("http://")) return `https://${value.slice("http://".length)}`;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) return value;

    return `https://${value}`;
  };

  const validateWebsite = (raw) => {
    const value = String(raw || "").trim();

    if (!value) return "Website is required";

    const normalized = normalizeHttpsUrl(value);
    if (!normalized.startsWith("https://")) return "Website must start with https://";

    try {
      // eslint-disable-next-line no-new
      new URL(normalized);
    } catch {
      return "Please enter a valid website URL";
    }

    return "";
  };

  const handleWebsiteBlur = (event) => {
    const normalized = normalizeHttpsUrl(event.target.value);

    if (normalized !== event.target.value) {
      setFormData((prev) => ({ ...prev, website: normalized }));
    }

    setWebsiteError(validateWebsite(normalized));
  };

  useEffect(() => {
    const draftName = localStorage.getItem("employer:orgName:draft");

    if (draftName) {
      setFormData((prev) => ({
        ...prev,
        organizationName: prev.organizationName || draftName,
      }));
    }

    const loadExistingOrg = async () => {
      try {
        const existing = await fetchOrganizationProfile();

        if (existing && (existing.organizationName || existing.aboutOrganization)) {
          setFormData((prev) => ({
            ...prev,
            organizationName: prev.organizationName || existing.organizationName || "",
            aboutOrganization: prev.aboutOrganization || existing.aboutOrganization || "",
            location: prev.location || existing.location || "",
            foundedYear:
              prev.foundedYear || (existing.foundedYear ? String(existing.foundedYear) : ""),
            website: prev.website || existing.website || "",
            companySize: prev.companySize || existing.companySize || prev.companySize,
            industry: prev.industry || existing.industry || prev.industry,
          }));
        }
      } catch {
        // Allow manual entry when prefill fails.
      }
    };

    loadExistingOrg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveAndNext = async () => {
    try {
      const websiteValidation = validateWebsite(formData.website);

      if (websiteValidation) {
        setWebsiteError(websiteValidation);
        setToast({ message: websiteValidation, type: "error" });
        return;
      }

      const payload = {
        ...formData,
        website: normalizeHttpsUrl(formData.website),
      };

      await saveOrganizationProfile(payload);
      setToast({ message: "Organization profile saved successfully!", type: "success" });
      localStorage.setItem("tour:employer:mainNav:pending", "true");

      setTimeout(() => {
        navigate("/employer/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error saving organization profile:", error);
      setToast({
        message: `Failed to save organization profile: ${error.message}`,
        type: "error",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Continue local logout flow even if API call fails.
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profileData");
    navigate("/");
  };

  const getUserName = () => {
    const profileData = localStorage.getItem("profileData");

    if (!profileData) return "Employer";

    try {
      const parsed = JSON.parse(profileData);
      return parsed.fullName || parsed.basicInfo?.name || "Employer";
    } catch {
      return "Employer";
    }
  };

  const userName = getUserName();
  const websiteHintId = "employer-home-website-hint";
  const websiteErrorId = "employer-home-website-error";
  const websiteDescribedBy = websiteError
    ? `${websiteHintId} ${websiteErrorId}`
    : websiteHintId;

  return (
    <div className="employer-home">
      <a className="skip-link" href="#organization-info-form">
        Skip to organization info form
      </a>

      <header className="employer-home__header">
        <nav className="employer-home__top-nav" aria-label="Employer navigation">
          <div className="employer-home__logo" aria-label="Sudburry">
            <span className="employer-home__logo-icon" aria-hidden="true">
              S
            </span>
            <span>Sudburry</span>
          </div>

          <div className="employer-home__nav-actions">
            <button
              type="button"
              className="employer-home__profile-link"
              onClick={() => navigate("/employer/company-profile")}
            >
              Profile
            </button>

            <button
              type="button"
              className="employer-home__logout-btn"
              onClick={handleLogout}
            >
              Log Out
            </button>

            <button
              type="button"
              className="employer-home__notification-btn"
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="employer-home__post-job-btn"
              onClick={() => navigate("/employer/post-job")}
            >
              Post a Job
            </button>
          </div>
        </nav>
      </header>

      <main className="employer-home__main" id="main-content">
        <aside className="employer-home__left-panel" aria-label="User overview">
          <section className="employer-home__user-card">
            <div className="employer-home__background-mark" aria-hidden="true">
              e
            </div>

            <div className="employer-home__profile-picture" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </div>

            <p className="employer-home__welcome-text">Welcome</p>
            <h1 className="employer-home__user-name">{userName}</h1>
          </section>
        </aside>

        <section className="employer-home__right-panel" aria-labelledby="organization-info-title">
          <form
            id="organization-info-form"
            className="employer-home__form-card"
            onSubmit={(event) => {
              event.preventDefault();
              handleSaveAndNext();
            }}
            noValidate
          >
            <h2 id="organization-info-title" className="employer-home__form-title">
              Organization Info
            </h2>

            <div className="employer-home__form-group">
              <label className="employer-home__label" htmlFor="organization-name">
                Organization name
              </label>
              <input
                id="organization-name"
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                placeholder="Organization name"
                className="employer-home__input"
                autoComplete="organization"
              />
            </div>

            <div className="employer-home__form-group">
              <label className="employer-home__label" htmlFor="about-organization">
                About organization
              </label>
              <textarea
                id="about-organization"
                name="aboutOrganization"
                value={formData.aboutOrganization}
                onChange={handleInputChange}
                placeholder="Enter description about company"
                className="employer-home__textarea"
              />
            </div>

            <div className="employer-home__form-group">
              <label className="employer-home__label" htmlFor="organization-location">
                Location
              </label>
              <input
                id="organization-location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="employer-home__input"
                autoComplete="address-level2"
              />
            </div>

            <div className="employer-home__form-group">
              <label className="employer-home__label" htmlFor="organization-founded-year">
                Founded year
              </label>
              <YearPicker
                id="organization-founded-year"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={(year) =>
                  setFormData((prev) => ({
                    ...prev,
                    foundedYear: year,
                  }))
                }
              />
            </div>

            <div className="employer-home__form-group">
              <label className="employer-home__label" htmlFor="organization-website">
                Website <span aria-hidden="true">*</span>
              </label>
              <p id={websiteHintId} className="employer-home__field-hint">
                Enter a secure website URL starting with https://
              </p>
              <input
                id="organization-website"
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                onBlur={handleWebsiteBlur}
                placeholder="https://example.com"
                className="employer-home__input"
                required
                pattern="https://.*"
                title="Website must start with https://"
                autoComplete="url"
                aria-required="true"
                aria-invalid={websiteError ? "true" : undefined}
                aria-describedby={websiteDescribedBy}
              />
              {websiteError && (
                <p id={websiteErrorId} className="employer-home__field-error" role="alert">
                  {websiteError}
                </p>
              )}
            </div>

            <fieldset className="employer-home__form-group employer-home__fieldset">
              <legend className="employer-home__legend">Company size</legend>
              <div className="employer-home__radio-group">
                {["1-10", "10-100", "100-1000", "1000-10000"].map((size) => {
                  const sizeId = `company-size-${size.replace(/[^0-9]/g, "-")}`;

                  return (
                    <div key={size} className="employer-home__radio-option">
                      <input
                        id={sizeId}
                        type="radio"
                        name="companySize"
                        value={size}
                        checked={formData.companySize === size}
                        onChange={() => handleCompanySizeChange(size)}
                        className="employer-home__radio-input"
                      />
                      <label className="employer-home__radio-label" htmlFor={sizeId}>
                        {size}
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <div className="employer-home__form-group">
              <label className="employer-home__label" htmlFor="organization-industry">
                Industry
              </label>
              <div className="employer-home__select-wrapper">
                <select
                  id="organization-industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="employer-home__select"
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
                <span className="employer-home__select-arrow" aria-hidden="true">
                  v
                </span>
              </div>
            </div>

            <div className="employer-home__actions">
              <button type="button" className="employer-home__cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="employer-home__save-btn">
                Save and Next
              </button>
            </div>
          </form>
        </section>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
