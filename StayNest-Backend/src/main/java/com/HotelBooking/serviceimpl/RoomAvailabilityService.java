package com.HotelBooking.serviceimpl;

import com.HotelBooking.entity.Booking;
import com.HotelBooking.entity.Room;
import com.HotelBooking.exception.ApiException;
import com.HotelBooking.repository.BookingRepository;
import com.HotelBooking.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Single source of truth for room booking availability.
 *
 * A room may only be held by ONE active booking at a time:
 *  - Once a guest books a room, it is blocked for everyone else all the
 *    way through the stay's check-out date (inclusive).
 *  - If that booking is cancelled (or fails), the room is freed
 *    immediately - any other guest can book it right away.
 *  - If the booking is never cancelled (e.g. stays "Confirmed"), the
 *    room still frees itself automatically the day AFTER checkout.
 *
 * IMPORTANT: whether a room is actually held is decided by looking at
 * the Booking table itself (findByRoom_Id), NOT by trusting the
 * Room.status text field alone. Room.status is editable by admins in
 * the Rooms panel (e.g. to mark "Maintenance"), and if it were the only
 * source of truth, an admin edit (or a race condition) could desync it
 * from reality and let two guests book the same room for overlapping
 * dates - exactly the kind of duplicate booking this class prevents.
 * Room.status is still kept up to date for display purposes, but every
 * decision that actually blocks/allows a booking re-checks the Booking
 * table directly.
 */
@Service
public class RoomAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(RoomAvailabilityService.class);

    // Statuses that mean a booking no longer holds the room.
    private static final Set<String> INACTIVE_STATUSES = Set.of("cancelled", "failed");

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomAvailabilityService(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Authoritative check: is there an active booking on this room whose
     * hold (through check-out date) has not yet expired? This is what
     * actually determines whether a NEW booking should be blocked -
     * regardless of what Room.status currently says.
     */
    public boolean isActivelyBooked(Long roomId) {
        if (roomId == null) return false;
        LocalDate today = LocalDate.now();
        List<Booking> bookings = bookingRepository.findByRoom_Id(roomId);
        for (Booking b : bookings) {
            if (isActiveHold(b, today)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Same as {@link #isActivelyBooked(Long)} but excludes one booking id
     * (used when re-checking availability while updating that very
     * booking, so it doesn't block itself).
     */
    public boolean isActivelyBookedByOther(Long roomId, Long excludingBookingId) {
        if (roomId == null) return false;
        LocalDate today = LocalDate.now();
        List<Booking> bookings = bookingRepository.findByRoom_Id(roomId);
        for (Booking b : bookings) {
            if (excludingBookingId != null && excludingBookingId.equals(b.getId())) continue;
            if (isActiveHold(b, today)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Throws if the room cannot accept a new booking right now: either
     * it's under an admin-set state (e.g. Maintenance) or the Booking
     * table shows it's already actively held.
     */
    public void assertBookable(Room room) {
        if (room == null) {
            throw new ApiException("Room not found");
        }
        if ("maintenance".equalsIgnoreCase(room.getStatus())) {
            throw new ApiException("Room is under maintenance: " + room.getName());
        }
        if (isActivelyBooked(room.getId())) {
            throw new ApiException("Room is already booked: " + room.getName());
        }
    }

    private boolean isActiveHold(Booking booking, LocalDate today) {
        String status = booking.getStatus();
        if (status != null && INACTIVE_STATUSES.contains(status.toLowerCase())) {
            return false;
        }
        String checkOut = booking.getCheckOut();
        if (checkOut == null || checkOut.isBlank()) {
            // No checkout date on record - treat conservatively as still active.
            return true;
        }
        try {
            LocalDate checkOutDate = LocalDate.parse(checkOut);
            // Blocked through the checkout date itself; free again the day after.
            return !today.isAfter(checkOutDate);
        } catch (Exception e) {
            log.warn("Could not parse checkOut date '{}' for booking id={} - treating as still active",
                    checkOut, booking.getId());
            return true;
        }
    }

    /**
     * Sweeps every room in the database and syncs its display status
     * (Available/Booked) with reality per the Booking table. Used by the
     * scheduled job and by bulk read paths.
     */
    @Transactional
    public void releaseExpiredRooms() {
        List<Room> rooms = roomRepository.findAll();
        for (Room room : rooms) {
            syncDisplayStatus(room);
        }
    }

    /**
     * Checks a single room and syncs its display status if needed.
     * Returns the same (possibly updated) room instance for convenience.
     */
    @Transactional
    public Room releaseIfExpired(Room room) {
        syncDisplayStatus(room);
        return room;
    }

    /**
     * Keeps Room.status/availableFrom in sync with the authoritative
     * Booking-table check, purely for display in the room list / admin
     * dashboard. Never touches admin-set states like "Maintenance".
     */
    private void syncDisplayStatus(Room room) {
        if (room == null) return;
        if ("maintenance".equalsIgnoreCase(room.getStatus())) {
            return; // admin-managed state, not booking-driven
        }

        boolean activelyBooked = isActivelyBooked(room.getId());
        boolean currentlyShownAvailable = "available".equalsIgnoreCase(room.getStatus());

        if (activelyBooked && currentlyShownAvailable) {
            // Shouldn't normally happen (createBooking sets it directly),
            // but keep the display consistent if it ever drifts.
            room.setStatus("Booked");
            roomRepository.save(room);
            log.info("Room '{}' (id={}) marked Booked - active booking found in Bookings table",
                    room.getName(), room.getId());
        } else if (!activelyBooked && !currentlyShownAvailable) {
            log.info("Auto-releasing room '{}' (id={}) back to Available - no active booking remains",
                    room.getName(), room.getId());
            room.setStatus("Available");
            room.setAvailableFrom(null);
            roomRepository.save(room);
        }
    }
}
