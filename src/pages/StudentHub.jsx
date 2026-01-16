import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const studentHubCards = [
  {
    id: 1,
    title: "Academic Resources",
    description: "Libraries, tutoring, student services",
    icon: "📊",
  },
  {
    id: 2,
    title: "Discounts & Deals",
    description: "Student-friendly offers from local businesses",
    icon: "🏷️",
  },
  {
    id: 3,
    title: "",
    description: "",
    icon: "",
    empty: true,
  },
];

export default function StudentHub() {
  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">Student Hub</h1>
          <p className="hub-subtitle">
            Opportunities, programs, and resources for students in Sudbury.
          </p>

          <div className="hub-cards-grid">
            {studentHubCards.map((card) => (
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

