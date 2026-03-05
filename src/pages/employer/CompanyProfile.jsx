import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import {
  fetchOrganizationProfile,
  updateOrganizationProfile,
} from "../../services/employerService";
import EmployerHeader from "../../components/employer/EmployerHeader";
import Toast from "../../components/Toast";
import YearPicker from "../../components/YearPicker";
import "./CompanyProfile.css";

const DEFAULT_FORM_DATA = {
  organizationName: "",
  aboutOrganization: "",
  location: "",
  foundedYear: "",
  website: "",
  companySize: "10-100",
  industry: "Information Technology",
};

const toCompanyData = (profile) => {
  const orgName = profile?.organizationName || "";
  return {
    name: orgName,
    subtitle: profile?.industry ? `${profile.industry} company` : "Software development company",
    logo: orgName ? orgName.charAt(0).toUpperCase() : "O",
    location: profile?.location || "",
    foundedYear: profile?.foundedYear ? String(profile.foundedYear) : "N/A",
    industry: profile?.industry || "",
    employees: profile?.companySize || "",
    website: profile?.website || "",
    about: profile?.aboutOrganization || "",
  };
};

const toFormData = (profile) => ({
  organizationName: profile?.organizationName || "",
  aboutOrganization: profile?.aboutOrganization || "",
  location: profile?.location || "",
  foundedYear: profile?.foundedYear ? String(profile.foundedYear) : "",
  website: profile?.website || "",
  companySize: profile?.companySize || "10-100",
  industry: profile?.industry || "Information Technology",
});

const toExternalWebsiteHref = (website) => {
  const value = String(website || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) return "";
  return `https://${value}`;
};

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [websiteError, setWebsiteError] = useState("");
  const [companyData, setCompanyData] = useState(toCompanyData(null));
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [rawProfile, setRawProfile] = useState(null);

  const websiteHintId = "company-profile-website-hint";
  const websiteErrorId = "company-profile-website-error";
  const websiteDescribedBy = websiteError
    ? `${websiteHintId} ${websiteErrorId}`
    : websiteHintId;
  const profileWebsiteHref = useMemo(
    () => toExternalWebsiteHref(companyData.website),
    [companyData.website]
  );

  const loadOrganizationProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await fetchOrganizationProfile();

      if (!profile) {
        setError("Organization profile not found.");
        return;
      }

      setRawProfile(profile);
      setCompanyData(toCompanyData(profile));
      setFormData(toFormData(profile));
    } catch (err) {
      console.error("Error fetching organization profile:", err);
      setError(err?.message || "Failed to load organization profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizationProfile();
  }, []);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

  const handleEdit = () => {
    if (!formData.organizationName && companyData.name) {
      setFormData((prev) => ({ ...prev, organizationName: companyData.name }));
    }
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setWebsiteError("");
    if (rawProfile) {
      setFormData(toFormData(rawProfile));
    }
  };

  const handleSave = async () => {
    try {
      const websiteValidation = validateWebsite(formData.website);
      if (websiteValidation) {
        setWebsiteError(websiteValidation);
        setToast({ message: websiteValidation, type: "error" });
        return;
      }

      setSaving(true);
      await updateOrganizationProfile({
        ...formData,
        website: normalizeHttpsUrl(formData.website),
      });

      setToast({ message: "Organization profile updated successfully!", type: "success" });
      await loadOrganizationProfile();
      setIsEditMode(false);
    } catch (saveError) {
      console.error("Error updating organization profile:", saveError);
      setToast({
        message: `Failed to update organization profile: ${saveError.message}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="company-profile">
      <a className="skip-link" href={isEditMode ? "#company-profile-edit-form" : "#company-profile-main"}>
        Skip to company profile content
      </a>

      <EmployerHeader activePage="companyProfile" />

      <main className="company-profile__main">
        {loading ? (
          <section className="company-profile__state company-profile__state--loading" role="status" aria-live="polite">
            Loading organization profile...
          </section>
        ) : error ? (
          <section className="company-profile__state company-profile__state--error" role="alert">
            <p>{error}</p>
            <button type="button" className="company-profile__retry-btn" onClick={loadOrganizationProfile}>
              Retry
            </button>
          </section>
        ) : (
          <>
            <section className="company-profile__banner" aria-labelledby="company-profile-title">
              <div className="company-profile__logo-container">
                <div className="company-profile__company-logo" aria-hidden="true">
                  {companyData.logo}
                </div>
              </div>

              <div className="company-profile__company-info">
                <h1 id="company-profile-title" className="company-profile__company-name">
                  {companyData.name || "Organization Name"}
                </h1>
                <p className="company-profile__company-subtitle">{companyData.subtitle}</p>
              </div>

              {!isEditMode && (
                <button type="button" className="company-profile__edit-btn" onClick={handleEdit} aria-label="Edit organization info">
                  <Pencil size={18} strokeWidth={2.5} aria-hidden="true" />
                </button>
              )}
            </section>

            {isEditMode ? (
              <section className="company-profile__edit-section" aria-labelledby="edit-organization-info-title">
                <form
                  id="company-profile-edit-form"
                  className="company-profile__form-card"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSave();
                  }}
                  noValidate
                >
                  <h2 id="edit-organization-info-title" className="company-profile__form-title">
                    Edit Organization Info
                  </h2>

                  <div className="company-profile__form-group">
                    <label className="company-profile__label" htmlFor="cp-organization-name">
                      Organization name
                    </label>
                    <input
                      id="cp-organization-name"
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className="company-profile__input"
                      autoComplete="organization"
                    />
                  </div>

                  <div className="company-profile__form-group">
                    <label className="company-profile__label" htmlFor="cp-about-organization">
                      About organization
                    </label>
                    <textarea
                      id="cp-about-organization"
                      name="aboutOrganization"
                      value={formData.aboutOrganization}
                      onChange={handleInputChange}
                      className="company-profile__textarea"
                    />
                  </div>

                  <div className="company-profile__form-group">
                    <label className="company-profile__label" htmlFor="cp-location">
                      Location
                    </label>
                    <input
                      id="cp-location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="company-profile__input"
                    />
                  </div>

                  <div className="company-profile__form-group">
                    <label className="company-profile__label" htmlFor="cp-founded-year">
                      Founded year
                    </label>
                    <YearPicker
                      id="cp-founded-year"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={(year) => setFormData((prev) => ({ ...prev, foundedYear: year }))}
                    />
                  </div>

                  <div className="company-profile__form-group">
                    <label className="company-profile__label" htmlFor="cp-website">
                      Website <span aria-hidden="true">*</span>
                    </label>
                    <p id={websiteHintId} className="company-profile__field-hint">
                      Enter a secure website URL starting with https://
                    </p>
                    <input
                      id="cp-website"
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      onBlur={handleWebsiteBlur}
                      placeholder="https://example.com"
                      className="company-profile__input"
                      required
                      pattern="https://.*"
                      title="Website must start with https://"
                      autoComplete="url"
                      aria-required="true"
                      aria-invalid={websiteError ? "true" : undefined}
                      aria-describedby={websiteDescribedBy}
                    />
                    {websiteError && (
                      <p id={websiteErrorId} className="company-profile__field-error" role="alert">
                        {websiteError}
                      </p>
                    )}
                  </div>

                  <fieldset className="company-profile__form-group company-profile__fieldset">
                    <legend className="company-profile__legend">Company size</legend>
                    <div className="company-profile__radio-group">
                      {["1-10", "10-100", "100-1000", "1000-10000"].map((size) => {
                        const sizeId = `cp-company-size-${size.replace(/[^0-9]/g, "-")}`;
                        return (
                          <div key={size} className="company-profile__radio-option">
                            <input
                              id={sizeId}
                              type="radio"
                              name="companySize"
                              value={size}
                              checked={formData.companySize === size}
                              onChange={() => handleCompanySizeChange(size)}
                              className="company-profile__radio-input"
                            />
                            <label className="company-profile__radio-label" htmlFor={sizeId}>
                              {size}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="company-profile__form-group">
                    <label className="company-profile__label" htmlFor="cp-industry">
                      Industry
                    </label>
                    <div className="company-profile__select-wrapper">
                      <select
                        id="cp-industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="company-profile__select"
                      >
                        <option value="Information Technology">Information Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Other">Other</option>
                      </select>
                      <span className="company-profile__select-arrow" aria-hidden="true">
                        v
                      </span>
                    </div>
                  </div>

                  <div className="company-profile__actions">
                    <button type="button" className="company-profile__cancel-btn" onClick={handleCancel} disabled={saving}>
                      Cancel
                    </button>
                    <button type="submit" className="company-profile__save-btn" disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </section>
            ) : (
              <section id="company-profile-main" className="company-profile__content-grid" aria-label="Company details">
                <article className="company-profile__about-card">
                  <h2 className="company-profile__section-title">About</h2>
                  <p className="company-profile__about-text">{companyData.about || "No description available."}</p>
                </article>

                <aside className="company-profile__details-sidebar" aria-label="Company summary">
                  <dl className="company-profile__details-list">
                    <div className="company-profile__detail-card">
                      <dt className="company-profile__detail-label">Location</dt>
                      <dd className="company-profile__detail-value">{companyData.location || "N/A"}</dd>
                    </div>
                    <div className="company-profile__detail-card">
                      <dt className="company-profile__detail-label">Founded in</dt>
                      <dd className="company-profile__detail-value">{companyData.foundedYear || "N/A"}</dd>
                    </div>
                    <div className="company-profile__detail-card">
                      <dt className="company-profile__detail-label">Industry</dt>
                      <dd className="company-profile__detail-value">{companyData.industry || "N/A"}</dd>
                    </div>
                    <div className="company-profile__detail-card">
                      <dt className="company-profile__detail-label">Employees</dt>
                      <dd className="company-profile__detail-value">{companyData.employees || "N/A"}</dd>
                    </div>
                  </dl>

                  {profileWebsiteHref && (
                    <a
                      className="company-profile__website-link"
                      href={profileWebsiteHref}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span className="company-profile__website-text">{companyData.website}</span>
                      <span className="company-profile__website-arrow" aria-hidden="true">
                        v
                      </span>
                    </a>
                  )}
                </aside>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="company-profile__footer">
        <p>
          Copyright {new Date().getFullYear()} {companyData.name || "Organization"}. Personal,
          non-commercial use only.
        </p>
      </footer>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
