import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const residentHubCards = [
  {
    id: 1,
    title: "City Services & Updates",
    description: "Utilities, public services, local notices",
    icon: "📄",
  },
  {
    id: 2,
    title: "Community Events",
    description: "Festivals, markets, and neighbourhood events",
    icon: "📅",
  },
  {
    id: 3,
    title: "Local Businesses",
    description: "Shops, services, and places nearby",
    icon: "🏪",
  },
  {
    id: 4,
    title: "",
    description: "",
    icon: "",
    empty: true,
  },
];

export default function ResidentHub() {
  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">For Residents</h1>
          <p className="hub-subtitle">
            City services, local updates, and opportunities around you.
          </p>

          <div className="hub-cards-grid">
            {residentHubCards.map((card) => (
              <div
                key={card.id}
                className={`hub-card ${card.empty ? "hub-card-empty" : ""}`}
              >
                {!card.empty && (
                  <>
                    <div className="hub-card-icon">{card.icon}</div>
                    <h3 className="hub-card-title">{card.title}</h3>
                    <p className="hub-card-description">{card.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

