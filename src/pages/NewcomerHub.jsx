import { useState } from "react";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const checklistItems = [
  { id: 1, text: "Find housing" },
  { id: 2, text: "Access healthcare" },
  { id: 3, text: "Find a job" },
  { id: 4, text: "Language and settlement support" },
];

const serviceCards = [
  {
    id: 1,
    title: "Settlement & Support Services",
    description: "Get help settling into your new home",
    icon: "📎",
  },
  {
    id: 2,
    title: "Jobs & Training Programs",
    description: "Find employment and skill development opportunities",
    icon: "💼",
  },
  {
    id: 3,
    title: "Community & Cultural Groups",
    description: "Connect with communities and cultural organizations",
    icon: "👥",
  },
];

export default function NewcomerHub() {
  const [completedItems, setCompletedItems] = useState([]);

  const toggleItem = (id) => {
    if (completedItems.includes(id)) {
      setCompletedItems(completedItems.filter((item) => item !== id));
    } else {
      setCompletedItems([...completedItems, id]);
    }
  };

  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">Welcome to Sudbury</h1>
          <p className="hub-subtitle">
            Getting started in a new city can feel overwhelming. Start here.
          </p>

          {/* Getting Started Checklist */}
          <div className="checklist-card">
            <div className="checklist-header">
              <span className="checklist-icon">✓</span>
              <h2 className="checklist-title">Getting Started Checklist</h2>
            </div>
            <div className="checklist-items">
              {checklistItems.map((item) => (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={completedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="checklist-checkbox"
                  />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
            <div className="checklist-progress">
              {completedItems.length}/{checklistItems.length} completed
            </div>
          </div>

          {/* Service Cards */}
          <div className="newcomer-services-grid">
            {serviceCards.map((card) => (
              <div key={card.id} className="hub-card">
                <div className="hub-card-icon">{card.icon}</div>
                <h3 className="hub-card-title">{card.title}</h3>
                <p className="hub-card-description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

