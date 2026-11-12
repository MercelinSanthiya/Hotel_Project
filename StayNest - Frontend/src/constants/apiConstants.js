

export const SERVER_ORIGIN = "http://localhost:8080";
export const API_BASE_URL = `${SERVER_ORIGIN}/api`;

export const ENDPOINTS = {
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",
  ROOMS: "/rooms",
  DINING: "/dining",
  EXPERIENCES: "/experiences",
  ENQUIRY: "/enquiry",
  BOOKINGS: "/bookings",
  MY_BOOKINGS: "/bookings/me",
  CANCEL_BOOKING: (id) => `/bookings/${id}/cancel`,
  ADMIN_USERS: "/admin/users",
  PROFILE: "/profile",
};


export const STORAGE_KEYS = {
  TOKEN: "token",
  USERNAME: "username",
  ROLE: "role",
  EMAIL: "email",
  USER_ID: "userId",
};

export const resolveImageUrl = (imageUrl, fallback = "/placeholder-image.jpg") => {
  if (!imageUrl) return fallback;
  return imageUrl.startsWith("http") ? imageUrl : `${SERVER_ORIGIN}${imageUrl}`;
};
