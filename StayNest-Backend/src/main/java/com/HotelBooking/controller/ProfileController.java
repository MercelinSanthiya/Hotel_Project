package com.HotelBooking.controller;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.Booking;
import com.HotelBooking.responseEntity.ApiResponse;
import com.HotelBooking.responseEntity.BookingResponse;
import com.HotelBooking.responseEntity.UserResponse;
import com.HotelBooking.service.BookingService;
import com.HotelBooking.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(AppConstants.PROFILE_BASE)
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    private final UserService userService;
    private final BookingService bookingService;

    public ProfileController(UserService userService, BookingService bookingService) {
        this.userService = userService;
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile() {
        log.info("API called: Get My Profile");

        UserResponse profile = userService.getCurrentUserProfile();

        log.info("Profile fetched successfully for username='{}'", profile.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        log.info("API called: Get My Bookings");

        List<Booking> bookings = bookingService.getBookingsForCurrentUser();
        List<BookingResponse> response = bookings.stream().map(BookingResponse::from).toList();

        log.info("Fetched {} bookings for current user", response.size());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}