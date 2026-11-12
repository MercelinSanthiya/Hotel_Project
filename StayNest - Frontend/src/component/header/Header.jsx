import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Header.css";
import logoImg from "../../assets/images/logo2.png";
import { selectCurrentUser, logout } from "../../store/authSlice";
import { apiSlice } from "../../store/apiSlice";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  
  
  const { username, token } = useSelector(selectCurrentUser);
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setAccountOpen(false);
    setMenuOpen(false);
    dispatch(logout());
    
    
    dispatch(apiSlice.util.resetApiState());
    navigate("/");
  };

  
  
  const handleBookClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setMenuOpen(false);
      navigate("/login", { state: { from: "/booking" } });
    } else {
      setMenuOpen(false);
    }
  };

  const initial = username ? username.charAt(0).toUpperCase() : "";

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      
      <Link to="/" className="logoo" onClick={() => setMenuOpen(false)}>
        <img src={logoImg} alt="Logo" className="logoo-img" />
      </Link>

      
      <nav className="nav">
        <Link to="/">Overview</Link>
        <Link to="/rooms-suites">Rooms &amp; Suites</Link>
        <Link to="/dining">Food &amp; Drinks</Link>
        <Link to="/experiences">Experiences</Link>
        <Link to="/offers">Offers</Link>
        <Link to="/enquiry">Enquiry</Link>
      </nav>

      
      <div className="header-right">
        {isLoggedIn ? (
          <div className="account-menu" ref={accountRef}>
            <button
              type="button"
              className="account-trigger"
              onClick={() => setAccountOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={accountOpen}
            >
              <span className="account-avatar">{initial}</span>
              <span className="account-name">{username}</span>
            </button>
            {accountOpen && (
              <div className="account-dropdown">
                <Link to="/profile" onClick={() => setAccountOpen(false)}>My Profile</Link>
                <Link to="/booking" onClick={() => setAccountOpen(false)}>New Booking</Link>
                <button type="button" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="login">Login / Join</Link>
        )}
        <Link to="/booking" className="book-btn" onClick={handleBookClick}>Book a Stay</Link>
      </div>

      
      <button 
        className={`hamburger ${menuOpen ? "active" : ""}`} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Navigation Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Overview</Link>
          <Link to="/rooms-suites" onClick={() => setMenuOpen(false)}>Rooms &amp; Suites</Link>
          <Link to="/dining" onClick={() => setMenuOpen(false)}>Food &amp; Drinks</Link>
          <Link to="/experiences" onClick={() => setMenuOpen(false)}>Experiences</Link>
          <Link to="/offers" onClick={() => setMenuOpen(false)}>Offers</Link>
          <Link to="/enquiry" onClick={() => setMenuOpen(false)}>Enquiry</Link>
          <hr />
          {isLoggedIn ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile ({username})</Link>
              <button type="button" className="mobile-logout" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login / Join</Link>
          )}
          <Link to="/booking" className="mobile-book" onClick={handleBookClick}>Book a Stay</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
