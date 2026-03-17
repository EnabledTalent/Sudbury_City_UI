import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { logoutUser } from "../services/authService";
import {
  fetchServiceProviderProfile,
  createServiceProviderProfile,
  updateServiceProviderProfile,
  deleteServiceProviderProfile,
} from "../services/serviceProviderService";
import Toast from "../components/Toast";
import "./ServiceProviderProfile.css";

const PROVIDER_TYPES = [
  "Education Institute",
  "Restaurant",
  "Non-profit",
  "Community Center",
  "Healthcare Provider",
  "Retail",
  "Other",
];

const DEFAULT_FORM = {
  providerType: "",
  organizationName: "",
  description: "",
  programsAndServices: "",
  contactPreferences: "",
  impactReportingPreferences: "",
  address: "",
  website: "",
  phone: "",
  contactEmail: "",
};

const toFormData = (profile) => ({
  providerType: profile?.providerType || profile?.provider_type || "",
  organizationName: profile?.organizationName || profile?.organization_name || "",
  description: profile?.description || "",
  programsAndServices: profile?.programsAndServices || profile?.programs_and_services || "",
  contactPreferences: profile?.contactPreferences || profile?.contact_preferences || "",
  impactReportingPreferences: profile?.impactReportingPreferences || profile?.impact_reporting_preferences || "",
  address: profile?.address || "",
  website: profile?.website || "",
  phone: profile?.phone || "",
  contactEmail: profile?.contactEmail || profile?.contact_email || "",
});

export default function ServiceProviderProfile() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [toast, setToast] = useState({ message: "", type: "error" });
  const [viewMode, setViewMode] = useState("list"); // "list" | "form"
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceProviderProfile();
      setProfiles(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setToast({ message: err.message || "Failed to load profiles", type: "error" });
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Continue local logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const handleAddNew = () => {
    setFormData(DEFAULT_FORM);
    setEditingProfileId(null);
    setFormMode("create");
    setViewMode("form");
  };

  const handleEdit = (profile) => {
    setFormData(toFormData(profile));
    setEditingProfileId(profile?.id ?? profile?.profileId ?? null);
    setFormMode("edit");
    setViewMode("form");
  };

  const handleCancelForm = () => {
    setViewMode("list");
    setFormData(DEFAULT_FORM);
    setEditingProfileId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (formMode === "create") {
        await createServiceProviderProfile(formData);
        setToast({
          message: "Saved successfully! View all your listed services below.",
          type: "success",
        });
      } else {
        await updateServiceProviderProfile(formData, editingProfileId);
        setToast({
          message: "Updated successfully! View all your listed services below.",
          type: "success",
        });
      }
      await loadProfiles();
      setViewMode("list");
      setFormData(DEFAULT_FORM);
      setEditingProfileId(null);
    } catch (err) {
      setToast({ message: err.message || "Failed to save", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (profile) => {
    setConfirmDelete(profile);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const profileId = confirmDelete?.id ?? confirmDelete?.profileId;
    if (!profileId) {
      setToast({ message: "Cannot delete: missing profile ID", type: "error" });
      return;
    }
    setDeleting(true);
    try {
      await deleteServiceProviderProfile(profileId);
      setToast({ message: "Deleted successfully", type: "success" });
      setConfirmDelete(null);
      await loadProfiles();
    } catch (err) {
      setToast({ message: err.message || "Failed to delete", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
  };

  const getUserName = () => {
    try {
      const profileData = localStorage.getItem("profileData");
      if (profileData) {
        const parsed = JSON.parse(profileData);
        return parsed.fullName || parsed.basicInfo?.name || "Service Provider";
      }
      return localStorage.getItem("userEmail") || "Service Provider";
    } catch {
      return "Service Provider";
    }
  };

  const renderProfileCard = (profile, index) => {
    const orgName = profile?.organizationName || profile?.organization_name || "Untitled";
    const providerType = profile?.providerType || profile?.provider_type || "";
    const desc = profile?.description || "";

    return (
      <article
        key={profile?.id ?? index}
        className="service-provider-profile__card"
      >
        <div className="service-provider-profile__card-body">
          <h3 className="service-provider-profile__card-title">{orgName}</h3>
          {providerType && (
            <span className="service-provider-profile__card-type">{providerType}</span>
          )}
          {desc && (
            <p className="service-provider-profile__card-desc">
              {desc.length > 120 ? `${desc.slice(0, 120)}...` : desc}
            </p>
          )}
        </div>
        <div className="service-provider-profile__card-actions">
          <button
            type="button"
            className="service-provider-profile__btn service-provider-profile__btn--edit"
            onClick={() => handleEdit(profile)}
            aria-label="Edit service"
          >
            <Pencil size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="service-provider-profile__btn service-provider-profile__btn--delete"
            onClick={() => handleDeleteClick(profile)}
            disabled={deleting}
            aria-label="Delete service"
          >
            <Trash2 size={18} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </article>
    );
  };

  const renderForm = () => (
    <form
      id="service-provider-form"
      className="service-provider-profile__form"
      onSubmit={handleSave}
      noValidate
    >
      <div className="service-provider-profile__form-header">
        <h2 className="service-provider-profile__form-title">
          {formMode === "create" ? "Add Service Provider Profile" : "Edit Profile"}
        </h2>
        <button
          type="button"
          className="service-provider-profile__back-btn"
          onClick={handleCancelForm}
        >
          ← View all services
        </button>
      </div>
      <p className="service-provider-profile__form-hint">
        All fields are optional. Add as much detail as you like.
      </p>

      <div className="service-provider-profile__form-group">
        <label htmlFor="provider-type">Provider type</label>
        <select
          id="provider-type"
          name="providerType"
          value={formData.providerType}
          onChange={handleChange}
          className="service-provider-profile__select"
        >
          <option value="">Select type (e.g. Education Institute, Restaurant)</option>
          {PROVIDER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="service-provider-profile__form-group">
        <label htmlFor="organization-name">Organization / Business name</label>
        <input
          id="organization-name"
          type="text"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          placeholder="e.g. Sudbury Community Kitchen"
          className="service-provider-profile__input"
        />
      </div>

      <div className="service-provider-profile__form-group">
        <label htmlFor="description">About your organization</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief description of what you do"
          className="service-provider-profile__textarea"
          rows={3}
        />
      </div>

      <div className="service-provider-profile__form-group">
        <label htmlFor="programs-and-services">Manage your programs</label>
        <p className="service-provider-profile__field-desc">
          List your courses, workshops, and support services for the whole community to see.
        </p>
        <textarea
          id="programs-and-services"
          name="programsAndServices"
          value={formData.programsAndServices}
          onChange={handleChange}
          placeholder="e.g. Free cooking workshops, job readiness training, mentorship programs"
          className="service-provider-profile__textarea"
          rows={4}
        />
      </div>

      <div className="service-provider-profile__form-group">
        <label htmlFor="contact-preferences">Connect with people</label>
        <p className="service-provider-profile__field-desc">
          How would you like to receive messages from people and companies who need your help?
        </p>
        <textarea
          id="contact-preferences"
          name="contactPreferences"
          value={formData.contactPreferences}
          onChange={handleChange}
          placeholder="e.g. Prefer email for initial contact, happy to schedule calls"
          className="service-provider-profile__textarea"
          rows={3}
        />
      </div>

      <div className="service-provider-profile__form-group">
        <label htmlFor="impact-reporting">See your impact</label>
        <p className="service-provider-profile__field-desc">
          What reports or metrics would help you track how your programs are helping people succeed?
        </p>
        <textarea
          id="impact-reporting"
          name="impactReportingPreferences"
          value={formData.impactReportingPreferences}
          onChange={handleChange}
          placeholder="e.g. Number of participants, success stories, employment outcomes"
          className="service-provider-profile__textarea"
          rows={3}
        />
      </div>

      <div className="service-provider-profile__form-row">
        <div className="service-provider-profile__form-group">
          <label htmlFor="address">Address / Location</label>
          <input
            id="address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="service-provider-profile__input"
          />
        </div>
        <div className="service-provider-profile__form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="service-provider-profile__input"
          />
        </div>
      </div>

      <div className="service-provider-profile__form-row">
        <div className="service-provider-profile__form-group">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://"
            className="service-provider-profile__input"
          />
        </div>
        <div className="service-provider-profile__form-group">
          <label htmlFor="contact-email">Contact email</label>
          <input
            id="contact-email"
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className="service-provider-profile__input"
          />
        </div>
      </div>

      <div className="service-provider-profile__actions">
        <button
          type="button"
          className="service-provider-profile__cancel-btn"
          onClick={handleCancelForm}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="service-provider-profile__save-btn"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );

  const renderListContent = () => {
    if (loading) {
      return (
        <div className="service-provider-profile__empty">
          <p>Loading your services...</p>
        </div>
      );
    }

    if (profiles.length === 0) {
      return (
        <div className="service-provider-profile__empty-state">
          <p className="service-provider-profile__empty-text">
            You haven&apos;t added any services yet.
          </p>
          <p className="service-provider-profile__empty-sub">
            Add your first service to list your courses, workshops, and support services.
          </p>
          <button
            type="button"
            className="service-provider-profile__add-btn"
            onClick={handleAddNew}
          >
            Add Service
          </button>
        </div>
      );
    }

    return (
      <div className="service-provider-profile__list-section">
        <div className="service-provider-profile__list-header">
          <h2 className="service-provider-profile__list-title">Your services</h2>
          <button
            type="button"
            className="service-provider-profile__add-btn"
            onClick={handleAddNew}
          >
            Add Service
          </button>
        </div>
        <div className="service-provider-profile__card-list">
          {profiles.map((p, i) => renderProfileCard(p, i))}
        </div>
      </div>
    );
  };

  return (
    <div className="service-provider-profile">
      <a className="skip-link" href={viewMode === "form" ? "#service-provider-form" : "#main-content"}>
        Skip to {viewMode === "form" ? "form" : "content"}
      </a>

      <header className="service-provider-profile__header">
        <div className="service-provider-profile__logo">S</div>
        <h1 className="service-provider-profile__brand">Sudbury</h1>
        <nav className="service-provider-profile__nav">
          <button
            type="button"
            className="service-provider-profile__nav-btn"
            onClick={() => {
              setViewMode("list");
              loadProfiles();
            }}
          >
            View all services
          </button>
        </nav>
        <button
          type="button"
          className="service-provider-profile__logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="service-provider-profile__main" id="main-content">
        <aside className="service-provider-profile__sidebar" aria-label="Welcome">
          <div className="service-provider-profile__avatar">
            {getUserName().charAt(0).toUpperCase()}
          </div>
          <p className="service-provider-profile__welcome">Welcome</p>
          <h2 className="service-provider-profile__name">{getUserName()}</h2>
          <p className="service-provider-profile__intro">
            Tell us about your organization so the community can discover your
            programs and connect with you.
          </p>
        </aside>

        <section className="service-provider-profile__form-section">
          {viewMode === "form" ? renderForm() : renderListContent()}
        </section>
      </main>

      {confirmDelete && (
        <div className="service-provider-profile__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="service-provider-profile__modal">
            <h3 id="delete-modal-title" className="service-provider-profile__modal-title">
              Delete service?
            </h3>
            <p className="service-provider-profile__modal-text">
              Are you sure you want to delete &quot;
              {confirmDelete?.organizationName || confirmDelete?.organization_name || "this service"}
              &quot;? This cannot be undone.
            </p>
            <div className="service-provider-profile__modal-actions">
              <button
                type="button"
                className="service-provider-profile__btn service-provider-profile__btn--cancel"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="service-provider-profile__btn service-provider-profile__btn--delete"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "error" })}
      />
    </div>
  );
}
