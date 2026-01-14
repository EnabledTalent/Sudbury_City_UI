import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const travellerHubCards = [
  {
    id: 1,
    title: "Things to Do",
    description: "Attractions, outdoor activities, and entertainment",
    icon: "📍",
  },
  {
    id: 2,
    title: "Food & Dining",
    description: "Restaurants, cafes, and local cuisine",
    icon: "🍴",
  },
  {
    id: 3,
    title: "Events During Your Stay",
    description: "What's happening while you're here",
    icon: "📅",
  },
  {
    id: 4,
    title: "Getting Around",
    description: "Transportation options and directions",
    icon: "🚗",
  },
  {
    id: 5,
    title: "Emergency & Health Services",
    description: "Hospitals, clinics, and emergency contacts",
    icon: "➕",
  },
  {
    id: 6,
    title: "",
    description: "",
    icon: "",
    empty: true,
  },
];

export default function TravellerHub() {
  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">Visiting Sudbury</h1>
          <p className="hub-subtitle">
            Explore the city, find places to eat, and plan your stay.
          </p>

        <div className="hub-cards-grid">
          {travellerHubCards.map((card) => (
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

