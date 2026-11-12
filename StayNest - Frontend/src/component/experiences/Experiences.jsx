import { useState, useMemo } from "react";
import "./Experiences.css";
import { useGetExperiencesQuery } from "../../store/apiSlice";
import { resolveImageUrl } from "../../constants/apiConstants";
import useBookingNavigate from "../../hooks/useBookingNavigate";
import { isOfferActive, getDiscountedPrice } from "../../utils/offers";

const Experiences = () => {
  const { data: experiencesData, isLoading, isError } = useGetExperiencesQuery();

  const experiences = useMemo(() => {
    if (Array.isArray(experiencesData)) return experiencesData;
    if (experiencesData?.data && Array.isArray(experiencesData.data)) return experiencesData.data;
    if (experiencesData?.content && Array.isArray(experiencesData.content)) return experiencesData.content;
    if (experiencesData?.experiences && Array.isArray(experiencesData.experiences)) return experiencesData.experiences;
    return [];
  }, [experiencesData]);

  const [activeFilter, setActiveFilter] = useState("All");
  const goToBooking = useBookingNavigate();

  const filters = useMemo(() => ["All", ...new Set(experiences.map((e) => e.status))], [experiences]);
  const filteredExperiences =
    activeFilter === "All" ? experiences : experiences.filter((exp) => exp.status === activeFilter);

  function handleBook(exp) {
    goToBooking("experience", exp.id);
  }

  return (
    <div className="experiences-page">
      <section className="experiences-hero">
        <div className="experiences-hero-overlay"></div>
        <div className="experiences-hero-content">
          <span className="experiences-hero-eyebrow">Experiences</span>
          <h1>Curated Experiences</h1>
          <p>
            Romantic escapes, family delights, bold adventures, and signature
            indulgences — each crafted to immerse you in the warmth and
            elegance that define every stay.
          </p>
        </div>
      </section>

      <section className="experiences-intro">
        <p>
          Every experience at StayNest is designed around a single idea:
          moments worth remembering. Browse our curated collection and choose
          the one that speaks to you.
        </p>
      </section>

      {experiences.length > 0 && (
        <div className="experiences-filters">
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

      {isLoading && <p className="experiences-status">Loading experiences…</p>}
      {isError && <p className="experiences-status">Couldn't load experiences right now.</p>}
      {!isLoading && !isError && experiences.length === 0 && (
        <p className="experiences-status">No experiences are listed yet — check back soon.</p>
      )}

      <section className="experiences-grid">
        {filteredExperiences.map((exp) => (
          <article className="experience-card" key={exp.id}>
            <div className="experience-image-wrap">
              <img src={resolveImageUrl(exp.imageUrl)} alt={exp.name} className="experience-image" />
              <span className="experience-tag">{exp.status}</span>
              {isOfferActive(exp) && (
                <span className="experience-offer-badge">{exp.offerPercent}% OFF</span>
              )}
            </div>
            <div className="experience-info">
              <h3>{exp.name}</h3>
              <p className="experience-description">{exp.description}</p>
              <div className="experience-footer">
                {isOfferActive(exp) ? (
                  <span className="experience-duration">
                    {exp.duration} ·{" "}
                    <span className="price-value-strike">₹{Number(exp.price).toLocaleString("en-IN")}</span>{" "}
                    ₹{getDiscountedPrice(exp.price, exp).toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="experience-duration">
                    {exp.duration} · ₹{Number(exp.price).toLocaleString("en-IN")}
                  </span>
                )}
                <button type="button" className="experience-btn" onClick={() => handleBook(exp)}>
                  Enquire Now
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="experiences-cta">
        <div className="experiences-cta-content">
          <h2>Looking for something bespoke?</h2>
          <p>
            Our experience curators can design a private itinerary tailored
            entirely to you.
          </p>
          <a href="#" className="experiences-cta-btn">
            Talk to a Curator
          </a>
        </div>
      </section>
    </div>
  );
};

export default Experiences;