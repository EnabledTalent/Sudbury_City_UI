import { useState } from "react";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const servicesData = [
  {
    id: 1,
    title: "Local Transport",
    description: "Use local buses for faster travel. Get a monthly pass for savings. Annual fare: $1,400/yr.",
    icon: "🚌",
    distance: "0.5 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 2,
    title: "Street Food Market",
    description: "Try various dishes from local and global cuisines. All vendors certified for food safety.",
    icon: "🍴",
    distance: "1.2 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 3,
    title: "Healthcare Center",
    description: "Clinics, urgent care, hospital services. 24/7 emergency services available.",
    icon: "❤️",
    distance: "2.0 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 4,
    title: "Local Transport",
    description: "Use local buses for faster travel. Get a monthly pass for savings. Annual fare: $1,400/yr.",
    icon: "🚌",
    distance: "0.5 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 5,
    title: "Street Food Market",
    description: "Try various dishes from local and global cuisines. All vendors certified for food safety.",
    icon: "🍴",
    distance: "1.2 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 6,
    title: "Healthcare Center",
    description: "Clinics, urgent care, hospital services. 24/7 emergency services available.",
    icon: "❤️",
    distance: "2.0 km",
    status: "Open",
    isOpen: true,
  },
];

const filterOptions = ["All", "Open now", "Accessible", "Near me"];

export default function ServicesPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">Places & Services</h1>
          <p className="hub-subtitle">
            Discover local businesses and services across Sudbury.
          </p>

          {/* Search Bar */}
          <div className="services-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for services, businesses, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="services-search-input"
            />
          </div>

          {/* Filter Buttons */}
          <div className="services-filters">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                className={`services-filter-btn ${selectedFilter === filter ? "active" : ""}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Services Cards Grid */}
          <div className="services-cards-grid">
            {servicesData.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-card-icon">
                  {service.icon}
                </div>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-description">{service.description}</p>
                <div className="service-card-details">
                  <span className="service-detail">
                    📍 {service.distance}
                  </span>
                  <span className={`service-status ${service.isOpen ? "open" : "closed"}`}>
                    🕐 {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

