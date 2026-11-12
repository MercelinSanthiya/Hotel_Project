import { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import logoImg from "../../assets/images/logo2.png";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-divider"></div>

      <div className="footer-main">
        <div className="footer-col footer-brand">
          <Link to="/">
            <img src={logoImg} alt="StayNest" className="footer-logo" />
          </Link>
          <p className="footer-tagline">
            Considered stays in places worth slowing down for.
          </p>

          {/* Social Media Icons */}
          <div className="footer-social">
            <a href="#" className="icon facebook" aria-label="Facebook">
              <div className="tooltip">Facebook</div>
              <span><FaFacebookF /></span>
            </a>
            <a href="#" className="icon twitter" aria-label="Twitter">
              <div className="tooltip">Twitter</div>
              <span><FaTwitter /></span>
            </a>
            <a href="#" className="icon instagram" aria-label="Instagram">
              <div className="tooltip">Instagram</div>
              <span><FaInstagram /></span>
            </a>
            <a href="#" className="icon youtube" aria-label="YouTube">
              <div className="tooltip">YouTube</div>
              <span><FaYoutube /></span>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Overview</Link></li>
            <li><Link to="/rooms-suites">Rooms &amp; Suites</Link></li>
            <li><Link to="/dining">Food &amp; Drinks</Link></li>
            <li><Link to="/experiences">Experiences</Link></li>
            <li><Link to="/Enquiry">Enquiry</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Guest Services</h4>
          <ul>
            <li><Link to="/offers">Offers</Link></li>
            <li><Link to="/booking">Book a Stay</Link></li>
            <li><Link to="/login">Login / Join</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>StayNest</h4>
          <ul>
            <li><a href="/enquiry">Our Story</a></li>
            <li><a href="/enquiry">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-col footer-contact">
          <h4>Reach Us</h4>
          <ul>
            <li><a href="tel:+916345256780">+91 6345256780</a></li>
            <li><a href="mailto:reservations@staynest.com">reservations@staynest.com</a></li>
            <li>24/7 Guest Support</li>
          </ul>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <p>© {year} StayNest Hotels. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/legal/privacy-policy">Privacy Policy</Link>
          <Link to="/legal/terms-of-use">Terms of Use</Link>
          <Link to="/legal/cookie-preferences">Cookie Preferences</Link>
          <Link to="/legal/accessibility">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;