import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const exploreCards = [
  {
    id: 1,
    title: "Events",
    description: "What's happening in Sudbury",
    icon: "📅",
    color: "#3b82f6",
  },
  {
    id: 2,
    title: "Places & Services",
    description: "Local businesses and services",
    icon: "📍",
    color: "#10b981",
  },
  {
    id: 3,
    title: "Jobs",
    description: "Employment opportunities",
    icon: "💼",
    color: "#8b5cf6",
  },
  {
    id: 4,
    title: "Training & Programs",
    description: "Education and skill development",
    icon: "📚",
    color: "#f59e0b",
  },
  {
    id: 5,
    title: "Community",
    description: "Connect with local groups",
    icon: "👥",
    color: "#ec4899",
  },
  {
    id: 6,
    title: "",
    description: "",
    icon: "",
    empty: true,
  },
];

const filterButtons = ["Today", "This weekend", "Near me", "Accessible"];

export default function Explore() {
  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">Explore Sudbury</h1>
          <p className="hub-subtitle">
            Browse everything the city has to offer.
          </p>

          {/* Filter Buttons */}
          <div className="explore-filters">
            {filterButtons.map((filter, index) => (
              <button key={index} className="explore-filter-btn">
                {filter}
              </button>
            ))}
          </div>

          {/* Explore Cards Grid */}
          <div className="hub-cards-grid">
            {exploreCards.map((card) => (
              <div
                key={card.id}
                className={`hub-card ${card.empty ? "hub-card-empty" : ""}`}
              >
                {!card.empty && (
                  <>
                    <div 
                      className="hub-card-icon"
                      style={{ backgroundColor: `${card.color}20` }}
                    >
                      {card.icon}
                    </div>
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

