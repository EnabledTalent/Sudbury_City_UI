import { useNavigate } from "react-router-dom";

const services = [
  {
    title: "Healthcare Services",
    icon: "🏥",
    desc: "Health Sciences North (HSN) - Major teaching hospital with 24/7 emergency services. Multiple walk-in clinics, family health teams, and specialized care units throughout Greater Sudbury.",
    contact: "(705) 523-7100",
    emergency: "911"
  },
  {
    title: "Public Transportation",
    icon: "🚌",
    desc: "Greater Sudbury Transit - City-wide bus service with routes covering all major areas. Student and senior discounts available. Real-time tracking and route planning.",
    contact: "(705) 675-3333",
    location: "200 Brady Street"
  },
  {
    title: "Waste & Recycling",
    icon: "♻️",
    desc: "Weekly garbage and bi-weekly recycling collection. Green bin program for organics. Three landfill sites. Hazardous waste collection events. Collection schedules available online.",
    contact: "(705) 674-4455",
    location: "1996 Kelly Lake Road"
  },
  {
    title: "Parks & Recreation",
    icon: "🌳",
    desc: "Bell Park & Ramsey Lake waterfront, 330+ lakes, Trans Canada Trail, recreation centres, sports facilities. Over 100 parks with playgrounds, trails, and picnic areas.",
    contact: "(705) 674-4455",
    location: "Multiple locations"
  },
  {
    title: "City Services",
    icon: "🏛️",
    desc: "Property taxes, building permits, water & sewer services, business licensing, by-law services, marriage licenses. Online services available 24/7.",
    contact: "(705) 674-4455",
    location: "200 Brady Street"
  },
  {
    title: "Public Safety",
    icon: "🚨",
    desc: "Greater Sudbury Police Service (24/7 emergency response), Fire Services, emergency preparedness programs, victim services, community safety initiatives.",
    contact: "(705) 675-9171",
    emergency: "911"
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <section id="services" className="section gray">
      <div className="section-header">
        <h2>Local Places & Services</h2>
        <button className="view-all" onClick={() => navigate("/services")}>
          View all <span>→</span>
        </button>
      </div>
      <div className="services-home-grid">
        {services.map((s, i) => (
          <div 
            className="service-home-card" 
            key={i} 
            onClick={() => navigate("/services")}
          >
            <div className="service-home-icon">{s.icon}</div>
            <h3 className="service-home-title">{s.title}</h3>
            <p className="service-home-desc">{s.desc}</p>
            <div className="service-home-footer">
              {s.emergency && (
                <div className="service-home-contact-item">
                  <span className="service-home-label">Emergency:</span>
                  <span className="service-home-value emergency">{s.emergency}</span>
                </div>
              )}
              <div className="service-home-contact-item">
                <span className="service-home-label">Phone:</span>
                <span className="service-home-value">{s.contact}</span>
              </div>
              {s.location && (
                <div className="service-home-contact-item">
                  <span className="service-home-label">Location:</span>
                  <span className="service-home-value">{s.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
