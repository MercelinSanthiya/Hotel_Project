// src/component/role/admin/pages/AdminDashboard.jsx
import { Link } from "react-router-dom";
import { useGetRoomsQuery, useGetBookingsQuery, useGetExperiencesQuery } from "../../../../store/apiSlice";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { data: rooms = [], isLoading: roomsLoading } = useGetRoomsQuery();
  const { data: bookings = [], isLoading: bookingsLoading } = useGetBookingsQuery();
  const { data: experiences = [], isLoading: experiencesLoading } = useGetExperiencesQuery();

  const isLoading = roomsLoading || bookingsLoading || experiencesLoading;

  // A room is "occupied" whenever it isn't currently bookable - i.e. it's
  // "Booked" (blocked by a guest through their checkout date) or under
  // "Maintenance". Booked rooms free themselves up automatically the day
  // after checkout, so this stays accurate without any admin action.
  const occupied = rooms.filter((r) => r.status && r.status !== "Available").length;
  const occupancyRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
  const activeOffers =
    rooms.filter((r) => r.offerPercent > 0).length + experiences.filter((e) => e.offerPercent > 0).length;
  const confirmedBookings = bookings.filter((b) => b.status === "Confirmed").length;
  const avgRate = rooms.length
    ? Math.round(rooms.reduce((sum, r) => sum + Number(r.price || 0), 0) / rooms.length)
    : 0;

  const stats = [
    { label: "Rooms & suites", value: rooms.length, hint: `${occupancyRate}% occupied` },
    { label: "Confirmed bookings", value: confirmedBookings, hint: `${bookings.length} total on record` },
    { label: "Active offers", value: activeOffers, hint: "across rooms & experiences" },
    { label: "Avg. nightly rate", value: `$${avgRate}`, hint: "across all room types" },
  ];

  const recentBookings = [...bookings].slice(-5).reverse();

  return (
    <div className="dash">
      <div className="dash-header">
        <h1 className="dash-title">Good to see you</h1>
        <p className="dash-subtitle">Here's how the property is looking today.</p>
      </div>

      {isLoading ? (
        <p className="dash-subtitle">Loading dashboard…</p>
      ) : (
        <>
          <div className="dash-stats">
            {stats.map((s) => (
              <div className="dash-stat-card" key={s.label}>
                <span className="dash-stat-label">{s.label}</span>
                <span className="dash-stat-value">{s.value}</span>
                <span className="dash-stat-hint">{s.hint}</span>
              </div>
            ))}
          </div>

          <div className="dash-panel">
            <div className="dash-panel-header">
              <h2>Recent bookings</h2>
              <Link to="/admin/bookings" className="dash-panel-link">View all</Link>
            </div>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="dash-empty">No bookings yet.</td>
                  </tr>
                )}
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.guest}</td>
                    <td>{b.itemName}</td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td>
                      <span className={`dash-status dash-status-${b.status.toLowerCase()}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
