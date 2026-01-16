import { useState } from "react";
import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";
import { useNavigate } from "react-router-dom";

const studentHubCards = [
  {
    id: 1,
    title: "Study Spaces & Libraries",
    description: "Laurentian Student Centre, campus libraries, and public library branches with makerspaces",
    icon: "📖",
    color: "#3b82f6",
    details: {
      services: [
        "Laurentian University Student Centre - Modern central hub opened 2019, SGA offices, events, study spaces, social gathering areas, centrally located on campus",
        "Laurentian University Library - Bilingual library with quiet study zones, group study rooms, 24/7 access during exams, computer labs, printing, research support",
        "Cambrian College Library - Applied arts and technology resources, study spaces, online databases, research assistance, specialized software access",
        "Collège Boréal Library - Francophone college library, bilingual resources, cultural collections, study support for French programs",
        "Greater Sudbury Public Library - 13 branches including main Mackenzie branch downtown, makerspaces with 3D printers and sewing machines, local history collections, bilingual services, free WiFi",
        "Student Success Centre (Laurentian) - Peer coaching in academics, wellness, career planning, resume and interview help, study skills workshops",
        "Campus Study Lounges - Dedicated lounges at Laurentian and Cambrian with comfortable seating, power outlets, quiet zones"
      ],
      contact: "Laurentian Student Centre: (705) 675-1151 | Laurentian Library: (705) 675-1151 ext. 3900 | Cambrian Library: (705) 566-8101 | Public Library: (705) 673-1155",
      hours: "Student Centre: Daily 7AM-11PM | Laurentian Library: 8AM-10PM (24/7 during exams) | Cambrian: 8AM-9PM | Public Library: Mon-Fri 9AM-8PM, Sat 10AM-5PM",
      locations: "Laurentian: 935 Ramsey Lake Road | Cambrian: 1400 Barrydowne Road | Public Library Main: 74 Mackenzie Street"
    },
  },
  {
    id: 2,
    title: "Student Housing",
    description: "On-campus residences, Boréal housing, University of Sudbury residence, and off-campus options",
    icon: "🏡",
    color: "#10b981",
    details: {
      services: [
        "Laurentian University Residence - Single and double occupancy rooms, meal plans, residence life programs, 24/7 security, close to campus facilities",
        "Cambrian College Residence - Modern dormitory-style accommodations, meal options, laundry facilities, common areas, supervised environment",
        "Collège Boréal Residence - ~137 beds on-campus, shared kitchens, common spaces, affordable Francophone student option",
        "University of Sudbury Residence - Shared and private rooms for students from any Sudbury institution, no meal plan required, open to all post-secondary students",
        "International Student Residence (83 Cedar) - Fully managed downtown residence, affordable student living, shared kitchens, secured access, WiFi, ideal for international students",
        "Student Neighborhoods - New Sudbury (near Cambrian/Boréal, shopping, transit), South End (near Laurentian/HSN, scenic, higher cost), Minnow Lake and Bell Park (balance of nature and affordability)",
        "Rental Budget Guide - Expect $1,400-$1,900 CAD/month for 1-2 bedroom near campuses or transit; lower with shared housing; off-campus housing office provides listings and roommate matching"
      ],
      contact: "Laurentian Residence: (705) 675-1151 ext. 3300 | Cambrian: (705) 566-8101 ext. 7400 | Boréal: (705) 560-6673 | University of Sudbury: (705) 673-5661",
      hours: "Residence Offices: Monday-Friday 8:30AM-4:30PM | Housing listings: 24/7 online",
      locations: "Laurentian/Cambrian/Boréal: On-campus | University of Sudbury: On-campus | International Residence: Downtown | Off-Campus: Various neighborhoods"
    },
  },
  {
    id: 3,
    title: "Student Transit & Transportation",
    description: "Greater Sudbury Transit student passes, campus routes, and transportation discounts",
    icon: "🎓",
    color: "#8b5cf6",
    details: {
      services: [
        "Greater Sudbury Transit - City-wide bus service covering all major routes, neighborhoods, and campus areas",
        "Student Monthly Pass - Reduced fare passes (approximately $50/month vs regular $70/month), available at campus offices",
        "Semester Pass Programs - Discounted semester-long passes at start of each term, U-Pass programs with unlimited rides included in student fees",
        "Student ID Discount - Show valid Laurentian, Cambrian, or Boréal student ID for reduced single-ride fares",
        "Campus Routes - Dedicated routes serving Laurentian University (Ramsey Lake area), Cambrian College (New Sudbury), and Collège Boréal with frequent service during class hours",
        "Transit Terminal - Downtown hub at 200 Brady Street with connections to all routes, student pass sales, route information",
        "Late Night Service - Extended hours on campus-serving routes during exam periods, weekend service adjustments",
        "Transit Mobile App - Real-time bus tracking, route planning, digital pass options, schedule alerts"
      ],
      contact: "Transit Information: (705) 675-3333 | Laurentian Student Services: (705) 675-1151 | Cambrian: (705) 566-8101 | Transit Terminal: (705) 675-3333",
      hours: "Student Services: Monday-Friday 8:30AM-4:30PM | Transit: Monday-Friday 5:30AM-11:30PM, Saturday-Sunday 6:30AM-10:30PM",
      locations: "Purchase at: Campus student services offices, Transit Terminal (200 Brady Street), online at greatersudbury.ca/transit"
    },
  },
  {
    id: 4,
    title: "Campus Health & Wellness",
    description: "Health Sciences North partnerships, campus health services, Public Health Sudbury, and student wellness",
    icon: "💊",
    color: "#f59e0b",
    details: {
      services: [
        "Health Sciences North (HSN) - Major teaching hospital serving Greater Sudbury, research partnerships with Laurentian, Boréal, emergency services, specialized care, accessible to all students",
        "Laurentian Campus Health Services - On-campus medical clinic, doctor appointments, nursing services, immunization clinics, UHIP information, mental health counseling",
        "Cambrian Health Centre - Student health services, wellness programs, counseling, health education workshops, accessibility services",
        "Public Health Sudbury & Districts - Immunizations, sexual and dental health programs, environmental health info, harm reduction services, free community programs",
        "Mental Health Support - Free counseling at all campuses, crisis intervention (1-800-461-2222), peer support programs, stress management workshops, Kids Help Phone resources",
        "Wellness Programs - Campus fitness classes, yoga, meditation groups, nutrition counseling, substance use support, recreational therapy",
        "Finding a Family Doctor - Health Care Connect service helps find doctors/NP accepting patients, family health teams in Sudbury, walk-in clinics for non-emergencies",
        "Community Paramedicine - Free non-urgent healthcare at home or by phone for chronic disease management, available to students and residents"
      ],
      contact: "HSN Emergency: 911 | Laurentian Health: (705) 675-1151 ext. 2100 | Cambrian: (705) 566-8101 ext. 7200 | Public Health: (705) 522-9200 | Crisis: 1-800-461-2222",
      hours: "Campus Health: Monday-Friday 9AM-4PM | Public Health: Monday-Friday 8:30AM-4:30PM | Emergency: 24/7 | Crisis: 24/7",
      locations: "HSN: 41 Ramsey Lake Road | Laurentian: Student Centre | Cambrian: Main campus | Public Health: 1300 Paris Street"
    },
  },
  {
    id: 5,
    title: "Student Life & Culture",
    description: "Clubs, sports, Bell Park, Science North, Art Gallery, and N'Swakamok Native Friendship Centre",
    icon: "🎯",
    color: "#ec4899",
    details: {
      services: [
        "Student Clubs & Organizations - Over 50 clubs at Laurentian and Cambrian including academic, cultural, recreational, special interest, international student associations, language exchange",
        "Intramural & Varsity Sports - Basketball, soccer, volleyball, hockey leagues, recreational tournaments, competitive teams in provincial/national competitions, no experience necessary",
        "Bell Park & Ramsey Lake - Waterfront park with beaches, amphitheatre, playgrounds, walking trails, swimming, outdoor events, scenic study spots, 5 minutes from Laurentian",
        "Science North - Interactive science exhibits, IMAX theatre, planetarium, geology/ecology shows, student discounts, seasonal programming, Northern Ontario's science museum",
        "Art Gallery of Sudbury - Permanent collections, changing galleries, currently at temporary downtown location, new Cultural Hub expected at Tom Davies Square by end 2026, student rates",
        "N'Swakamok Native Friendship Centre - Programs for Indigenous students: culture, employment, education, community support, cultural bridge services, academic assistance",
        "Campus Fitness & Recreation - On-campus gyms, weight rooms, cardio equipment, fitness classes, personal training, outdoor recreation (hiking, skiing, rock climbing, canoeing)",
        "Volunteer & Leadership - Community service projects, peer mentoring, leadership development, SERF educational grants, career planning tools like XELLO"
      ],
      contact: "Laurentian Student Union: (705) 675-1151 ext. 2000 | Cambrian: (705) 566-8101 ext. 7300 | Science North: (705) 522-3701 | Art Gallery: (705) 675-4871 | N'Swakamok: (705) 675-1571",
      hours: "Student Unions: Monday-Friday 9AM-5PM | Gyms: 6AM-11PM daily | Science North: Daily 10AM-5PM | Art Gallery: Tuesday-Sunday 11AM-5PM",
      locations: "Bell Park: Ramsey Lake Road | Science North: 100 Ramsey Lake Road | Art Gallery: Downtown (temporary) | N'Swakamok: 110 Elm Street | Campus facilities on-campus"
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

const filterButtons = ["On-campus", "Off-campus", "Student discounts", "Near my school"];

export default function StudentHub() {
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
                  ← Back to Student Hub
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
                  <p className="service-detail-category">Student Resources</p>
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
          <h1 className="hub-title">Student Hub</h1>
          <p className="hub-subtitle">
            Everything you need as a student in Sudbury — from housing and transportation to academic support and student life.
          </p>

          {/* Filter Buttons */}
          <div className="explore-filters">
            {filterButtons.map((filter, index) => (
              <button key={index} className="explore-filter-btn">
                {filter}
              </button>
            ))}
          </div>

          {/* Student Hub Cards Grid */}
          <div className="hub-cards-grid">
            {studentHubCards.map((card) => (
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

