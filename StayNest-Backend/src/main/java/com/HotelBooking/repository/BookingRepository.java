package com.HotelBooking.repository;

import com.HotelBooking.entity.Booking;
import com.HotelBooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserOrderByIdDesc(User user);
    List<Booking> findByUserId(Long userId);

    // All bookings ever made for a given room - used to authoritatively
    // determine whether the room is currently held by an active booking,
    // independent of the (mutable, admin-editable) Room.status flag.
    List<Booking> findByRoom_Id(Long roomId);
}
