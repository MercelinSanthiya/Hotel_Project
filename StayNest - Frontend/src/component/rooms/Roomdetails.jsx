import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiWifi, FiTv, FiWind, FiUsers, FiSun, FiCloud, FiMoon, FiArrowLeft } from "react-icons/fi";
import "./RoomDetails.css";
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

function extractArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  for (const key of Object.keys(value)) {
    if (Array.isArray(value[key])) return value[key];
  }

  for (const key of Object.keys(value)) {
    if (value[key] && typeof value[key] === "object") {
      const nested = extractArray(value[key]);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: roomsData, isLoading, isError, error } = useGetRoomsQuery();
  const goToBooking = useBookingNavigate();

  const rooms = useMemo(() => extractArray(roomsData), [roomsData]);

  if (import.meta.env?.DEV) {
    console.log("[RoomDetails] raw roomsData from useGetRoomsQuery():", roomsData);
    console.log("[RoomDetails] extracted rooms array:", rooms);
    if (isError) console.log("[RoomDetails] query error:", error);
  }

  const room = rooms.find((r) => String(r.id) === id);

  if (isLoading) return <p className="room-details-status">Loading room…</p>;

  if (isError) {
    return (
      <div className="room-details-status">
        <p>Couldn't load this room right now.</p>
        {import.meta.env?.DEV && (
          <pre style={{ fontSize: 12, textAlign: "left", background: "#f5f5f5", padding: 12, marginTop: 12 }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (!isLoading && rooms.length === 0) {
    return (
      <div className="room-details-status">
        <p>No room data was returned by the server.</p>
        {import.meta.env?.DEV && (
          <pre style={{ fontSize: 12, textAlign: "left", background: "#f5f5f5", padding: 12, marginTop: 12 }}>
            Raw response received from useGetRoomsQuery():{"\n"}
            {JSON.stringify(roomsData, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (!room) return <p className="room-details-status">Room not found.</p>;

  const isAvailable = room.status === "Available";
  const availableFromLabel = formatDate(room.availableFrom);

  const meals = [
    { label: "Morning", icon: <FiSun />, value: room.morningFood },
    { label: "Afternoon", icon: <FiCloud />, value: room.afternoonFood },
    { label: "Evening", icon: <FiMoon />, value: room.eveningFood },
  ];

  const amenities = [
    { label: "Wifi", icon: <FiWifi />, active: Boolean(room.wifi) },
    { label: "TV", icon: <FiTv />, active: Boolean(room.tv) },
    { label: "AC", icon: <FiWind />, active: Boolean(room.ac) },
  ];

  return (
    <div className="room-details-page">
      <div className="room-details-hero">
        <img src={resolveImageUrl(room.imageUrl)} alt={room.name} className="room-details-image" />
        <div className="room-details-hero-overlay" />
        <div className="room-details-hero-content">
          <button
            type="button"
            className="room-details-back"
            onClick={() => navigate("/rooms-suites")}
          >
            <FiArrowLeft /> Back to Rooms &amp; Suites
          </button>
          <span className="room-details-tag">{room.category}</span>
          <h1>{room.name}</h1>
        </div>
      </div>

      <div className="room-details-body">
        <div className="room-details-main">
          <p className="room-details-description">{room.description}</p>

          <div className="room-details-section">
            <h3>Occupancy</h3>
            <div className="room-details-occupancy">
              <FiUsers />
              <span>
                {room.capacity} Guests
                {room.maxPersons ? ` · Up to ${room.maxPersons} people total` : ""}
              </span>
            </div>
          </div>

          <div className="room-details-section">
            <h3>Meals Included</h3>
            <ul className="room-details-meals">
              {meals.map((meal) => (
                <li key={meal.label} className={meal.value ? "" : "meal-not-included"}>
                  <span className="meal-icon">{meal.icon}</span>
                  <div>
                    <span className="meal-label">{meal.label}</span>
                    <span className="meal-value">{meal.value || "Not included"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="room-details-section">
            <h3>Amenities</h3>
            <ul className="room-details-amenities">
              {amenities.map((a) => (
                <li key={a.label} className={a.active ? "amenity-active" : "amenity-inactive"}>
                  <span className="amenity-icon">{a.icon}</span>
                  {a.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="room-details-booking">
          {isOfferActive(room) ? (
            <>
              <span className="room-details-offer-badge">{room.offerPercent}% OFF</span>
              <span className="price-value-strike">₹{Number(room.price).toLocaleString("en-IN")}</span>
              <span className="price-value">₹{getDiscountedPrice(room.price, room).toLocaleString("en-IN")}</span>
            </>
          ) : (
            <span className="price-value">₹{Number(room.price).toLocaleString("en-IN")}</span>
          )}
          <span className="price-note">+ taxes / night</span>
          <span className={`room-details-status-pill status-${room.status?.toLowerCase()}`}>
            {room.status}
          </span>
          {!isAvailable && availableFromLabel && (
            <span className="room-details-available-from">
              Available from <strong>{availableFromLabel}</strong>
            </span>
          )}
          <button
            type="button"
            className="room-details-book-btn"
            onClick={() => goToBooking("rooms", room.id)}
            disabled={!isAvailable}
          >
            {isAvailable ? "Book This Room" : `Currently ${room.status}`}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default RoomDetails;