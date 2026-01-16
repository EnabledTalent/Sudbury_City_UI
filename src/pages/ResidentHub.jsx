import { useState } from "react";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";
import { useNavigate } from "react-router-dom";

const residentHubCards = [
  {
    id: 1,
    title: "City Services",
    description: "Property taxes, building permits, utilities, and municipal services",
    icon: "🏛️",
    color: "#3b82f6",
    details: {
      services: [
        "Property Tax Services - Online tax payments, installment plans, property tax statements, assessment inquiries, tax rebate programs",
        "Building Permits - Application process for construction, renovations, additions, deck permits, inspections, building code information",
        "Water & Sewer Services - Utility billing, water meter readings, service connections, billing inquiries, payment arrangements",
        "Business Licensing - Business registration, license applications, zoning information, home-based business permits",
        "By-Law Services - By-law enforcement, property standards, noise complaints, parking enforcement, animal control",
        "Marriage Licenses - Application process, required documents, ceremony officiants, civil ceremonies at City Hall",
        "Dog Licensing - Annual dog licenses, renewal process, registration requirements, lost dog services"
      ],
      contact: "City Services: (705) 674-4455 | Property Tax: (705) 674-4455 ext. 4246 | Building Permits: (705) 674-4455 ext. 4300",
      hours: "City Hall: Monday-Friday 8:30AM-4:30PM | Online services: 24/7",
      locations: "Tom Davies Square: 200 Brady Street, Sudbury | Online: www.greatersudbury.ca"
    },
  },
  {
    id: 2,
    title: "Waste & Recycling",
    description: "Collection schedules, recycling guidelines, and waste disposal",
    icon: "♻️",
    color: "#10b981",
    details: {
      services: [
        "Curbside Collection - Weekly garbage and bi-weekly recycling collection for residential properties, collection calendar available online",
        "Blue Box Recycling - Paper, cardboard, plastic containers, metal cans, glass bottles, collection every two weeks",
        "Green Bin Program - Kitchen organics and yard waste collection, compostable materials, weekly collection during growing season",
        "Garbage Tags - Required for excess garbage, available at municipal facilities and retail locations",
        "Hazardous Waste Days - Seasonal collection events for batteries, paint, electronics, chemicals, oil, pesticides",
        "Landfill Sites - Three locations for non-collectible waste, construction materials, large items, fees apply",
        "Recycling Depot - Multiple drop-off locations for recyclables, e-waste, scrap metal, tires"
      ],
      contact: "Waste Management: (705) 674-4455 | Collection Issues: (705) 674-4455 ext. 4515",
      hours: "Collection: Varies by area (check online calendar) | Landfill: Monday-Saturday 8AM-5PM | Depot: Monday-Friday 8AM-4PM",
      locations: "Landfill: 1996 Kelly Lake Road | Depot Locations: Multiple sites across Greater Sudbury | Calendar: greatersudbury.ca/waste"
    },
  },
  {
    id: 3,
    title: "Parks & Recreation",
    description: "Bell Park, 330+ lakes, trails, Science North, recreation centres, and cultural facilities",
    icon: "🌳",
    color: "#8b5cf6",
    details: {
      services: [
        "Bell Park & Ramsey Lake Waterfront - Premier waterfront park with beaches, gardens, amphitheatre, playgrounds, walking trails, swimming, seasonal concerts, scenic views, 5 km of shoreline",
        "330+ Lakes Within City Limits - Greater Sudbury boasts over 330 lakes including Ramsey Lake, Lake Wanapitei (largest), Lake Nepahwin, numerous smaller lakes for fishing, boating, swimming",
        "Community Parks Network - Over 100 parks throughout Greater Sudbury with playgrounds, sports fields, trails, picnic areas, seasonal programming",
        "Trans Canada Trail & Pathway System - Extensive network of walking, hiking, cycling trails including Trans Canada Trail sections connecting neighborhoods and natural areas",
        "Recreation Centres - Multiple facilities with fitness equipment, swimming pools, ice rinks, community rooms, program registration for all ages, senior-specific programs",
        "Sports Fields & Courts - Baseball diamonds, soccer fields, football fields, tennis courts, basketball courts, pickleball, bocce courts, seasonal maintenance",
        "Dog Parks - Fenced off-leash areas with separate zones for large and small dogs, waste stations, agility equipment, multiple locations",
        "Science North & Dynamic Earth - Interactive science exhibits, IMAX theatre, planetarium, mining museum, seasonal events, family memberships available"
      ],
      contact: "Parks & Recreation: (705) 674-4455 ext. 4400 | Facility Bookings: (705) 674-4455 ext. 4405 | Science North: (705) 522-3701",
      hours: "Parks: Dawn to dusk | Recreation Centres: Typically 6AM-10PM (varies) | Science North: Daily 10AM-5PM | Check schedules: greatersudbury.ca/parks",
      locations: "Bell Park: Ramsey Lake Road | Recreation Centres: Multiple locations city-wide | Science North: 100 Ramsey Lake Road | Trail maps available online"
    },
  },
  {
    id: 4,
    title: "Public Safety",
    description: "Police services, fire department, and emergency preparedness",
    icon: "🚨",
    color: "#f59e0b",
    details: {
      services: [
        "Greater Sudbury Police Service - 24/7 emergency response, non-emergency services, crime reporting, community policing programs",
        "Greater Sudbury Fire Services - Fire prevention, emergency response, fire safety inspections, public education, smoke alarm programs",
        "Emergency Services - 911 for emergencies, non-emergency police line, fire department contact, ambulance services",
        "Neighborhood Watch - Community safety programs, crime prevention, block watch programs, community engagement",
        "Emergency Preparedness - Emergency management plans, disaster preparedness information, severe weather alerts, evacuation procedures",
        "Traffic Services - Traffic enforcement, parking enforcement, traffic safety programs, speed limit information",
        "Victim Services - Support services for victims of crime, crisis intervention, court support, referrals to community resources"
      ],
      contact: "Emergency: 911 | Police Non-Emergency: (705) 675-9171 | Fire: (705) 674-8382 | Victim Services: (705) 675-9171 ext. 2250",
      hours: "Emergency Services: 24/7 | Administrative Offices: Monday-Friday 8AM-4PM",
      locations: "Police Headquarters: 190 Brady Street | Fire Stations: Multiple locations across Greater Sudbury | All emergency services city-wide"
    },
  },
  {
    id: 5,
    title: "Community Programs & Culture",
    description: "Recreation programs, Art Gallery, senior services, Indigenous programs, and multicultural initiatives",
    icon: "👨‍👩‍👧‍👦",
    color: "#ec4899",
    details: {
      services: [
        "Recreation Programs - Swimming lessons, fitness classes, sports leagues, arts and crafts, dance classes for all ages, seasonal programs, registration online or in-person",
        "Senior Services - Senior centres downtown and New Sudbury, fitness programs, social activities, educational workshops, meal programs, transportation assistance, health screenings",
        "Youth Programs - After-school programs, summer day camps, sports leagues, leadership development, mentorship opportunities, career exploration, XELLO planning tools",
        "Art Gallery of Sudbury - Permanent collections, rotating exhibitions, educational programs, art workshops, currently at temporary downtown location (Elgin Street), new Cultural Hub at Tom Davies Square by end 2026",
        "N'Swakamok Native Friendship Centre - Indigenous community programs, culture, employment services, education support, community resources, cultural bridge services, language programs",
        "Community Centres - Neighborhood centres offering programs, meeting spaces, community kitchens, social events, multi-purpose rooms for rent",
        "Volunteer Opportunities - Community volunteer programs, board positions, event volunteers, skill-based volunteering, volunteer recognition programs",
        "Community Gardens - Plots available for residents, gardening workshops, community building, seasonal programs, waitlist available",
        "Multicultural Programs - Cultural festivals, heritage events, multicultural association programs, language exchange, immigrant settlement services"
      ],
      contact: "Recreation: (705) 674-4455 ext. 4400 | Senior Services: (705) 673-9141 | Art Gallery: (705) 675-4871 | N'Swakamok: (705) 675-1571 | Volunteer: (705) 675-1492",
      hours: "Registration: Monday-Friday 8:30AM-4:30PM | Programs: Various times | Art Gallery: Tuesday-Sunday 11AM-5PM | Senior Centres: Monday-Friday 9AM-4PM",
      locations: "Community Centres: Multiple neighborhoods | Art Gallery: Downtown (temporary) | Senior Centres: Downtown & New Sudbury | N'Swakamok: 110 Elm Street"
    },
  },
  {
    id: 6,
    title: "",
    description: "",
    icon: "",
    empty: true,
  },
];

const filterButtons = ["Near me", "Popular", "City services", "Community"];

export default function ResidentHub() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  if (selectedCard) {
    return (
      <>
        <div className="hub-page">
          <div className="hub-container">
            <div className="page-navigation">
              <div className="page-navigation-left">
                <button className="back-btn" onClick={() => setSelectedCard(null)}>
                  ← Back to Resident Hub
                </button>
              </div>
              <button className="home-btn" onClick={() => navigate("/")}>
                🏠 Home
              </button>
            </div>
            <div className="service-detail-page">
              <div className="service-detail-header">
                <div className="service-detail-icon">{selectedCard.icon}</div>
                <div>
                  <h1 className="service-detail-title">{selectedCard.title}</h1>
                  <p className="service-detail-category">Resident Resources</p>
                </div>
              </div>
              
              <p className="service-detail-description">{selectedCard.description}</p>

              <div className="service-detail-section">
                <h2 className="service-detail-section-title">Available Services</h2>
                <ul className="service-detail-list">
                  {selectedCard.details.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>

              <div className="service-detail-info-grid">
                <div className="service-detail-info-card">
                  <h3>Contact Information</h3>
                  <p>{selectedCard.details.contact}</p>
                </div>
                <div className="service-detail-info-card">
                  <h3>Hours of Operation</h3>
                  <p>{selectedCard.details.hours}</p>
                </div>
                <div className="service-detail-info-card">
                  <h3>Locations</h3>
                  <p>{selectedCard.details.locations}</p>
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
          <h1 className="hub-title">For Residents</h1>
          <p className="hub-subtitle">
            Access city services, stay updated with local news, and discover resources for residents in Sudbury.
          </p>

          {/* Filter Buttons */}
          <div className="explore-filters">
            {filterButtons.map((filter, index) => (
              <button key={index} className="explore-filter-btn">
                {filter}
              </button>
            ))}
          </div>

          {/* Resident Hub Cards Grid */}
          <div className="hub-cards-grid">
            {residentHubCards.map((card) => (
              <div
                key={card.id}
                className={`hub-card ${card.empty ? "hub-card-empty" : ""}`}
                onClick={() => !card.empty && setSelectedCard(card)}
                style={{ cursor: card.empty ? "default" : "pointer" }}
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

