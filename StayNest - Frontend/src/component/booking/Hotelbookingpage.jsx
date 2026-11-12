import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Clock,
  Users,
  User,
  BedDouble,
  Utensils,
  Compass,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  BadgePercent,
} from "lucide-react";
import "./Hotelbookingpage.css";
import booking from "../../assets/images/hotelbooking2.gif";
import {
  useGetRoomsQuery,
  useGetDiningQuery,
  useGetExperiencesQuery,
  useAddBookingMutation,
} from "../../store/apiSlice";
import { selectCurrentUser } from "../../store/authSlice";
import { isOfferActive, getDiscountedPrice } from "../../utils/offers";

const CATEGORIES = [
  { key: "rooms", label: "Rooms", icon: BedDouble },
  { key: "dining", label: "Food & Drinks", icon: Utensils },
  { key: "experience", label: "Experience", icon: Compass },
];

// Rooms use check-in/check-out dates. Dining and Experience both use a
// single date plus a time (for Experience, that time is the START time -
// the end time is derived from the experience's duration, not picked
// separately). Dining also collects a guest count (used to size the
// entrance fee); Experience does not.
const FIELD_CONFIG = {
  rooms: { stayDates: true, bookingDate: false, time: false, guests: false },
  dining: { stayDates: false, bookingDate: true, time: true, guests: true },
  experience: { stayDates: false, bookingDate: true, time: true, guests: false },
};

const FORM_TEXT = {
  rooms: {
    eyebrow: "StayNest · Reservations",
    heading: "Reserve Your Stay",
    subtext: "Choose a room, set your dates, and we'll hold it pending confirmation.",
    selectLabel: "Room",
    loadingLabel: "Loading rooms…",
    emptyLabel: "No rooms available",
    selectPlaceholder: "Select a room",
    bookLabel: "Book Room",
    bookingLabel: "Booking…",
    successLabel: "Your booking is submitted and pending confirmation.",
  },
  dining: {
    eyebrow: "StayNest · Food & Drinks",
    heading: "Reserve a Table",
    subtext: "Choose a restaurant or café, set your date and time, and we'll hold your table.",
    selectLabel: "Restaurant",
    loadingLabel: "Loading restaurants…",
    emptyLabel: "No restaurants available",
    selectPlaceholder: "Select a restaurant",
    bookLabel: "Reserve Table",
    bookingLabel: "Reserving…",
    successLabel: "Your table is reserved and pending confirmation.",
  },
  experience: {
    eyebrow: "StayNest · Experiences",
    heading: "Book an Experience",
    subtext: "Pick an experience, a date, and the time you'd like to start.",
    selectLabel: "Experience",
    loadingLabel: "Loading experiences…",
    emptyLabel: "No experiences available",
    selectPlaceholder: "Select an experience",
    bookLabel: "Book Experience",
    bookingLabel: "Booking…",
    successLabel: "Your experience is booked and pending confirmation.",
  },
};

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function addDaysStr(dateStr, days) {
  if (!dateStr) return todayStr();
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function normalizePrice(value) {
  return typeof value === "number" ? value : Number(value) || 0;
}

function toArray(value, wrapperKeys = []) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  if (value && Array.isArray(value.content)) return value.content;
  for (const key of wrapperKeys) {
    if (value && Array.isArray(value[key])) return value[key];
  }
  return [];
}

// Pulls the first number out of a duration string like "3 hours" or
// "2.5 hrs" so we can compute an end time from a start time. Falls back
// to null (meaning: show the duration text as-is, no computed end time)
// if nothing numeric is found.
function parseDurationHours(durationText) {
  if (!durationText) return null;
  const match = String(durationText).match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const hours = Number(match[1]);
  return Number.isFinite(hours) && hours > 0 ? hours : null;
}

function formatTime12h(hours, minutes) {
  const h = ((hours % 24) + 24) % 24;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

// Given a "HH:MM" start time and a duration in hours, returns
// { startLabel, endLabel } as friendly 12-hour strings, or null if the
// start time or duration isn't available yet.
function computeTimeRange(startTime, durationHours) {
  if (!startTime || !durationHours) return null;
  const [hStr, mStr] = startTime.split(":");
  const startHours = Number(hStr);
  const startMinutes = Number(mStr);
  if (Number.isNaN(startHours) || Number.isNaN(startMinutes)) return null;

  const totalStartMinutes = startHours * 60 + startMinutes;
  const totalEndMinutes = totalStartMinutes + Math.round(durationHours * 60);
  const endHours = Math.floor(totalEndMinutes / 60);
  const endMinutes = totalEndMinutes % 60;

  return {
    startLabel: formatTime12h(startHours, startMinutes),
    endLabel: formatTime12h(endHours, endMinutes),
  };
}

export default function HotelBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useSelector(selectCurrentUser);

  const stateCategory =
    location.state?.category && CATEGORIES.some((c) => c.key === location.state.category)
      ? location.state.category
      : null;
  const stateItemId = location.state?.itemId != null ? String(location.state.itemId) : "";

  const [locked, setLocked] = useState(Boolean(stateCategory));

  const [activeCategory, setActiveCategory] = useState(stateCategory || "rooms");

  const { data: allRoomsData, isLoading: roomsLoading, refetch: refetchRooms } = useGetRoomsQuery();
  const { data: diningVenuesData, isLoading: diningLoading } = useGetDiningQuery();
  const { data: experiencesData, isLoading: experienceLoading } = useGetExperiencesQuery();

  const allRooms = useMemo(() => toArray(allRoomsData, ["rooms"]), [allRoomsData]);
  const diningVenues = useMemo(() => toArray(diningVenuesData, ["venues", "dining"]), [diningVenuesData]);
  const experiences = useMemo(() => toArray(experiencesData, ["experiences"]), [experiencesData]);

  const rooms = useMemo(
    () => allRooms.filter((r) => (r.status || "").toLowerCase() === "available"),
    [allRooms]
  );

  const [addBooking, { isLoading: saving }] = useAddBookingMutation();

  const [form, setForm] = useState({
    guest: username || "",
    roomId: stateItemId,
    checkIn: "",
    checkOut: "",
    bookingDate: "",
    time: "",
    guests: "2",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (username) {
      setForm((f) => (f.guest ? f : { ...f, guest: username }));
    }
  }, [username]);

  function itemsForCategory(category) {
    switch (category) {
      case "dining":
        return diningVenues.map((v) => ({
          id: v.id,
          name: v.name,
          description: v.description,
          // Dining is priced as a flat entrance fee per guest - not a
          // "price" field (there isn't one on a dining outlet).
          price: normalizePrice(v.entranceFee),
          isEntranceFee: true,
        }));
      case "experience":
        return experiences.map((e) => {
          const original = normalizePrice(e.price);
          const offerActive = isOfferActive(e);
          return {
            id: e.id,
            name: e.name,
            description: e.description,
            duration: e.duration,
            originalPrice: original,
            price: offerActive ? getDiscountedPrice(original, e) : original,
            offerActive,
            offerPercent: e.offerPercent,
          };
        });
      case "rooms":
      default:
        return rooms.map((r) => {
          const original = normalizePrice(r.price);
          const offerActive = isOfferActive(r);
          return {
            id: r.id,
            name: r.name,
            description: r.description,
            originalPrice: original,
            price: offerActive ? getDiscountedPrice(original, r) : original,
            offerActive,
            offerPercent: r.offerPercent,
          };
        });
    }
  }

  function isLoadingCategory(category) {
    if (category === "rooms") return roomsLoading;
    if (category === "dining") return diningLoading;
    if (category === "experience") return experienceLoading;
    return false;
  }

  const text = FORM_TEXT[activeCategory];
  const fields = FIELD_CONFIG[activeCategory];
  const currentItems = itemsForCategory(activeCategory);
  const selectedItem = currentItems.find((i) => String(i.id) === form.roomId) || null;

  const nights = useMemo(() => nightsBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);

  const durationHours = useMemo(
    () => (activeCategory === "experience" ? parseDurationHours(selectedItem?.duration) : null),
    [activeCategory, selectedItem]
  );
  const timeRange = useMemo(
    () => computeTimeRange(form.time, durationHours),
    [form.time, durationHours]
  );

  const total = useMemo(() => {
    if (!selectedItem) return null;
    if (activeCategory === "rooms") {
      return nights > 0 ? selectedItem.price * nights : null;
    }
    if (activeCategory === "dining") {
      const g = Number(form.guests) || 1;
      return selectedItem.price * g;
    }
    // experience - flat, one spot per booking
    return selectedItem.price;
  }, [selectedItem, activeCategory, nights, form.guests]);

  const minCheckOut = form.checkIn ? addDaysStr(form.checkIn, 1) : addDaysStr(todayStr(), 1);

  const hasProgress =
    form.roomId !== "" ||
    form.checkIn !== "" ||
    form.checkOut !== "" ||
    form.bookingDate !== "" ||
    form.time !== "";

  function handleChange(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "checkIn" && next.checkOut && next.checkOut <= value) {
        next.checkOut = "";
      }
      return next;
    });
  }

  function selectCategory(category) {
    if (saving || locked) return;
    if (hasProgress && category !== activeCategory) return;
    setActiveCategory(category);
    setForm((f) => ({ ...f, roomId: "" }));
  }

  function clearForm() {
    if (saving) return;
    setForm({
      guest: username || "",
      roomId: "",
      checkIn: "",
      checkOut: "",
      bookingDate: "",
      time: "",
      guests: "2",
    });
  }

  function unlockAllCategories() {
    clearForm();
    setLocked(false);
    navigate(location.pathname, { replace: true, state: null });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    if (!form.guest.trim() || !selectedItem) return;

    if (fields.stayDates) {
      if (!form.checkIn || !form.checkOut || nightsBetween(form.checkIn, form.checkOut) <= 0) return;
    }
    if (fields.bookingDate && !form.bookingDate) return;
    if (fields.time && !form.time) return;

    setSubmitError("");
    try {
      const payload = {
        guest: form.guest.trim(),
        category: activeCategory,
        itemName: selectedItem.name,
        itemId: selectedItem.id,
        amount: total ?? 0,
      };
      if (fields.stayDates) {
        payload.checkIn = form.checkIn;
        payload.checkOut = form.checkOut;
      }
      if (fields.bookingDate) {
        payload.bookingDate = form.bookingDate;
      }
      if (fields.time) {
        payload.reservationTime = timeRange ? timeRange.startLabel : form.time;
        if (activeCategory === "experience" && timeRange) {
          // Store the computed end time in checkOut purely for display in
          // the admin bookings table / profile - it isn't validated.
          payload.checkOut = timeRange.endLabel;
        }
      }
      if (fields.guests) {
        payload.guests = Number(form.guests) || 1;
      }

      await addBooking(payload).unwrap();

      clearForm();
      setShowSuccessModal(true);

      if (activeCategory === "rooms") {
        refetchRooms();
      }
    } catch (err) {
      const message =
        err?.data?.message ||
        (err?.status === "FETCH_ERROR"
          ? "Could not reach the server. Is the backend running?"
          : "Something went wrong submitting your booking. Please try again.");
      setSubmitError(message);
    }
  }

  return (
    <div className="sn-page">
      <div className="sn-shell">
        <div className="sn-image-panel">
          <img className="sn-image-photo" src={booking} alt="Booking Animation" />
          <div className="sn-account-banner">
            <ShieldCheck size={15} />
            <span>Booking as <b>{username}</b></span>
          </div>
        </div>

        <div className="sn-form-panel">
          <form className="sn-card" onSubmit={handleSubmit}>
            {!locked && (
              <div className="sn-form-tabs">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    className={`sn-form-tab${activeCategory === key ? " active" : ""}`}
                    onClick={() => selectCategory(key)}
                    disabled={saving || (hasProgress && activeCategory !== key)}
                    title={hasProgress && activeCategory !== key ? "Clear the form to switch category" : undefined}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            )}

            {locked && (
              <p className="sn-tab-lock-hint">
                Booking {text.selectLabel.toLowerCase()} only —{" "}
                <button type="button" className="sn-tab-lock-clear" onClick={unlockAllCategories}>
                  browse all booking options
                </button>
              </p>
            )}

            {!locked && hasProgress && (
              <p className="sn-tab-lock-hint">
                Category is locked while this booking is in progress —{" "}
                <button type="button" className="sn-tab-lock-clear" onClick={clearForm}>
                  clear form
                </button>{" "}
                to switch.
              </p>
            )}

            <p className="sn-eyebrow">{text.eyebrow}</p>
            <h2 className="sn-heading">{text.heading}</h2>
            <p className="sn-subtext">{text.subtext}</p>

            {submitError && <div className="sn-error-banner">{submitError}</div>}

            <div className="sn-field">
              <label htmlFor="sn-guest">
                <User size={13} /> Guest name
              </label>
              <input
                id="sn-guest"
                type="text"
                placeholder="Jane Doe"
                value={form.guest}
                onChange={(e) => handleChange("guest", e.target.value)}
                disabled={saving}
                required
              />
            </div>

            <div className="sn-field">
              <label htmlFor="sn-room">
                <BedDouble size={13} /> {text.selectLabel}
              </label>
              <select
                id="sn-room"
                value={form.roomId}
                onChange={(e) => handleChange("roomId", e.target.value)}
                disabled={saving || isLoadingCategory(activeCategory) || currentItems.length === 0}
                required
              >
                <option value="">
                  {isLoadingCategory(activeCategory)
                    ? text.loadingLabel
                    : currentItems.length === 0
                    ? text.emptyLabel
                    : text.selectPlaceholder}
                </option>
                {currentItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.offerActive ? ` — ${item.offerPercent}% off` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedItem?.offerActive && (
              <div className="sn-offer-banner">
                <BadgePercent size={15} />
                <span>
                  Discount {selectedItem.offerPercent}% applied — ₹
                  {selectedItem.originalPrice.toLocaleString()} now ₹{selectedItem.price.toLocaleString()}
                </span>
              </div>
            )}

            {fields.stayDates && (
              <div className="sn-row2">
                <div className="sn-field">
                  <label htmlFor="sn-checkin">
                    <CalendarDays size={13} /> Check-in
                  </label>
                  <input
                    id="sn-checkin"
                    type="date"
                    min={todayStr()}
                    value={form.checkIn}
                    onChange={(e) => handleChange("checkIn", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="sn-field">
                  <label htmlFor="sn-checkout">
                    <CalendarDays size={13} /> Check-out
                  </label>
                  <input
                    id="sn-checkout"
                    type="date"
                    min={minCheckOut}
                    value={form.checkOut}
                    onChange={(e) => handleChange("checkOut", e.target.value)}
                    disabled={saving || !form.checkIn}
                    required
                  />
                </div>
              </div>
            )}

            {fields.bookingDate && fields.time && (
              <div className="sn-row2">
                <div className="sn-field">
                  <label htmlFor="sn-date">
                    <CalendarDays size={13} /> {activeCategory === "dining" ? "Reservation date" : "Date"}
                  </label>
                  <input
                    id="sn-date"
                    type="date"
                    min={todayStr()}
                    value={form.bookingDate}
                    onChange={(e) => handleChange("bookingDate", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
                <div className="sn-field">
                  <label htmlFor="sn-time">
                    <Clock size={13} /> {activeCategory === "experience" ? "Start time" : "Time"}
                  </label>
                  <input
                    id="sn-time"
                    type="time"
                    value={form.time}
                    onChange={(e) => handleChange("time", e.target.value)}
                    disabled={saving}
                    required
                  />
                </div>
              </div>
            )}

            {activeCategory === "experience" && selectedItem && (
              <p className="sn-experience-duration-hint">
                {timeRange
                  ? `Runs ${timeRange.startLabel} – ${timeRange.endLabel} (${selectedItem.duration})`
                  : selectedItem.duration
                  ? `Duration: ${selectedItem.duration} — pick a start time above`
                  : null}
              </p>
            )}

            {fields.guests && (
              <div className="sn-field">
                <label htmlFor="sn-guests">
                  <Users size={13} /> Guests
                </label>
                <input
                  id="sn-guests"
                  type="number"
                  min={1}
                  max={20}
                  value={form.guests}
                  onChange={(e) => handleChange("guests", e.target.value)}
                  disabled={saving}
                  required
                />
                {activeCategory === "dining" && selectedItem && (
                  <small className="sn-field-hint">
                    Entrance fee ₹{selectedItem.price.toLocaleString()} per guest
                  </small>
                )}
              </div>
            )}

            {selectedItem && total !== null && (
              <div className="sn-summary">
                <span>
                  {activeCategory === "rooms"
                    ? `${nights} night${nights > 1 ? "s" : ""} · ${selectedItem.name}`
                    : selectedItem.name}
                </span>
                <b>₹{total.toLocaleString()}</b>
              </div>
            )}

            <div className="sn-submit-wrap">
              <button className="sn-submit" type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 size={14} className="sn-spin" /> {text.bookingLabel}
                  </>
                ) : (
                  text.bookLabel
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="sn-modal-scrim" onClick={() => setShowSuccessModal(false)}>
          <div className="sn-modal" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 size={40} className="sn-modal-icon" />
            <h3 className="sn-modal-heading">Booking Successful</h3>
            <p className="sn-modal-text">{text.successLabel}</p>
            <div className="sn-modal-actions">
              <button className="sn-modal-secondary" onClick={() => navigate("/profile")}>
                View My Bookings
              </button>
              <button className="sn-modal-close" onClick={() => setShowSuccessModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
