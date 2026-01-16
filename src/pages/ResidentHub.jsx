import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";
import { useNavigate } from "react-router-dom";
import InfoTile from "../components/InfoTile";
import { useAutoFetch } from "../hooks/useAutoFetch";

export default function ResidentHub() {
  const navigate = useNavigate();

  // Fetch real-time data from API endpoints (auto-refreshes every 2 minutes for services/events, 5 minutes for businesses)
  const services = useAutoFetch("/api/sudbury/services", 120000);
  const events = useAutoFetch("/api/sudbury/events", 120000);
  const businesses = useAutoFetch("/api/sudbury/businesses", 300000);

  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">For Residents</h1>
          <p className="hub-subtitle">
            City services, local updates, and opportunities around you.
          </p>

          <div className="hub-cards-grid">
            <InfoTile
              icon="📄"
              title="City Services & Updates"
              subtitle="Utilities, public services, local notices"
              items={services.data?.items}
              updatedAt={services.data?.updatedAt}
              onClick={() => navigate("/residents/services")}
            />

            <InfoTile
              icon="📅"
              title="Community Events"
              subtitle="Festivals, markets, and neighbourhood events"
              items={events.data?.items}
              updatedAt={events.data?.updatedAt}
              onClick={() => navigate("/residents/events")}
            />

            <InfoTile
              icon="🏪"
              title="Local Businesses"
              subtitle="Shops, services, and places nearby"
              items={businesses.data?.items}
              updatedAt={businesses.data?.updatedAt}
              onClick={() => navigate("/residents/businesses")}
            />

            <div className="hub-card hub-card-empty" />
          </div>

          {(services.error || events.error || businesses.error) && (
            <p style={{ marginTop: 12, color: "crimson", textAlign: "center" }}>
              {services.error || events.error || businesses.error}
            </p>
          )}
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

