import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "./Login.css";
import { useLoginMutation } from "../../../store/apiSlice";
import { setCredentials } from "../../../store/authSlice";

function isAdminRole(role) {
  if (!role) return false;
  return String(role).toLowerCase().replace("role_", "").trim() === "admin";
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.password) errors.password = "Password is required";
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

    if (!validate()) return;

    try {
      const data = await login({
        email: form.email.trim(),
        password: form.password,
      }).unwrap();

      if (!data?.token) {
        console.error("[Login] No token found in response:", data);
        setServerError("Login succeeded but no token was returned. Please contact support.");
        return;
      }

      dispatch(
        setCredentials({
          token: data.token,
          username: data.username ?? null,
          role: data.role ?? null,
          email: data.email ?? form.email.trim(),
          id: data.id ?? null,
        })
      );

      if (isAdminRole(data.role)) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("[Login] error:", err);
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="log-page">
      <div className="log-left">
        <div className="log-tagline">
          <h1>Welcome back to your next stay.</h1>
          <p>Sign in to manage bookings, view your reservations, and check in without the wait.</p>
        </div>
      </div>

      <div className="log-card-wrap">
        <div className="log-card">
          <span className="log-eyebrow">Sign in</span>
          <h2>Log in to your account</h2>
          <p className="log-subtext">Enter your details below to access your bookings.</p>

          {serverError && <div className="log-banner error">{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="log-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? "input-error" : ""}
                placeholder="e.g. johndoe@example.com"
              />
              {fieldErrors.email && <div className="log-field-error">{fieldErrors.email}</div>}
            </div>

            <div className="log-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className={fieldErrors.password ? "input-error" : ""}
                placeholder="Enter your password"
              />
              {fieldErrors.password && <div className="log-field-error">{fieldErrors.password}</div>}
            </div>

            <button type="submit" className="log-submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="log-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}