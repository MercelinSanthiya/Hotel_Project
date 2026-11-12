package com.HotelBooking.controller;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.Booking;
import com.HotelBooking.responseEntity.ApiResponse;
import com.HotelBooking.responseEntity.BookingResponse;
import com.HotelBooking.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.BOOKINGS_BASE)
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAll() {
        log.info("GET {} called - fetching all bookings", AppConstants.BOOKINGS_BASE);

        List<BookingResponse> bookings = bookingService.getAllBookings()
                .stream()
                .map(BookingResponse::from)
                .toList();

        log.info("Fetched {} total bookings", bookings.size());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }


    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMine() {
        log.info("GET {}/me called - fetching bookings for current user", AppConstants.BOOKINGS_BASE);

        List<BookingResponse> bookings = bookingService.getBookingsForCurrentUser()
                .stream()
                .map(BookingResponse::from)
                .toList();

        log.info("Fetched {} bookings for current user", bookings.size());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getOne(@PathVariable Long id) {
        log.info("GET {}/{} called", AppConstants.BOOKINGS_BASE, id);

        BookingResponse booking = BookingResponse.from(bookingService.getBookingById(id));

        return ResponseEntity.ok(ApiResponse.success(booking));
    }


    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(@RequestBody Booking booking) {
        log.info("POST {} called - creating booking, category='{}', itemId={}",
                AppConstants.BOOKINGS_BASE, booking.getCategory(), booking.getItemId());

        BookingResponse created = BookingResponse.from(bookingService.createBooking(booking));

        log.info("Booking created successfully: id={}, category='{}', itemName='{}'",
                created.getId(), created.getCategory(), created.getItemName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", created));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(@PathVariable Long id) {
        log.info("PUT {}/{}/cancel called - guest cancelling own booking", AppConstants.BOOKINGS_BASE, id);

        BookingResponse booking = BookingResponse.from(bookingService.cancelBookingByUser(id));

        log.info("Booking {} cancelled by guest", id);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> update(@PathVariable Long id, @RequestBody Booking updated) {
        log.info("PUT {}/{} called - updating booking", AppConstants.BOOKINGS_BASE, id);

        BookingResponse booking = BookingResponse.from(bookingService.updateBooking(id, updated));

        log.info("Booking {} updated successfully, new status='{}'", id, booking.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Booking updated successfully", booking));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        log.info("DELETE {}/{} called", AppConstants.BOOKINGS_BASE, id);

        bookingService.deleteBooking(id);

        log.info("Booking {} deleted successfully", id);
        return ResponseEntity.ok(ApiResponse.success("Booking deleted successfully", null));
    }
}