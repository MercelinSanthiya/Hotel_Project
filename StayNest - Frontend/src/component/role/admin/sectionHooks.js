
import {
  useGetRoomsQuery, useAddRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation,
  useGetDiningQuery, useAddDiningMutation, useUpdateDiningMutation, useDeleteDiningMutation,
  useGetExperiencesQuery, useAddExperienceMutation, useUpdateExperienceMutation, useDeleteExperienceMutation,
  useGetBookingsQuery, useAddBookingMutation, useUpdateBookingMutation, useDeleteBookingMutation,
  useGetUsersQuery, useAddUserMutation, useUpdateUserMutation, useDeleteUserMutation,
} from "../../../store/apiSlice";

export const sectionHooks = {
  rooms: {
    useGetAll: useGetRoomsQuery,
    useAdd: useAddRoomMutation,
    useUpdate: useUpdateRoomMutation,
    useDelete: useDeleteRoomMutation,
  },
  dining: {
    useGetAll: useGetDiningQuery,
    useAdd: useAddDiningMutation,
    useUpdate: useUpdateDiningMutation,
    useDelete: useDeleteDiningMutation,
  },
  experiences: {
    useGetAll: useGetExperiencesQuery,
    useAdd: useAddExperienceMutation,
    useUpdate: useUpdateExperienceMutation,
    useDelete: useDeleteExperienceMutation,
  },
  bookings: {
    useGetAll: useGetBookingsQuery,
    useAdd: useAddBookingMutation,
    useUpdate: useUpdateBookingMutation,
    useDelete: useDeleteBookingMutation,
  },
  users: {
    useGetAll: useGetUsersQuery,
    useAdd: useAddUserMutation,
    useUpdate: useUpdateUserMutation,
    useDelete: useDeleteUserMutation,
  },
};
