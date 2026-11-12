import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  ShieldCheck,
  CalendarDays,
  LogOut,
  BedDouble,
  Utensils,
  Compass,
  Tag,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import "./Profile.css";
import {
  useGetMyProfileQuery,
  useGetMyBookingsQuery,
  useCancelBookingMutation,
  apiSlice,
} from "../../../store/apiSlice";
import { selectCurrentUser, logout } from "../../../store/authSlice";


const CATEGORY_META = {
  rooms: { label: "Room", icon: BedDouble },
  dining: { label: "Food & Drinks", icon: Utensils },
  experience: { label: "Experience", icon: Compass },
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username: fallbackUsername } = useSelector(selectCurrentUser);

  const { data: profile, isLoading: profileLoading, isError: profileError } = useGetMyProfileQuery();
  const { data: bookings = [], isLoading: bookingsLoading } = useGetMyBookingsQuery();
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();

  const [cancelTarget, setCancelTarget] = useState(null); // booking being confirmed for cancel
  const [cancelError, setCancelError] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/");
  };

  const initial = (profile?.username || fallbackUsername || "?").charAt(0).toUpperCase();

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelError("");
    try {
      await cancelBooking(cancelTarget.id).unwrap();
      setCancelTarget(null);
    } catch (err) {
      setCancelError(err?.data?.message || "Couldn't cancel this booking. Please try again.");
    }
  }

  return (
    <div className="pf-page">
      <div className="pf-shell">
      
        <section className="pf-account-card">
          <div className="pf-avatar">{initial}</div>

          {profileLoading ? (
            <p className="pf-loading"><Loader2 size={16} className="pf-spin" /> Loading your profile…</p>
          ) : profileError ? (
            <p className="pf-error">Couldn't load your profile. Please try logging in again.</p>
          ) : (
            <>
              <h1 className="pf-username">{profile.username}</h1>
              <span className={`pf-role-badge ${profile.role === "ADMIN" ? "admin" : ""}`}>
                <ShieldCheck size={12} /> {profile.role}
              </span>

              <div className="pf-detail-row">
                <Mail size={14} /> <span>{profile.email}</span>
              </div>
              <div className="pf-detail-row">
                <CalendarDays size={14} /> <span>Member since {formatDate(profile.createdAt)}</span>
              </div>
            </>
          )}

          <button type="button" className="pf-logout" onClick={handleLogout}>
            <LogOut size={14} /> Log out
          </button>
        </section>

        
        <section className="pf-bookings-card">
          <div className="pf-bookings-head">
            <h2>My Bookings</h2>
            <button type="button" className="pf-new-booking" onClick={() => navigate("/booking")}>
              + New Booking
            </button>
          </div>

          {bookingsLoading ? (
            <p className="pf-loading"><Loader2 size={16} className="pf-spin" /> Loading your bookings…</p>
          ) : bookings.length === 0 ? (
            <div className="pf-empty">
              <p>You haven't booked anything yet.</p>
              <button type="button" onClick={() => navigate("/booking")}>Start a booking</button>
            </div>
          ) : (
            <ul className="pf-booking-list">
              {bookings.map((b) => {
                const meta = CATEGORY_META[b.category] || { label: b.category, icon: Tag };
                const Icon = meta.icon;
                const statusClass = (b.status || "").toLowerCase();
                const isPending = statusClass === "pending";
                const isCancelled = statusClass === "cancelled";
                return (
                  <li key={b.id} className="pf-booking-item">
                    <div className="pf-booking-icon">
                      <Icon size={18} />
                    </div>
                    <div className="pf-booking-main">
                      <div className="pf-booking-top">
                        <span className="pf-booking-category">{meta.label}</span>
                        <span className={`pf-status-badge ${statusClass}`}>{b.status}</span>
                      </div>
                      <p className="pf-booking-name">{b.itemName}</p>
                      <p className="pf-booking-dates">
                        <CalendarDays size={12} />{" "}
                        {b.checkIn || b.bookingDate
                          ? formatDate(b.checkIn || b.bookingDate)
                          : "—"}
                        {b.checkOut ? <> &rarr; {formatDate(b.checkOut)}</> : null}
                        {b.reservationTime ? <> · {b.reservationTime}</> : null}
                      </p>
                      {isCancelled && (
                        <p className="pf-booking-cancelled-note">
                          {b.cancelledBy === "admin"
                            ? "This booking was cancelled by the hotel."
                            : "You cancelled this booking."}
                        </p>
                      )}
                    </div>
                    <div className="pf-booking-side">
                      <div className="pf-booking-amount">
                        ₹{Number(b.amount || 0).toLocaleString()}
                      </div>
                      {isPending && (
                        <button
                          type="button"
                          className="pf-cancel-btn"
                          onClick={() => {
                            setCancelError("");
                            setCancelTarget(b);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {cancelTarget && (
        <div className="pf-modal-scrim" onClick={() => !cancelling && setCancelTarget(null)}>
          <div className="pf-modal" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle size={36} className="pf-modal-icon" />
            <h3 className="pf-modal-heading">Cancel this booking?</h3>
            <p className="pf-modal-text">
              Are you sure you want to cancel your {(CATEGORY_META[cancelTarget.category]?.label || cancelTarget.category).toLowerCase()} booking
              for <b>{cancelTarget.itemName}</b>? This can't be undone.
            </p>
            {cancelError && <div className="pf-modal-error">{cancelError}</div>}
            <div className="pf-modal-actions">
              <button
                type="button"
                className="pf-modal-secondary"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
              >
                No, keep it
              </button>
              <button
                type="button"
                className="pf-modal-danger"
                onClick={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
