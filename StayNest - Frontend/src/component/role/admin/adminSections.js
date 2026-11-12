
export const adminSections = {
 

rooms: {
  title: "Rooms",
  singular: "Room",
  hasImage: true,
  imageRequiredOnCreate: true,
  fields: [
    { key: "name", label: "Name", type: "text" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: ["Deluxe", "Suite", "Villa", "Presidential"],
    },
    { key: "price", label: "Price", type: "number" },
    { key: "capacity", label: "Guests", type: "number" },
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "status",
      label: "Status",
      type: "select",
      // "Booked" is set automatically whenever a guest books the room
      // (kept here so it displays correctly when editing); it is also
      // cleared automatically back to "Available" the day after the
      // stay's checkout date - no manual action required.
      options: ["Available", "Booked", "Occupied", "Maintenance"],
    },

    // ---- New fields ----
    { key: "maxPersons", label: "Max Persons Allowed", type: "number", required: false },
    {
      key: "morningFood",
      label: "Morning Meal",
      type: "text",
      required: false,
      placeholder: "e.g. Continental Breakfast (leave blank if not included)",
    },
    {
      key: "afternoonFood",
      label: "Afternoon Meal",
      type: "text",
      required: false,
      placeholder: "e.g. Set Lunch (leave blank if not included)",
    },
    {
      key: "eveningFood",
      label: "Evening Meal",
      type: "text",
      required: false,
      placeholder: "e.g. Set Dinner (leave blank if not included)",
    },
    { key: "wifi", label: "Wifi", type: "checkbox" },
    { key: "tv", label: "TV", type: "checkbox" },
    { key: "ac", label: "AC", type: "checkbox" },
    {
      key: "availableFrom",
      label: "Available From (if Booked/Occupied/Maintenance)",
      type: "date",
      required: false,
    },

    // ---- Offer (discount) fields ----
    {
      key: "offerPercent",
      label: "Offer % Off (numbers only)",
      type: "percent",
      required: false,
      placeholder: "e.g. 20",
      helpText: "Leave blank to remove any offer on this room.",
    },
    {
      key: "offerExpiry",
      label: "Offer Expires On",
      type: "datetime-local",
      required: false,
      helpText: "After this date & time the offer is removed automatically.",
    },
  ],
},
  dining: {
    title: "Food & Drinks",
    singular: "Outlet",
    hasImage: true,
    fields: [
      { key: "name", label: "Outlet name", type: "text" },
      { key: "cuisine", label: "Cuisine", type: "text" },
      { key: "hours", label: "Open hours", type: "text" },
      { key: "seats", label: "Seats", type: "number" },
      {
        key: "entranceFee",
        label: "Entrance Fee (₹ per guest)",
        type: "number",
        placeholder: "e.g. 50",
      },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Open", "Closed", "Private event"] },
    ],
  },

  experiences: {
    title: "Experiences",
    singular: "Experience",
    hasImage: true,
    fields: [
      { key: "name", label: "Experience name", type: "text" },
      { key: "duration", label: "Duration (e.g. 3 hours)", type: "text" },
      { key: "price", label: "Price", type: "number" },
      { key: "slotsLeft", label: "Slots left", type: "number" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Sold out", "Draft"] },

      // ---- Offer (discount) fields ----
      {
        key: "offerPercent",
        label: "Offer % Off (numbers only)",
        type: "percent",
        required: false,
        placeholder: "e.g. 25",
        helpText: "Leave blank to remove any offer on this experience.",
      },
      {
        key: "offerExpiry",
        label: "Offer Expires On",
        type: "datetime-local",
        required: false,
        helpText: "After this date & time the offer is removed automatically.",
      },
    ],
  },

  bookings: {
  title: "Bookings",
  singular: "Booking",
  hasImage: false,
  fields: [
    { key: "guest", label: "Guest", type: "text" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: ["rooms", "dining", "experience"],
    },
    { key: "itemName", label: "Item", type: "text" },

    { key: "checkIn", label: "Check-in", type: "date", required: false },
    { key: "checkOut", label: "Check-out", type: "date", required: false },

    { key: "bookingDate", label: "Booking date", type: "date", required: false },

    { key: "reservationTime", label: "Time", type: "text", required: false },
    { key: "guests", label: "Guests", type: "number", required: false },

    { key: "amount", label: "Amount", type: "number" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Pending", "Confirmed", "Cancelled"],
    },
  ],
},
  users: {
    title: "Users",
    singular: "User",
    hasImage: false,
   
    fields: [
      { key: "username", label: "Username", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "role", label: "Role", type: "select", options: ["ADMIN", "USER"] },
      { key: "password", label: "Password (leave blank to keep unchanged)", type: "text" },
    ],
  },
};
