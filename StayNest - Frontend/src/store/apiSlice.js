
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, ENDPOINTS, STORAGE_KEYS } from "../constants/apiConstants";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const unwrapResponseArray = (response, depth = 0) => {
  if (!response || depth > 4) return [];
  if (Array.isArray(response)) return response;

  if (typeof response === "object") {
    
    const preferredKeys = ["content", "data", "items", "results"];
    for (const key of preferredKeys) {
      if (Array.isArray(response[key])) return response[key];
    }

    const arrayKey = Object.keys(response).find((key) => Array.isArray(response[key]));
    if (arrayKey) return response[arrayKey];


    for (const key of Object.keys(response)) {
      if (response[key] && typeof response[key] === "object") {
        const nested = unwrapResponseArray(response[key], depth + 1);
        if (nested.length > 0) return nested;
      }
    }
  }

  return [];
};


const unwrapResponseObject = (response, depth = 0) => {
  if (!response || typeof response !== "object" || depth > 4) return response ?? {};
  if (response.token || response.username || response.role) return response;
  if (response.data && typeof response.data === "object") {
    return unwrapResponseObject(response.data, depth + 1);
  }
  if (response.user && typeof response.user === "object") {
    return unwrapResponseObject(response.user, depth + 1);
  }
  return response;
};

const toFormData = (fields) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    formData.append(key, value);
  });
  return formData;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Room", "Dining", "Experience", "Booking", "User", "Profile"],
  endpoints: (builder) => ({
  
    login: builder.mutation({
      query: (credentials) => ({
        url: ENDPOINTS.AUTH_LOGIN,
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response) => unwrapResponseObject(response),
    }),
    register: builder.mutation({
      query: (payload) => ({
        url: ENDPOINTS.AUTH_REGISTER,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response) => unwrapResponseObject(response),
    }),

   
    getRooms: builder.query({
      query: () => ENDPOINTS.ROOMS,
      transformResponse: (response) => unwrapResponseArray(response),
      providesTags: ["Room"],
    }),
    addRoom: builder.mutation({
      query: (fields) => ({ url: ENDPOINTS.ROOMS, method: "POST", body: toFormData(fields) }),
      invalidatesTags: ["Room"],
    }),
    updateRoom: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `${ENDPOINTS.ROOMS}/${id}`,
        method: "PUT",
        body: toFormData(fields),
      }),
      invalidatesTags: ["Room"],
    }),
    deleteRoom: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.ROOMS}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Room"],
    }),

    
    getDining: builder.query({
      query: () => ENDPOINTS.DINING,
      transformResponse: (response) => unwrapResponseArray(response),
      providesTags: ["Dining"],
    }),
    addDining: builder.mutation({
      query: (fields) => ({ url: ENDPOINTS.DINING, method: "POST", body: toFormData(fields) }),
      invalidatesTags: ["Dining"],
    }),
    updateDining: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `${ENDPOINTS.DINING}/${id}`,
        method: "PUT",
        body: toFormData(fields),
      }),
      invalidatesTags: ["Dining"],
    }),
    deleteDining: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.DINING}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Dining"],
    }),

   
    getExperiences: builder.query({
      query: () => ENDPOINTS.EXPERIENCES,
      transformResponse: (response) => unwrapResponseArray(response),
      providesTags: ["Experience"],
    }),
    addExperience: builder.mutation({
      query: (fields) => ({ url: ENDPOINTS.EXPERIENCES, method: "POST", body: toFormData(fields) }),
      invalidatesTags: ["Experience"],
    }),
    updateExperience: builder.mutation({
      query: ({ id, ...fields }) => ({
        url: `${ENDPOINTS.EXPERIENCES}/${id}`,
        method: "PUT",
        body: toFormData(fields),
      }),
      invalidatesTags: ["Experience"],
    }),
    deleteExperience: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.EXPERIENCES}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Experience"],
    }),

    getBookings: builder.query({
      query: () => ENDPOINTS.BOOKINGS,
      transformResponse: (response) => unwrapResponseArray(response),
      providesTags: ["Booking"],
    }),
    getMyBookings: builder.query({
      query: () => ENDPOINTS.MY_BOOKINGS,
      transformResponse: (response) => unwrapResponseArray(response),
      providesTags: ["Booking"],
    }),
    addBooking: builder.mutation({
      query: (booking) => ({ url: ENDPOINTS.BOOKINGS, method: "POST", body: booking }),
      
      invalidatesTags: ["Booking", "Room"],
    }),
    updateBooking: builder.mutation({
      query: ({ id, ...booking }) => ({
        url: `${ENDPOINTS.BOOKINGS}/${id}`,
        method: "PUT",
        body: booking,
      }),
      
      invalidatesTags: ["Booking", "Room"],
    }),
    deleteBooking: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.BOOKINGS}/${id}`, method: "DELETE" }),
      
      invalidatesTags: ["Booking", "Room"],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({ url: ENDPOINTS.CANCEL_BOOKING(id), method: "PUT" }),
      invalidatesTags: ["Booking", "Room"],
    }),

  
    getMyProfile: builder.query({
      query: () => ENDPOINTS.PROFILE,
      transformResponse: (response) => unwrapResponseObject(response),
      providesTags: ["Profile"],
    }),

  
    getUsers: builder.query({
      query: () => ENDPOINTS.ADMIN_USERS,
      transformResponse: (response) => unwrapResponseArray(response),
      providesTags: ["User"],
    }),
    addUser: builder.mutation({
      query: (user) => ({ url: ENDPOINTS.ADMIN_USERS, method: "POST", body: user }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...user }) => ({
        url: `${ENDPOINTS.ADMIN_USERS}/${id}`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `${ENDPOINTS.ADMIN_USERS}/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,

  useGetRoomsQuery,
  useAddRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,

  useGetDiningQuery,
  useAddDiningMutation,
  useUpdateDiningMutation,
  useDeleteDiningMutation,

  useGetExperiencesQuery,
  useAddExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,

  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useCancelBookingMutation,

  useGetMyProfileQuery,

  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;