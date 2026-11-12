import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { useGetRoomsQuery, useGetExperiencesQuery } from "../../store/apiSlice";
import { resolveImageUrl } from "../../constants/apiConstants";
import useBookingNavigate from "../../hooks/useBookingNavigate";
import { isOfferActive, getDiscountedPrice } from "../../utils/offers";

import image1 from "../../assets/images/image1.png";
import heroVideo2 from "../../assets/images/vidio.mp4";
import image3 from "../../assets/images/image3.jpg";
import image4 from "../../assets/images/image5.avif";
import heroVideo from "../../assets/images/vidio1.mp4";




const slides = [
  { id: 1, type: "video", video: heroVideo, title: "Staynest Resort & Spa,", subtitle: "", duration: 10000 },
  { id: 2, type: "image", image: image1, title: "Staynest Resort & Spa,", subtitle: "", duration: 5000 },
  { id: 3, type: "video", video: heroVideo2, title: "Staynest Lake Palace,", subtitle: "", duration: 10000 },
  { id: 4, type: "image", image: image3, title: "Staynest Exotica Resort & Spa,", subtitle: "", duration: 5000 },
  { id: 5, type: "image", image: image4, title: "Staynest Beach Villa,", subtitle: "", duration: 5000 },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "Every detail felt considered — from the warmth of the welcome to the quiet of the room at night.",
    author: "A. Mehta",
  },
  {
    id: 2,
    quote:
      "A genuinely restorative stay. The staff anticipated things we hadn't even asked for.",
    author: "R. Fernandes",
  },
  {
    id: 3,
    quote:
      "Beautiful property, beautiful service. We've already booked our next visit.",
    author: "S. Iyer",
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);
  const [testimonial, setTestimonial] = useState(0);

  const { data: roomsData = [] } = useGetRoomsQuery();
  const { data: experiencesData = [] } = useGetExperiencesQuery();

  const normalizeToArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.data)) return value.data;
    if (value && Array.isArray(value.content)) return value.content;
    if (value && Array.isArray(value.rooms)) return value.rooms;
    if (value && Array.isArray(value.experiences)) return value.experiences;
    return [];
  };

  const rooms = normalizeToArray(roomsData);
  const experiences = normalizeToArray(experiencesData);

  const roomPreview = rooms.slice(0, 3);
  const experiencePreview = experiences.slice(0, 3);

  const goToBooking = useBookingNavigate();

  // Any room or experience the admin has attached a live offer to shows
  // up here automatically, and drops off again the moment it expires.
  const liveOffers = useMemo(() => {
    const roomOffers = rooms.filter(isOfferActive).map((room) => ({
      id: `room-${room.id}`,
      category: "rooms",
      itemId: room.id,
      name: room.name,
      imageUrl: room.imageUrl,
      offerPercent: room.offerPercent,
      originalPrice: Number(room.price) || 0,
      discountedPrice: getDiscountedPrice(room.price, room),
    }));
    const experienceOffers = experiences.filter(isOfferActive).map((exp) => ({
      id: `experience-${exp.id}`,
      category: "experience",
      itemId: exp.id,
      name: exp.name,
      imageUrl: exp.imageUrl,
      offerPercent: exp.offerPercent,
      originalPrice: Number(exp.price) || 0,
      discountedPrice: getDiscountedPrice(exp.price, exp),
    }));
    return [...roomOffers, ...experienceOffers].slice(0, 3);
  }, [rooms, experiences]);

  useEffect(() => {
    const currentDuration = slides[current].duration ?? 5000;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, currentDuration);
    return () => clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  return (
    <div className="home">

      <section className="hero">
        {slides[current].type === "video" ? (
          <video
            src={slides[current].video}
            className="hero-image hero-video"
            key={current}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="hero-image"
            key={current}
          />
        )}

        <div className="hero-overlay" />

        <button className="arrow arrow-left" onClick={prev}>&#8249;</button>
        <button className="arrow arrow-right" onClick={next}>&#8250;</button>

        <div className="hero-text" key={"text-" + current}>
          <div className="hero-line" />
          <h1>
            {slides[current].title}
            <br />
            {slides[current].subtitle}
          </h1>
        </div>

        <div className="dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      </section>

      <section className="welcome">
        <div className="welcome-image">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80"
            alt="StayNest courtyard"
          />
        </div>
        <div className="welcome-content">
          <span className="section-eyebrow">Welcome to StayNest</span>
          <h2>A Quiet Kind of Luxury</h2>
          <p>
            Set apart from the everyday, StayNest blends heritage architecture
            with modern comfort. Every room, every meal, and every moment is
            shaped around a single idea — that travel should feel like
            coming home, only better.
          </p>
          <Link to="/rooms-suites" className="welcome-btn">
            Discover Our Rooms
          </Link>
        </div>
      </section>

      <section className="home-section rooms-preview">
        <div className="section-header">
          <span className="section-eyebrow">Accommodation</span>
          <h2>Rooms &amp; Suites</h2>
          <p>A space for every kind of stay — from intimate rooms to grand suites.</p>
        </div>

        {roomPreview.length > 0 ? (
          <div className="preview-grid">
            {roomPreview.map((room) => (
              <Link to="/rooms-suites" className="preview-card" key={room.id}>
                <div className="preview-image-wrap">
                  <img src={resolveImageUrl(room.imageUrl)} alt={room.name} />
                  {isOfferActive(room) && (
                    <span className="preview-offer-badge">{room.offerPercent}% OFF</span>
                  )}
                </div>
                <div className="preview-info">
                  <h3>{room.name}</h3>
                  {isOfferActive(room) ? (
                    <span>
                      <span className="preview-price-strike">
                        ₹{Number(room.price).toLocaleString("en-IN")}
                      </span>{" "}
                      ₹{getDiscountedPrice(room.price, room).toLocaleString("en-IN")} + taxes / night
                    </span>
                  ) : (
                    <span>₹{Number(room.price).toLocaleString("en-IN")} + taxes / night</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="preview-empty">
            <span className="preview-empty-icon">✦</span>
            <p>Rooms coming soon — we're putting the finishing touches on our accommodation listings.</p>
          </div>
        )}

        <Link to="/rooms-suites" className="section-link">
          View All Rooms &amp; Suites →
        </Link>
      </section>

      <section className="home-section experiences-preview">
        <div className="section-header">
          <span className="section-eyebrow">Experiences</span>
          <h2>Curated Experiences</h2>
          <p>Romantic escapes, family delights, and signature indulgences await.</p>
        </div>

        {experiencePreview.length > 0 ? (
          <div className="preview-grid">
            {experiencePreview.map((exp) => (
              <Link to="/experiences" className="preview-card" key={exp.id}>
                <div className="preview-image-wrap">
                  <img src={resolveImageUrl(exp.imageUrl)} alt={exp.name} />
                </div>
                <div className="preview-info">
                  <h3>{exp.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="preview-empty">
            <span className="preview-empty-icon">✦</span>
            <p>Experiences coming soon — check back shortly for curated activities.</p>
          </div>
        )}

        <Link to="/experiences" className="section-link">
          View All Experiences →
        </Link>
      </section>

      <section className="dining-band">
        <div className="dining-band-overlay" />
        <div className="dining-band-content">
          <span className="section-eyebrow light">Food &amp; Drinks</span>
          <h2>Flavours Worth the Journey</h2>
          <p>
            From candlelit fine dining to rooftop cocktails, every venue tells
            its own story.
          </p>
          <Link to="/dining" className="dining-band-btn">
            Explore Food &amp; Drinks
          </Link>
        </div>
      </section>

      <section className="home-section offers-preview">
        <div className="section-header">
          <span className="section-eyebrow">Offers</span>
          <h2>Exclusive Offers, Just for You</h2>
          <p>Seasonal packages and member-only rates, updated regularly.</p>
        </div>

        {liveOffers.length > 0 ? (
          <div className="preview-grid">
            {liveOffers.map((offer) => (
              <button
                type="button"
                className="preview-card offer-preview-card"
                key={offer.id}
                onClick={() => goToBooking(offer.category, offer.itemId)}
              >
                <div className="preview-image-wrap">
                  <img src={resolveImageUrl(offer.imageUrl)} alt={offer.name} />
                  <span className="preview-offer-badge">{offer.offerPercent}% OFF</span>
                </div>
                <div className="preview-info">
                  <h3>{offer.name}</h3>
                  <span>
                    <span className="preview-price-strike">
                      ₹{offer.originalPrice.toLocaleString("en-IN")}
                    </span>{" "}
                    ₹{offer.discountedPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="preview-empty offers-empty-block">
            <span className="preview-empty-icon">✦</span>
            <p>
              No live offers right now, but new seasonal packages and
              member-only rates drop regularly — check back soon.
            </p>
            <Link to="/rooms-suites" className="preview-empty-link">
              Browse Rooms &amp; Suites →
            </Link>
          </div>
        )}

        <Link to="/offers" className="section-link">
          See All Current Offers →
        </Link>
      </section>

      <section className="testimonials">
        <span className="section-eyebrow">Guest Stories</span>
        <p className="testimonial-quote">"{TESTIMONIALS[testimonial].quote}"</p>
        <span className="testimonial-author">— {TESTIMONIALS[testimonial].author}</span>

        <div className="testimonial-dots">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`testimonial-dot ${i === testimonial ? "active" : ""}`}
              onClick={() => setTestimonial(i)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;