import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./RoomsSuites.css";
import { useGetRoomsQuery } from "../../store/apiSlice";
import { resolveImageUrl } from "../../constants/apiConstants";
import useBookingNavigate from "../../hooks/useBookingNavigate";
import { isOfferActive, getDiscountedPrice } from "../../utils/offers";

const formatDate = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const RoomsSuites = () => {
  const { data: roomsData, isLoading, isError } = useGetRoomsQuery();


  const rooms = useMemo(() => {
    if (Array.isArray(roomsData)) return roomsData;
    if (roomsData?.data && Array.isArray(roomsData.data)) return roomsData.data;
    if (roomsData?.content && Array.isArray(roomsData.content)) return roomsData.content;
    if (roomsData?.rooms && Array.isArray(roomsData.rooms)) return roomsData.rooms;
    return [];
  }, [roomsData]);

  const [activeFilter, setActiveFilter] = useState("All");
  const goToBooking = useBookingNavigate();

  const filters = useMemo(() => ["All", ...new Set(rooms.map((r) => r.category))], [rooms]);

  const filteredRooms =
    activeFilter === "All" ? rooms : rooms.filter((room) => room.category === activeFilter);

  function handleBook(e, room) {
    e.preventDefault(); 
    e.stopPropagation();
    if (room.status !== "Available") return; 
    goToBooking("rooms", room.id);
  }

  return (
    <div className="rooms-page">
    
      <section className="rooms-hero">
        <div className="rooms-hero-overlay"></div>
        <div className="rooms-hero-content">
          <span className="rooms-hero-eyebrow">Accommodation</span>
          <h1>Rooms &amp; Suites</h1>
          <p>
            Each space is designed as a quiet retreat — where heritage
            craftsmanship meets modern comfort, and every detail is
            considered.
          </p>
        </div>
      </section>

      <section className="rooms-intro">
        <p>
          From intimate rooms to expansive suites, every stay at StayNest is
          shaped around comfort, privacy, and a sense of place. Explore our
          collection below and find the one that feels like yours.
        </p>
      </section>

      {rooms.length > 0 && (
        <div className="rooms-filters">
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

      {isLoading && <p className="rooms-status">Loading rooms…</p>}
      {isError && <p className="rooms-status">Couldn't load rooms right now. Please try again shortly.</p>}
      {!isLoading && !isError && rooms.length === 0 && (
        <p className="rooms-status">No rooms are listed yet — check back soon.</p>
      )}

      <section className="rooms-grid">
        {filteredRooms.map((room) => (
          
          <Link to={`/rooms-suites/${room.id}`} className="room-card" key={room.id}>
            <div className="room-image-wrap">
              <img src={resolveImageUrl(room.imageUrl)} alt={room.name} className="room-image" />
              <span className="room-tag">{room.category}</span>
              {isOfferActive(room) && (
                <span className="room-offer-badge">{room.offerPercent}% OFF</span>
              )}
            </div>

            <div className="room-info">
              <h3>{room.name}</h3>
              <p className="room-description">{room.description}</p>

              <ul className="room-meta">
                <li>{room.capacity} Guests</li>
                <li>{room.category}</li>
                <li>{room.status}</li>
                {room.wifi && <li>Wifi</li>}
                {room.tv && <li>TV</li>}
                {room.ac && <li>AC</li>}
              </ul>

              {room.status !== "Available" && formatDate(room.availableFrom) && (
                <p className="room-available-from">
                  Available from <strong>{formatDate(room.availableFrom)}</strong>
                </p>
              )}

              <div className="room-footer">
                <div className="room-price">
                  {isOfferActive(room) ? (
                    <>
                      <span className="price-value-strike">
                        ₹{Number(room.price).toLocaleString("en-IN")}
                      </span>
                      <span className="price-value">
                        ₹{getDiscountedPrice(room.price, room).toLocaleString("en-IN")}
                      </span>
                      <span className="price-note">+ taxes / night · {room.offerPercent}% off</span>
                    </>
                  ) : (
                    <>
                      <span className="price-value">₹{Number(room.price).toLocaleString("en-IN")}</span>
                      <span className="price-note">+ taxes / night</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  className="room-btn"
                  onClick={(e) => handleBook(e, room)}
                  disabled={room.status !== "Available"}
                  title={
                    room.status !== "Available"
                      ? `Room is currently ${room.status}${
                          room.availableFrom ? ` — available from ${room.availableFrom}` : ""
                        }`
                      : undefined
                  }
                >
                  {room.status === "Available" ? "Book" : room.status}
                </button>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="rooms-cta">
        <div className="rooms-cta-content">
          <h2>Need help choosing the right stay?</h2>
          <p>
            Our reservations team can help you find the perfect room or suite
            for your occasion.
          </p>
          <a href="#" className="rooms-cta-btn">
            Contact Reservations
          </a>
        </div>
      </section>
    </div>
  );
};

export default RoomsSuites;