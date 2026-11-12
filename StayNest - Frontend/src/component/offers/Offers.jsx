import { useMemo } from "react";
import { Link } from "react-router-dom";
import "./Offers.css";
import { useGetRoomsQuery, useGetExperiencesQuery } from "../../store/apiSlice";
import { resolveImageUrl } from "../../constants/apiConstants";
import useBookingNavigate from "../../hooks/useBookingNavigate";
import { isOfferActive, getDiscountedPrice, formatOfferExpiry } from "../../utils/offers";

function toArray(value, wrapperKeys = []) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  if (value && Array.isArray(value.content)) return value.content;
  for (const key of wrapperKeys) {
    if (value && Array.isArray(value[key])) return value[key];
  }
  return [];
}

const Offers = () => {
  const { data: roomsData, isLoading: roomsLoading, isError: roomsError } = useGetRoomsQuery();
  const { data: experiencesData, isLoading: experiencesLoading, isError: experiencesError } =
    useGetExperiencesQuery();

  const rooms = useMemo(() => toArray(roomsData, ["rooms"]), [roomsData]);
  const experiences = useMemo(() => toArray(experiencesData, ["experiences"]), [experiencesData]);

  const isLoading = roomsLoading || experiencesLoading;
  const isError = roomsError || experiencesError;

  const goToBooking = useBookingNavigate();

  // Any Room or Experience the admin has attached a live offer to shows up
  // here automatically - and disappears again the moment that offer
  // expires (the backend clears it, and isOfferActive() double-checks the
  // expiry client-side too).
  const liveOffers = useMemo(() => {
    const roomOffers = rooms
      .filter(isOfferActive)
      .map((room) => ({
        id: `room-${room.id}`,
        category: "rooms",
        itemId: room.id,
        name: room.name,
        description: room.description,
        imageUrl: room.imageUrl,
        originalPrice: Number(room.price) || 0,
        discountedPrice: getDiscountedPrice(room.price, room),
        offerPercent: room.offerPercent,
        offerExpiry: room.offerExpiry,
        priceSuffix: "/ night",
        typeLabel: "Room",
      }));

    const experienceOffers = experiences
      .filter(isOfferActive)
      .map((exp) => ({
        id: `experience-${exp.id}`,
        category: "experience",
        itemId: exp.id,
        name: exp.name,
        description: exp.description,
        imageUrl: exp.imageUrl,
        originalPrice: Number(exp.price) || 0,
        discountedPrice: getDiscountedPrice(exp.price, exp),
        offerPercent: exp.offerPercent,
        offerExpiry: exp.offerExpiry,
        priceSuffix: "/ person",
        typeLabel: "Experience",
      }));

    return [...roomOffers, ...experienceOffers];
  }, [rooms, experiences]);

  function handleBook(offer) {
    goToBooking(offer.category, offer.itemId);
  }

  return (
    <div className="offers-page">
      <section className="offers-hero">
        <div className="offers-hero-overlay"></div>
        <div className="offers-hero-content">
          <span className="offers-hero-eyebrow">Offers</span>
          <h1>Exclusive Offers</h1>
          <p>
            Thoughtfully designed packages that make every stay a little more
            rewarding.
          </p>
        </div>
      </section>

      <section className="offers-intro">
        <p>
          Whether you're planning a quiet weekend or a longer holiday, our
          current offers are designed to add more value to your stay.
        </p>
      </section>

      {isLoading && <p className="offers-status">Loading offers…</p>}
{isError && <p className="offers-status">Couldn't load offers right now.</p>}

{!isLoading && !isError && liveOffers.length === 0 && (
  <div className="offers-empty">
    <span className="offers-empty-icon">✦</span>
    <h3>No Live Offers Right Now</h3>
    <p>
      We don't have any active discounts at the moment, but new seasonal
      packages and member-only rates drop regularly — check back soon.
    </p>
    <div className="offers-empty-actions">
      <Link to="/rooms-suites" className="offers-empty-btn">Browse Rooms &amp; Suites</Link>
      <Link to="/experiences" className="offers-empty-btn outline">Explore Experiences</Link>
    </div>
  </div>
)}

      <section className="offers-list">
        {liveOffers.map((offer, index) => (
          <article
            className={`offer-card ${index % 2 === 1 ? "reverse" : ""}`}
            key={offer.id}
          >
            <div className="offer-image-wrap">
              <img src={resolveImageUrl(offer.imageUrl)} alt={offer.name} className="offer-image" />
            </div>
            <div className="offer-info">
              <span className="offer-badge">Save {offer.offerPercent}%</span>
              <span className="offer-type-tag">{offer.typeLabel}</span>
              <h3>{offer.name}</h3>
              <p className="offer-description">{offer.description}</p>
              <p className="offer-price">
                <span className="offer-price-original">₹{offer.originalPrice.toLocaleString("en-IN")}</span>
                <span className="offer-price-final">
                  ₹{offer.discountedPrice.toLocaleString("en-IN")} {offer.priceSuffix}
                </span>
              </p>
              {offer.offerExpiry && (
                <p className="offer-validity">Valid till {formatOfferExpiry(offer.offerExpiry)}</p>
              )}
              <button type="button" className="offer-btn" onClick={() => handleBook(offer)}>
                Book This Offer
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="offers-cta">
        <div className="offers-cta-content">
          <h2>Want offers delivered to your inbox?</h2>
          <p>
            Subscribe to hear about new packages, seasonal rates, and member-only deals first.
          </p>
          <a href="#" className="offers-cta-btn">
            Subscribe Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default Offers;
