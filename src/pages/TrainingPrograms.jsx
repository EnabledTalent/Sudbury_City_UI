import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const programsData = [
  {
    id: 1,
    title: "Digital Skills Bootcamp",
    institution: "Cambrian College",
    duration: "12 weeks",
    price: "FREE",
    isFree: true,
  },
  {
    id: 2,
    title: "Data Analytics Certificate",
    institution: "Laurentian University",
    duration: "8 weeks",
    price: "$500",
    isFree: false,
  },
  {
    id: 3,
    title: "Web Development Fundamentals",
    institution: "Cambrian College",
    duration: "16 weeks",
    price: "FREE",
    isFree: true,
  },
  {
    id: 4,
    title: "Digital Skills Bootcamp",
    institution: "Cambrian College",
    duration: "12 weeks",
    price: "FREE",
    isFree: true,
  },
  {
    id: 5,
    title: "Data Analytics Certificate",
    institution: "Laurentian University",
    duration: "8 weeks",
    price: "$500",
    isFree: false,
  },
  {
    id: 6,
    title: "Web Development Fundamentals",
    institution: "Cambrian College",
    duration: "16 weeks",
    price: "FREE",
    isFree: true,
  },
];

const filterOptions = ["All", "Free", "Funded", "Certification", "Short-term"];

export default function TrainingPrograms() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All");

  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <div className="page-navigation">
            <div className="page-navigation-left">
              <button className="back-btn" onClick={() => navigate("/")}>
                ← Back
              </button>
            </div>
            <button className="home-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
          </div>
          <h1 className="hub-title">Training & Programs</h1>
          <p className="hub-subtitle">
            Build skills, earn certifications, and access funded programs.
          </p>

          {/* Filter Buttons */}
          <div className="programs-filters">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                className={`programs-filter-btn ${selectedFilter === filter ? "active" : ""}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Programs Cards Grid */}
          <div className="programs-cards-grid">
            {programsData.map((program) => (
              <div key={program.id} className="program-card-page">
                <div className="program-card-icon-page">💼</div>
                <h3 className="program-card-title-page">{program.title}</h3>
                <p className="program-card-institution">{program.institution}</p>
                <div className="program-card-duration">
                  <span>⏱</span> {program.duration}
                </div>
                <div className="program-card-price">
                  {program.isFree ? (
                    <span className="program-free-badge">FREE</span>
                  ) : (
                    <span className="program-price">{program.price}</span>
                  )}
                </div>
                <button type="button" className="program-learn-more" onClick={(e) => e.preventDefault()}>Learn more</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

