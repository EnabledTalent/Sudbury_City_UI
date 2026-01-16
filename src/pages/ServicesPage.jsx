import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const servicesData = [
  {
    id: 1,
    title: "Healthcare Services",
    icon: "🏥",
    category: "Medical",
    description: "Medical clinics, hospitals, health centers, and emergency services. 24/7 emergency care available.",
    details: {
      services: [
        "Health Sciences North (HSN) - Main hospital with emergency department, 24/7 emergency services, specialized care units",
        "Sudbury Community Health Centre - Primary care, mental health services, addiction treatment programs",
        "Réseau ACCESS Network - HIV/AIDS services, harm reduction programs, community health support",
        "Cambrian Family Health Team - Family medicine, chronic disease management, preventative care",
        "Laurentian University Health Services - Student health services, vaccinations, mental health counseling",
        "Walk-in Clinics - Multiple locations across the city for non-emergency medical care"
      ],
      contact: "Emergency: 911 | Non-emergency: (705) 523-7100",
      hours: "Emergency: 24/7 | Clinics: Monday-Friday 9AM-5PM",
      locations: "Health Sciences North: 41 Ramsey Lake Road | Multiple walk-in clinics across Sudbury"
    },
    distance: "0.8 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 2,
    title: "Public Transportation",
    icon: "🚌",
    category: "Transport",
    description: "City buses, routes, schedules, and transit passes. Student and senior discounts available.",
    details: {
      services: [
        "Greater Sudbury Transit - City-wide bus service covering all major routes and neighborhoods",
        "Student Passes - Discounted monthly passes for students at local colleges and universities",
        "Senior Passes - Reduced fare programs for seniors (65+) with valid ID",
        "Accessible Transit - Wheelchair accessible buses and specialized transit services",
        "Route Information - Real-time bus tracking, route maps, and schedule information available online",
        "Park & Ride - Convenient parking lots near major transit hubs"
      ],
      contact: "Transit Information: (705) 675-3333 | Route planning: www.greatersudbury.ca/transit",
      hours: "Monday-Friday: 5:30AM-11:30PM | Saturday-Sunday: 6:30AM-10:30PM",
      locations: "Transit Terminal: Downtown Sudbury | Routes cover all major areas"
    },
    distance: "0.3 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 3,
    title: "Housing Resources",
    icon: "🏠",
    category: "Housing",
    description: "Rental listings, housing assistance, accommodation options, and tenant resources.",
    details: {
      services: [
        "Sudbury Housing - Affordable housing programs and rental assistance for low-income residents",
        "Greater Sudbury Housing Services - Public housing, rent-geared-to-income programs, waitlist management",
        "Rental Listings - Online database of available rental properties across the city",
        "Tenant Support Services - Legal aid, tenant rights information, dispute resolution assistance",
        "First-Time Homebuyer Programs - Financial assistance and educational resources for new homeowners",
        "Student Housing - Dedicated accommodations near post-secondary institutions"
      ],
      contact: "Housing Services: (705) 673-3433 | Emergency Housing: (705) 675-6422",
      hours: "Monday-Friday: 8:30AM-4:30PM",
      locations: "200 Brady Street, Sudbury | Online services available 24/7"
    },
    distance: "1.5 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 4,
    title: "Local Restaurants & Food",
    icon: "🍴",
    category: "Food",
    description: "Dining options, cafes, and food services across Sudbury. From fast food to fine dining.",
    details: {
      services: [
        "Downtown Restaurants - Variety of dining options including Italian, Asian, Canadian cuisine, and fine dining establishments",
        "The Laughing Buddha - Popular local pub with craft beer and comfort food",
        "Tommy's Not Here - Upscale dining with local ingredients and extensive wine selection",
        "Kuppajo Espresso Bar - Local coffee roaster and café with fresh pastries and light meals",
        "Respect is Burning - Pizza and Italian cuisine with wood-fired pizzas",
        "Local Food Trucks - Seasonal food trucks offering diverse cuisines at various locations and events",
        "Farmers Market - Fresh local produce, baked goods, and artisanal foods (Saturdays at Sudbury Market)"
      ],
      contact: "For restaurant information: Tourism Sudbury (705) 674-3146",
      hours: "Varies by establishment | Farmers Market: Saturdays 8AM-2PM",
      locations: "Downtown Sudbury, New Sudbury Centre, South End | Various locations throughout city"
    },
    distance: "0.5 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 5,
    title: "Waste Management",
    icon: "♻️",
    category: "Utilities",
    description: "Garbage collection schedules, recycling programs, and waste disposal services.",
    details: {
      services: [
        "Curbside Collection - Weekly garbage and bi-weekly recycling collection for residential properties",
        "Recycling Program - Blue box recycling for paper, plastic, metal, and glass containers",
        "Organic Waste Collection - Green bin program for kitchen and yard waste (composting)",
        "Hazardous Waste Disposal - Special collection events for electronics, batteries, paint, and chemicals",
        "Large Item Pickup - Scheduled collection for furniture and large appliances",
        "Landfill Sites - Multiple locations for drop-off of non-collectible waste and construction materials",
        "Recycling Depot - Locations for drop-off of recyclable materials"
      ],
      contact: "Waste Management: (705) 674-4455 | Schedule: www.greatersudbury.ca/waste",
      hours: "Collection: Varies by area | Landfill: Monday-Saturday 8AM-5PM",
      locations: "Collection routes cover all residential areas | Landfill: 1996 Kelly Lake Road"
    },
    distance: "2.0 km",
    status: "Open",
    isOpen: true,
  },
  {
    id: 6,
    title: "Property Services",
    icon: "💰",
    category: "Municipal",
    description: "Property tax information, assessment services, and municipal property services.",
    details: {
      services: [
        "Property Tax Payments - Online payment options, installment plans, and payment locations",
        "Tax Assessment - Property value assessments, appeal process, and assessment review information",
        "Tax Relief Programs - Senior tax relief, low-income tax assistance, and deferral programs",
        "Property Information - Online access to property records, tax history, and assessment details",
        "Building Permits - Application process for construction, renovation, and development permits",
        "Property Standards - By-law enforcement, property maintenance requirements, and complaint process",
        "Water & Sewer Services - Utility billing, payment options, and service requests"
      ],
      contact: "Tax Department: (705) 674-4455 | Assessment: (705) 674-4455 ext. 4246",
      hours: "Monday-Friday: 8:30AM-4:30PM | Online services: 24/7",
      locations: "200 Brady Street, Sudbury | Online services at www.greatersudbury.ca"
    },
    distance: "1.2 km",
    status: "Open",
    isOpen: true,
  },
];

const filterOptions = ["All", "Medical", "Transport", "Housing", "Food", "Utilities", "Municipal"];

export default function ServicesPage() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const filteredServices = servicesData.filter(service => {
    if (selectedFilter !== "All") {
      return service.category === selectedFilter;
    }
    if (searchQuery) {
      return service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             service.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (selectedService) {
    return (
      <>
        <div className="hub-page">
          <div className="hub-container">
            <div className="page-navigation">
              <div className="page-navigation-left">
                <button className="back-btn" onClick={() => setSelectedService(null)}>
                  ← Back to Services
                </button>
              </div>
              <button className="home-btn" onClick={() => navigate("/")}>
                🏠 Home
              </button>
            </div>
            <div className="service-detail-page">
              <div className="service-detail-header">
                <div className="service-detail-icon">{selectedService.icon}</div>
                <div>
                  <h1 className="service-detail-title">{selectedService.title}</h1>
                  <p className="service-detail-category">{selectedService.category} Services</p>
                </div>
              </div>
              
              <p className="service-detail-description">{selectedService.description}</p>

              <div className="service-detail-section">
                <h2 className="service-detail-section-title">Available Services</h2>
                <ul className="service-detail-list">
                  {selectedService.details.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>

              <div className="service-detail-info-grid">
                <div className="service-detail-info-card">
                  <h3>Contact Information</h3>
                  <p>{selectedService.details.contact}</p>
                </div>
                <div className="service-detail-info-card">
                  <h3>Hours of Operation</h3>
                  <p>{selectedService.details.hours}</p>
                </div>
                <div className="service-detail-info-card">
                  <h3>Locations</h3>
                  <p>{selectedService.details.locations}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AiCtaFooter />
      </>
    );
  }

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
            {filteredServices.map((service) => (
              <div 
                key={service.id} 
                className="service-card"
                onClick={() => setSelectedService(service)}
                style={{ cursor: "pointer" }}
              >
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
                <button 
                  className="service-view-details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(service);
                  }}
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>
          
          {filteredServices.length === 0 && (
            <p style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              No services found matching your criteria.
            </p>
          )}
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

