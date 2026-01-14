import "../App.css";
import AiCtaFooter from "../components/AiCtaFooter";

const eventsData = [
  {
    id: 1,
    title: "Summer Music Festival",
    image: "/images/events1.png",
    description: "Join us for an amazing summer music festival featuring local and international artists.",
  },
  {
    id: 2,
    title: "Community Art Workshop",
    image: "/images/event2.png",
    description: "Express your creativity in our community art workshop. All skill levels welcome.",
  },
  {
    id: 3,
    title: "Local Food Fair",
    image: "/images/event3.png",
    description: "Taste the best of Sudbury's local cuisine at our annual food fair.",
  },
  {
    id: 4,
    title: "Sports Tournament",
    image: "/images/event4.png",
    description: "Watch exciting sports competitions and cheer for your favorite teams.",
  },
  {
    id: 5,
    title: "Cultural Festival",
    image: "/images/event5.png",
    description: "Celebrate the diverse cultures of Sudbury with music, dance, and food.",
  },
  {
    id: 6,
    title: "Winter Wonderland",
    image: "/images/event6.png",
    description: "Experience the magic of winter with ice sculptures and winter activities.",
  },
  {
    id: 7,
    title: "Tech Innovation Summit",
    image: "/images/events1.png",
    description: "Explore the latest in technology and innovation at this exciting summit.",
  },
  {
    id: 8,
    title: "Farmers Market",
    image: "/images/event2.png",
    description: "Shop for fresh, local produce and handmade goods at the farmers market.",
  },
  {
    id: 9,
    title: "Charity Run",
    image: "/images/event3.png",
    description: "Run for a cause and support local charities in this community event.",
  },
  {
    id: 10,
    title: "Book Fair",
    image: "/images/event4.png",
    description: "Discover new books and meet local authors at the annual book fair.",
  },
  {
    id: 11,
    title: "Outdoor Adventure Day",
    image: "/images/event5.png",
    description: "Enjoy hiking, biking, and outdoor activities in Sudbury's beautiful nature.",
  },
  {
    id: 12,
    title: "Craft Market",
    image: "/images/event6.png",
    description: "Browse unique handmade crafts and support local artisans.",
  },
];

export default function EventsPage() {
  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <h1 className="hub-title">Events in Sudbury</h1>
          <p className="hub-subtitle">
            Discover exciting events happening around the city.
          </p>

          {/* Events Cards Grid */}
          <div className="events-cards-grid">
            {eventsData.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-img">
                  <img src={event.image} alt={event.title} />
                </div>
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-description">{event.description}</p>
                <button className="primary">View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AiCtaFooter />
    </>
  );
}

