import { useState, useEffect } from "react";
import { FiMapPin, FiMail, FiPhone, FiCheckCircle, FiX } from "react-icons/fi";
import emailjs from "@emailjs/browser";
import "./Enquiry.css";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const initialForm = {
  name: "",
  phone: "",
  email: "",
  location: "",
  description: "",
};

const submitEnquiry = (payload) => {
  const templateParams = {
    from_name: payload.name,
    phone: payload.phone,
    from_email: payload.email,
    location: payload.location,
    message: payload.description,
  };

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY
  );
};

const Enquiry = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); 
  const [showModal, setShowModal] = useState(false);

  
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => setShowModal(false), 3000);
    return () => clearTimeout(timer);
  }, [showModal]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.phone.trim()) next.phone = "Please enter a phone number.";
    if (!form.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Please enter a valid email.";
    }
    if (!form.location.trim()) next.location = "Please enter your location.";
    if (!form.description.trim()) next.description = "Tell us a little about your enquiry.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      await submitEnquiry(form);
      setStatus(null);
      setForm(initialForm);
      setShowModal(true);
    } catch (err) {
      console.error("EmailJS send failed:", err);
      setStatus("error");
    }
  };

  return (
    <div className="enquiry-page">
      
      <section className="enquiry-hero">
        <div className="enquiry-hero-overlay"></div>
        <div className="enquiry-hero-content">
          <span className="enquiry-hero-eyebrow">Enquiry</span>
          <h1>Let's Plan Your Stay</h1>
          <p>
            Have a question about our rooms, suites, or experiences? Send us
            a few details and our team will get back to you shortly.
          </p>
        </div>
      </section>

      
      <section className="enquiry-body">
        <div className="enquiry-about">
          <span className="enquiry-about-eyebrow">About StayNest</span>
          <h2>A Quiet Retreat, Thoughtfully Hosted</h2>
          <p>
            StayNest is a boutique hotel built around comfort, warmth, and
            genuine hospitality. From well-appointed rooms and suites to our
            in-house dining and curated experiences, every detail is designed
            to make your stay feel effortless.
          </p>
          <p>
            Whether you're travelling for business, a family getaway, or a
            quiet weekend away, our team is happy to help you plan the right
            room, package, or experience for your visit.
          </p>

          <hr className="enquiry-divider" />

          <ul className="enquiry-contact-list">
            <li>
              <span className="enquiry-contact-icon">
                <FiMapPin size={17} />
              </span>
              <div>
                <span className="enquiry-contact-label">Registered Address</span>
                <span className="enquiry-contact-value">
                  No.9/15, Mariamman Kovil Street, Korattur, Chennai – 600 080.
                </span>
              </div>
            </li>
            <li>
              <span className="enquiry-contact-icon">
                <FiMail size={17} />
              </span>
              <div>
                <span className="enquiry-contact-label">Our Email</span>
                <span className="enquiry-contact-value">staynext@gmail.com</span>
              </div>
            </li>
            <li>
              <span className="enquiry-contact-icon">
                <FiPhone size={17} />
              </span>
              <div>
                <span className="enquiry-contact-label">Phone</span>
                <span className="enquiry-contact-value">+91 6345785690</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="enquiry-form-wrap">
          <h3>Send an Enquiry</h3>
          <p className="enquiry-form-subtext">
            Fill in your details below and we'll be in touch.
          </p>

          <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="enquiry-field">
              <label htmlFor="enq-name">Your Name</label>
              <input
                id="enq-name"
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange("name")}
              />
              {errors.name && <div className="enquiry-field-error">{errors.name}</div>}
            </div>

            <div className="enquiry-field">
              <label htmlFor="enq-phone">Phone</label>
              <input
                id="enq-phone"
                type="tel"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange("phone")}
              />
              {errors.phone && <div className="enquiry-field-error">{errors.phone}</div>}
            </div>

            <div className="enquiry-field">
              <label htmlFor="enq-email">Email</label>
              <input
                id="enq-email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange("email")}
              />
              {errors.email && <div className="enquiry-field-error">{errors.email}</div>}
            </div>

            <div className="enquiry-field">
              <label htmlFor="enq-location">Your Location</label>
              <input
                id="enq-location"
                type="text"
                placeholder="Your Location"
                value={form.location}
                onChange={handleChange("location")}
              />
              {errors.location && <div className="enquiry-field-error">{errors.location}</div>}
            </div>

            <div className="enquiry-field">
              <label htmlFor="enq-description">Enquiry Details</label>
              <textarea
                id="enq-description"
                placeholder="Tell us what you're looking for..."
                value={form.description}
                onChange={handleChange("description")}
              />
              {errors.description && (
                <div className="enquiry-field-error">{errors.description}</div>
              )}
            </div>

            {status === "error" && (
              <div className="enquiry-form-status error">
                Something went wrong. Please try again.
              </div>
            )}

            <button type="submit" className="enquiry-submit-btn" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>
      </section>

      
      {showModal && (
        <div className="enquiry-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="enquiry-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="enquiry-modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
            <div className="enquiry-modal-icon">
              <FiCheckCircle size={40} />
            </div>
            <h4>Enquiry Sent!</h4>
            <p>Thank you — we'll be in touch soon.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiry;