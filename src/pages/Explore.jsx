import { useState } from "react";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";
import { useNavigate } from "react-router-dom";

const exploreCards = [
  {
    id: 1,
    title: "Attractions & Landmarks",
    description: "Science North, Dynamic Earth, Big Nickel, and iconic Sudbury landmarks",
    icon: "🎯",
    color: "#3b82f6",
    details: {
      services: [
        "Science North - Interactive science centre with IMAX theatre, planetarium, geology exhibits, live animals, hands-on activities, Northern Ontario's premier science museum",
        "Dynamic Earth - Mining museum at Big Nickel site, underground mine tours, geology exhibits, rock collection, interactive displays, mining history",
        "The Big Nickel - World's largest coin (9 meters tall), iconic Sudbury landmark, photo opportunities, gift shop, located at Dynamic Earth",
        "Bell Park & Ramsey Lake - Premier waterfront park with beaches, amphitheatre, gardens, walking trails, swimming, concert venue, scenic views",
        "Inco Superstack - Former world's tallest smokestack (380m), visible landmark, symbol of Sudbury's mining heritage, currently being decommissioned",
        "Art Gallery of Sudbury - Permanent collections, rotating exhibitions, educational programs, currently at temporary downtown location, new Cultural Hub coming 2026",
        "Northern Ontario Railroad Museum & Heritage Centre - Railway history, historic trains, artifacts, heritage building, seasonal tours"
      ],
      contact: "Science North: (705) 522-3701 | Dynamic Earth: (705) 522-3701 | Art Gallery: (705) 675-4871 | Bell Park: (705) 674-4455",
      hours: "Science North: Daily 10AM-5PM (extended summer) | Dynamic Earth: Seasonal hours | Art Gallery: Tuesday-Sunday 11AM-5PM | Bell Park: Dawn to dusk",
      locations: "Science North: 100 Ramsey Lake Road | Dynamic Earth: 122 Big Nickel Mine Road | Bell Park: Ramsey Lake Road | Art Gallery: Downtown (temporary)"
    },
  },
  {
    id: 2,
    title: "Outdoor Adventures",
    description: "330+ lakes, trails, hiking, skiing, and outdoor recreation in Greater Sudbury",
    icon: "🏔️",
    color: "#10b981",
    details: {
      services: [
        "330+ Lakes - Greater Sudbury has over 330 lakes within city limits including Ramsey Lake, Lake Wanapitei (largest), Lake Nepahwin, perfect for fishing, boating, swimming, kayaking",
        "Trans Canada Trail - Extensive trail network through Sudbury, walking, hiking, cycling, multi-use pathways connecting neighborhoods and natural areas",
        "Laurentian Conservation Area - Hiking trails, bird watching, nature education, seasonal programs, access to Lake Laurentian, scenic viewpoints",
        "Kivi Park - 480-acre park with trails, cross-country skiing, snowshoeing, mountain biking, dog park, picnic areas, year-round activities",
        "Sudbury Downs - Horse racing, entertainment venue, seasonal events, dining options, family-friendly activities",
        "Fielding Park - Community park with walking trails, playground, sports facilities, seasonal programming",
        "Onaping Falls - Scenic waterfall, hiking trails, picnic areas, natural swimming holes, photography spots, 30 minutes from downtown"
      ],
      contact: "Parks & Recreation: (705) 674-4455 ext. 4400 | Kivi Park: (705) 522-9800 | Laurentian Conservation: (705) 522-9800",
      hours: "Parks: Dawn to dusk | Kivi Park: Daily 7AM-9PM | Trails: Year-round access | Check seasonal hours for facilities",
      locations: "Multiple locations city-wide | Kivi Park: 4472 Long Lake Road | Laurentian Conservation: On Ramsey Lake Road | Trail maps: greatersudbury.ca/parks"
    },
  },
  {
    id: 3,
    title: "Arts & Culture",
    description: "Museums, galleries, theatres, festivals, and cultural events in Sudbury",
    icon: "🎭",
    color: "#8b5cf6",
    details: {
      services: [
        "Sudbury Theatre Centre - Professional theatre productions, live performances, community theatre, educational programs, season subscriptions",
        "Art Gallery of Sudbury - Contemporary and historical art, local artists, rotating exhibitions, art workshops, educational programs, temporary location until Cultural Hub opens 2026",
        "Science North IMAX Theatre - Large format films, documentaries, nature films, educational content, immersive viewing experience",
        "Sudbury Symphony Orchestra - Classical music concerts, seasonal performances, community concerts, educational outreach",
        "Northern Lights Festival Boréal - Annual music and arts festival, live performances, workshops, local and national artists, July event",
        "Cinéfest Sudbury - International film festival, screenings, filmmaker events, community engagement, September festival",
        "La Galerie du Nouvel-Ontario - Francophone art gallery, contemporary exhibitions, cultural programs, bilingual services"
      ],
      contact: "Theatre Centre: (705) 674-8381 | Art Gallery: (705) 675-4871 | Science North: (705) 522-3701 | Festival Boréal: (705) 674-5512",
      hours: "Theatres: Vary by show | Art Gallery: Tuesday-Sunday 11AM-5PM | Festivals: Seasonal | Check websites for schedules",
      locations: "Theatre Centre: 170 Shaughnessy Street | Art Gallery: Downtown (temporary) | Science North: 100 Ramsey Lake Road | Various festival locations"
    },
  },
  {
    id: 4,
    title: "Dining & Local Food",
    description: "Restaurants, cafes, farmers market, and Sudbury's food scene",
    icon: "🍽️",
    color: "#f59e0b",
    details: {
      services: [
        "Downtown Sudbury Restaurants - Diverse dining options including Italian (Respect is Burning, wood-fired pizza), Asian cuisine, Canadian comfort food, fine dining establishments",
        "The Laughing Buddha - Popular local pub with craft beer selection, comfort food, live music, casual atmosphere, downtown location",
        "Tommy's Not Here - Upscale dining with locally-sourced ingredients, extensive wine selection, fine dining experience, reservations recommended",
        "Kuppajo Espresso Bar - Local coffee roaster, café with fresh pastries, light meals, artisanal coffee, cozy atmosphere",
        "Sudbury Market Square Farmers Market - Fresh local produce, baked goods, artisanal foods, crafts, Saturdays 8AM-2PM, seasonal vendors",
        "Local Food Trucks - Seasonal food trucks offering diverse cuisines at various locations, events, festivals, follow social media for locations",
        "Breweries & Distilleries - Local craft breweries, spirits, tasting rooms, tours available, Sudbury's growing craft beverage scene"
      ],
      contact: "Tourism Sudbury: (705) 674-3146 | Farmers Market: (705) 674-4455 | Restaurant reservations: Contact individual establishments",
      hours: "Restaurants: Vary (typically 11AM-10PM) | Farmers Market: Saturdays 8AM-2PM (seasonal) | Food Trucks: Seasonal, check locations",
      locations: "Downtown Sudbury, New Sudbury Centre, South End | Farmers Market: Elgin Street | Various locations throughout city"
    },
  },
  {
    id: 5,
    title: "Shopping & Markets",
    description: "Local shops, malls, markets, and unique Sudbury shopping destinations",
    icon: "🛍️",
    color: "#ec4899",
    details: {
      services: [
        "New Sudbury Centre - Large shopping mall with major retailers, food court, services, anchor stores, parking, central location",
        "Rainbow Centre - Downtown shopping complex, local shops, services, food options, connected to downtown core",
        "Sudbury Market Square - Farmers market, local vendors, crafts, artisanal products, seasonal produce, community gathering space",
        "Local Boutiques - Unique shops downtown and in neighborhoods, handmade items, local products, one-of-a-kind finds",
        "Antique Shops - Several antique stores throughout city, vintage items, collectibles, furniture, memorabilia",
        "Outdoor Markets - Seasonal outdoor markets, craft fairs, community events, local artisans, food vendors",
        "Specialty Stores - Independent bookstores, gift shops, specialty food stores, supporting local businesses"
      ],
      contact: "New Sudbury Centre: (705) 522-3313 | Rainbow Centre: (705) 674-0311 | Market Square: (705) 674-4455",
      hours: "Malls: Monday-Friday 10AM-9PM, Saturday 9:30AM-6PM, Sunday 11AM-5PM | Markets: Seasonal hours | Boutiques: Vary",
      locations: "New Sudbury Centre: 1349 Lasalle Boulevard | Rainbow Centre: Downtown | Market Square: Elgin Street | Various neighborhoods"
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

export default function Explore() {
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
                  ← Back to Explore
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
                  <p className="service-detail-category">Sudbury Attractions</p>
                </div>
              </div>
              
              <p className="service-detail-description">{selectedCard.description}</p>

              <div className="service-detail-section">
                <h2 className="service-detail-section-title">Places to Visit</h2>
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
          <h1 className="hub-title">Explore Sudbury</h1>
          <p className="hub-subtitle">
            Discover attractions, outdoor adventures, arts & culture, dining, and shopping in Greater Sudbury.
          </p>

          {/* Explore Cards Grid */}
          <div className="hub-cards-grid">
            {exploreCards.map((card) => (
              <div
                key={card.id}
                className={`hub-card ${card.empty ? "hub-card-empty" : ""}`}
                onClick={() => !card.empty && setSelectedCard(card)}
                style={{ 
                  cursor: card.empty ? "default" : "pointer",
                  position: "relative",
                  zIndex: 1
                }}
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

