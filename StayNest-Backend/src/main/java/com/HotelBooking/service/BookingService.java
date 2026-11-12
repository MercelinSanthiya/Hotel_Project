package com.HotelBooking.service;

import com.HotelBooking.entity.Booking;

import java.util.List;

public interface BookingService {
    List<Booking> getAllBookings();
    List<Booking> getBookingsForCurrentUser();
    Booking getBookingById(Long id);
    Booking createBooking(Booking booking);
    Booking updateBooking(Long id, Booking updated);
    Booking cancelBookingByUser(Long id);
    void deleteBooking(Long id);
}
