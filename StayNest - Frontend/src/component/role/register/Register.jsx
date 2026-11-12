import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { useRegisterMutation } from "../../../store/apiSlice";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) {
      errors.username = "Username is required";
    } else if (form.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getErrorMessage = (error) => {
    if (error?.data?.message) return error.data.message;
    if (error?.status === "FETCH_ERROR") {
      return "Could not reach the server. Is the backend running on port 8080?";
    }
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validate()) return;

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      }).unwrap();

      setSuccessMsg("Account created! Redirecting you to log in...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-left">
     
        <div className="reg-tagline">
          <h1>Your room is waiting.</h1>
          <p>Create an account to book faster next time and keep every reservation in one place.</p>
        </div>
      </div>

      <div className="reg-card-wrap">
        <div className="reg-card">
          <p className="reg-eyebrow">Create account</p>
          <h2>Join StayNest</h2>
          <p className="reg-subtext">It only takes a minute to set up your account.</p>

          {serverError && <div className="reg-banner error">{serverError}</div>}
          {successMsg && <div className="reg-banner success">{successMsg}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="reg-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                className={fieldErrors.username ? "input-error" : ""}
                placeholder="Choose a username"
              />
              {fieldErrors.username && <div className="reg-field-error">{fieldErrors.username}</div>}
            </div>

            <div className="reg-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? "input-error" : ""}
                placeholder="you@example.com"
              />
              {fieldErrors.email && <div className="reg-field-error">{fieldErrors.email}</div>}
            </div>

            <div className="reg-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className={fieldErrors.password ? "input-error" : ""}
                placeholder="At least 6 characters"
              />
              {fieldErrors.password && <div className="reg-field-error">{fieldErrors.password}</div>}
            </div>

            <div className="reg-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={fieldErrors.confirmPassword ? "input-error" : ""}
                placeholder="Re-enter your password"
              />
              {fieldErrors.confirmPassword && <div className="reg-field-error">{fieldErrors.confirmPassword}</div>}
            </div>

            <button type="submit" className="reg-submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="reg-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}