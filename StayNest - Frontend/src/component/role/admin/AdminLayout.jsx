
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import logoImg from "../../../assets/images/logo2.png";

const NAV_MAIN = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/rooms", label: "Rooms & Suites" },
  { to: "/admin/dining", label: "Food & Drinks" },
  { to: "/admin/experiences", label: "Experiences" },
];

const NAV_SECONDARY = [
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/users", label: "Users" },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Wire up real auth teardown here.
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/admin" className="admin-brand" onClick={() => setSidebarOpen(false)}>
          <img src={logoImg} alt="Logo" className="admin-brand-img" />
          <span className="admin-brand-name">Admin</span>
        </Link>

        <nav className="admin-nav">
          <p className="admin-nav-label">Content</p>
          {NAV_MAIN.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}

          <p className="admin-nav-label">Front desk</p>
          {NAV_SECONDARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      {sidebarOpen && <div className="admin-scrim" onClick={() => setSidebarOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-btn"
            aria-label="Toggle admin navigation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <input className="admin-search" type="search" placeholder="Search this section…" />

          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div className="admin-profile-text">
              <span className="admin-profile-name">Admin</span>
              <span className="admin-profile-role">Property manager</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
