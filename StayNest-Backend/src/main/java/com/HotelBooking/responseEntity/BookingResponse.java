package com.HotelBooking.responseEntity;

import com.HotelBooking.entity.Booking;

public class BookingResponse {

    private Long id;
    private String guest;
    private Long userId;
    private String username;
    private String category;
    private Long itemId;
    private String itemName;

  
    private String checkIn;
    private String checkOut;


    private String bookingDate;


    private String reservationTime;
    private Integer guests;

    private Double amount;
    private String status;
    private String cancelledBy;
    private String cancelledDate;

    public static BookingResponse from(Booking booking) {
        BookingResponse dto = new BookingResponse();
        dto.id = booking.getId();
        dto.guest = booking.getGuest();
        dto.userId = booking.getUser() != null ? booking.getUser().getId() : null;
        dto.username = booking.getUser() != null ? booking.getUser().getUsername() : null;
        dto.category = booking.getCategory();
        dto.itemName = booking.getItemName();
        dto.checkIn = booking.getCheckIn();
        dto.checkOut = booking.getCheckOut();
        dto.bookingDate = booking.getBookingDate();
        dto.reservationTime = booking.getReservationTime();
        dto.guests = booking.getGuests();
        dto.amount = booking.getAmount();
        dto.status = booking.getStatus();
        dto.cancelledBy = booking.getCancelledBy();
        dto.cancelledDate = booking.getCancelledDate();

        if (booking.getRoom() != null) dto.itemId = booking.getRoom().getId();
        else if (booking.getDiningOutlet() != null) dto.itemId = booking.getDiningOutlet().getId();
        else if (booking.getExperience() != null) dto.itemId = booking.getExperience().getId();

        return dto;
    }

    public Long getId() { return id; }
    public String getGuest() { return guest; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getCategory() { return category; }
    public Long getItemId() { return itemId; }
    public String getItemName() { return itemName; }
    public String getCheckIn() { return checkIn; }
    public String getCheckOut() { return checkOut; }
    public String getBookingDate() { return bookingDate; }
    public String getReservationTime() { return reservationTime; }
    public Integer getGuests() { return guests; }
    public Double getAmount() { return amount; }
    public String getStatus() { return status; }
    public String getCancelledBy() { return cancelledBy; }
    public String getCancelledDate() { return cancelledDate; }
}