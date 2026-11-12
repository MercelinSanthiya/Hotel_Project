import { useState, useMemo } from "react";
import "./Dining.css";
import { useGetDiningQuery } from "../../store/apiSlice";
import { resolveImageUrl } from "../../constants/apiConstants";
import useBookingNavigate from "../../hooks/useBookingNavigate";

const Dining = () => {
  const { data: venuesData, isLoading, isError } = useGetDiningQuery();

  
  
  const venues = useMemo(() => {
    if (Array.isArray(venuesData)) return venuesData;
    if (venuesData?.data && Array.isArray(venuesData.data)) return venuesData.data;
    if (venuesData?.content && Array.isArray(venuesData.content)) return venuesData.content;
    if (venuesData?.venues && Array.isArray(venuesData.venues)) return venuesData.venues;
    return [];
  }, [venuesData]);

  const [activeFilter, setActiveFilter] = useState("All");
  const goToBooking = useBookingNavigate();

  const filters = useMemo(() => ["All", ...new Set(venues.map((v) => v.cuisine))], [venues]);
  const filteredVenues =
    activeFilter === "All" ? venues : venues.filter((venue) => venue.cuisine === activeFilter);

  
  
  
  function handleBook(venue) {
    goToBooking("dining", venue.id);
  }

  return (
    <div className="dining-page">
      
      <section className="dining-hero">
        <div className="dining-hero-overlay"></div>
        <div className="dining-hero-content">
          <span className="dining-hero-eyebrow">Food &amp; Drinks</span>
          <h1>Restaurants &amp; Cafés</h1>
          <p>
            From candlelit fine dining to relaxed all-day cafés, every venue at
            StayNest tells its own story through flavour.
          </p>
        </div>
      </section>

      
      <section className="dining-intro">
        <p>
          Our culinary team draws on local ingredients and time-honoured
          techniques to create menus that change with the seasons. Explore
          our food &amp; drinks venues below.
        </p>
      </section>

      
      {venues.length > 0 && (
        <div className="dining-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      
      {isLoading && <p className="dining-status">Loading venues…</p>}
      {isError && <p className="dining-status">Couldn't load food &amp; drinks venues right now.</p>}
      {!isLoading && !isError && venues.length === 0 && (
        <p className="dining-status">No food &amp; drinks venues are listed yet — check back soon.</p>
      )}

      <section className="dining-grid">
        {filteredVenues.map((venue) => (
          <article className="venue-card" key={venue.id}>
            <div className="venue-image-wrap">
              <img src={resolveImageUrl(venue.imageUrl)} alt={venue.name} className="venue-image" />
              <span className="venue-tag">{venue.cuisine}</span>
            </div>
            <div className="venue-info">
              <h3>{venue.name}</h3>
              <p className="venue-description">{venue.description}</p>
              <ul className="venue-meta">
                <li>{venue.hours}</li>
                <li>{venue.seats} Seats</li>
                {venue.entranceFee > 0 && <li>₹{Number(venue.entranceFee).toLocaleString("en-IN")} entrance / guest</li>}
              </ul>
              <button type="button" className="venue-btn" onClick={() => handleBook(venue)}>
                Reserve a Table
              </button>
            </div>
          </article>
        ))}
      </section>

      
      <section className="dining-cta">
        <div className="dining-cta-content">
          <h2>Planning a special occasion?</h2>
          <p>
            Let our culinary team curate a bespoke dining experience for your
            celebration.
          </p>
          <a href="#" className="dining-cta-btn">
            Contact Our Concierge
          </a>
        </div>
      </section>
    </div>
  );
};

export default Dining;