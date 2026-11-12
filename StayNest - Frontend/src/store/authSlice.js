
import { createSlice } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../constants/apiConstants";

const readStoredAuth = () => ({
  token: localStorage.getItem(STORAGE_KEYS.TOKEN) || null,
  username: localStorage.getItem(STORAGE_KEYS.USERNAME) || null,
  role: localStorage.getItem(STORAGE_KEYS.ROLE) || null,
  email: localStorage.getItem(STORAGE_KEYS.EMAIL) || null,
  id: localStorage.getItem(STORAGE_KEYS.USER_ID) || null,
});

const initialState = readStoredAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
   
    setCredentials: (state, action) => {
      const { token, username, role, email, id } = action.payload;
      state.token = token ?? null;
      state.username = username ?? null;
      state.role = role ?? null;
      state.email = email ?? null;
      state.id = id ?? null;

      if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      if (username) localStorage.setItem(STORAGE_KEYS.USERNAME, username);
      if (role) localStorage.setItem(STORAGE_KEYS.ROLE, role);
      if (email) localStorage.setItem(STORAGE_KEYS.EMAIL, email);
      if (id != null) localStorage.setItem(STORAGE_KEYS.USER_ID, String(id));
    },

    logout: (state) => {
      state.token = null;
      state.username = null;
      state.role = null;
      state.email = null;
      state.id = null;
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;


export const selectCurrentUser = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectIsAdmin = (state) =>
  (state.auth.role || "").toLowerCase().replace("role_", "").trim() === "admin";

export default authSlice.reducer;