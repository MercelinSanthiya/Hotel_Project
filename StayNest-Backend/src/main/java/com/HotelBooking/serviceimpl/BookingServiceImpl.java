package com.HotelBooking.serviceimpl;

import com.HotelBooking.entity.*;
import com.HotelBooking.exception.ApiException;
import com.HotelBooking.exception.BadRequestException;
import com.HotelBooking.exception.ForbiddenException;
import com.HotelBooking.exception.ResourceNotFoundException;
import com.HotelBooking.repository.*;
import com.HotelBooking.service.BookingService;
import com.HotelBooking.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

  
    private static final Set<String> ROOM_RELEASING_STATUSES = Set.of("cancelled", "failed");

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final DiningOutletRepository diningOutletRepository;
    private final ExperienceRepository experienceRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final RoomAvailabilityService roomAvailabilityService;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              RoomRepository roomRepository,
                              DiningOutletRepository diningOutletRepository,
                              ExperienceRepository experienceRepository,
                              UserService userService, EmailService emailService,
                              RoomAvailabilityService roomAvailabilityService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.diningOutletRepository = diningOutletRepository;
        this.experienceRepository = experienceRepository;
        this.userService = userService;
        this.emailService=emailService;
        this.roomAvailabilityService = roomAvailabilityService;
    }

    @Override
    public List<Booking> getAllBookings() {
        log.debug("Fetching all bookings from repository");
        return bookingRepository.findAll();
    }

    @Override
    public List<Booking> getBookingsForCurrentUser() {
        User user = userService.getCurrentUser();
        log.debug("Fetching bookings for user id={}", user.getId());
        LocalDate today = LocalDate.now();

        // A booking the user cancelled stays visible to them on the day
        // they cancelled it (so they still see the "Cancelled" status
        // right after tapping Cancel), then drops off the list starting
        // the next day - mirroring the room auto-release pattern used
        // elsewhere in this codebase.
        return bookingRepository.findByUserOrderByIdDesc(user).stream()
                .filter(b -> {
                    if (!"cancelled".equalsIgnoreCase(b.getStatus())) return true;
                    if (b.getCancelledDate() == null || b.getCancelledDate().isBlank()) return true;
                    try {
                        LocalDate cancelledOn = LocalDate.parse(b.getCancelledDate());
                        return !today.isAfter(cancelledOn);
                    } catch (Exception e) {
                        return true;
                    }
                })
                .toList();
    }

    @Override
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Booking not found: id={}", id);
                    return new ResourceNotFoundException("Booking not found: " + id);
                });
    }

    @Override
    @Transactional
    public Booking createBooking(Booking booking) {
        User currentUser = userService.getCurrentUser();
        log.info("Creating booking for user id={}, category='{}'", currentUser.getId(), booking.getCategory());

        validate(booking);

        String category = booking.getCategory().toLowerCase();

        switch (category) {
            case "rooms" -> {
                Room room = roomRepository.findById(requireItemId(booking))
                        .orElseThrow(() -> {
                            log.warn("Room not found: id={}", booking.getItemId());
                            return new ResourceNotFoundException("Room not found: " + booking.getItemId());
                        });

                // Self-heal the display flag, then run the AUTHORITATIVE
                // check against the Bookings table itself. This is what
                // actually decides whether the room can be booked - it
                // does not rely solely on room.getStatus(), which can be
                // (and has been) desynced by an admin edit or a race
                // condition, letting two guests book the same room. A
                // room becomes bookable again either when its one active
                // booking is cancelled, or automatically the day after
                // that booking's checkout date.
                room = roomAvailabilityService.releaseIfExpired(room);
                roomAvailabilityService.assertBookable(room);
                room.setStatus("Booked");

              
                LocalDate checkOutDate = LocalDate.parse(booking.getCheckOut());
                room.setAvailableFrom(checkOutDate.plusDays(1));

                roomRepository.save(room);
                booking.setRoom(room);
                booking.setItemName(room.getName());
                log.info("Room '{}' (id={}) marked as Booked, availableFrom={}",
                        room.getName(), room.getId(), room.getAvailableFrom());
            }
            case "dining" -> {
                DiningOutlet outlet = diningOutletRepository.findById(requireItemId(booking))
                        .orElseThrow(() -> {
                            log.warn("Dining outlet not found: id={}", booking.getItemId());
                            return new ResourceNotFoundException("Food & Drinks outlet not found: " + booking.getItemId());
                        });
                booking.setDiningOutlet(outlet);
                booking.setItemName(outlet.getName());
            }
            case "experience" -> {
                Experience experience = experienceRepository.findById(requireItemId(booking))
                        .orElseThrow(() -> {
                            log.warn("Experience not found: id={}", booking.getItemId());
                            return new ResourceNotFoundException("Experience not found: " + booking.getItemId());
                        });
                booking.setExperience(experience);
                booking.setItemName(experience.getName());
            }
            default -> {
                log.warn("Unknown booking category attempted: '{}'", booking.getCategory());
                throw new BadRequestException("Unknown booking category: " + booking.getCategory());
            }
        }

        booking.setId(null);
        booking.setUser(currentUser);
        if (booking.getGuest() == null || booking.getGuest().isBlank()) {
            booking.setGuest(currentUser.getUsername());
        }
        booking.setStatus("Pending");
        booking.setCancelledBy(null);
        booking.setCancelledDate(null);
        if (booking.getAmount() == null) {
            booking.setAmount(0d);
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created successfully: id={}, category='{}', itemName='{}', user='{}'",
                saved.getId(), saved.getCategory(), saved.getItemName(), currentUser.getUsername());

        emailService.sendBookingNotificationToAdmin(saved);
        emailService.sendBookingConfirmationToUser(saved);

        return saved;
    }

    @Override
    @Transactional
    public Booking updateBooking(Long id, Booking updated) {
        log.info("Updating booking id={}", id);

        Booking booking = getBookingById(id);
        validate(updated);

        String oldStatus = booking.getStatus();
        String newStatus = (updated.getStatus() != null && !updated.getStatus().isBlank())
                ? updated.getStatus()
                : oldStatus;

        boolean wasReleasing = isRoomReleasingStatus(oldStatus);
        boolean nowReleasing = isRoomReleasingStatus(newStatus);
        boolean isRoomBooking = "rooms".equalsIgnoreCase(booking.getCategory()) && booking.getRoom() != null;

        // Reactivating a previously cancelled/failed booking (e.g. an
        // admin flips it from "Cancelled" back to "Pending"/"Confirmed").
        // Guard against re-locking a room that another booking has since
        // taken - otherwise we'd recreate the exact duplicate-booking bug.
        if (isRoomBooking && wasReleasing && !nowReleasing) {
            if (roomAvailabilityService.isActivelyBookedByOther(booking.getRoom().getId(), booking.getId())) {
                log.warn("Refusing to reactivate booking id={} - room id={} is already held by another booking",
                        booking.getId(), booking.getRoom().getId());
                throw new ApiException("Can't reactivate this booking - the room is already booked by someone else");
            }
        }

        booking.setGuest(updated.getGuest());
        booking.setCategory(updated.getCategory());
        booking.setItemName(updated.getItemName());
        booking.setCheckIn(updated.getCheckIn());
        booking.setCheckOut(updated.getCheckOut());
        booking.setBookingDate(updated.getBookingDate());
        booking.setReservationTime(updated.getReservationTime());
        booking.setGuests(updated.getGuests());
        booking.setAmount(updated.getAmount() != null ? updated.getAmount() : 0d);
        booking.setStatus(newStatus);

        // An admin manually changing the status is an admin action, not a
        // guest self-cancellation - clear any stale "cancelled by user"
        // note if the booking is being reactivated, and stamp an admin
        // cancellation distinctly from a user-initiated one.
        if (!wasReleasing && nowReleasing) {
            booking.setCancelledBy("admin");
            booking.setCancelledDate(LocalDate.now().toString());
        } else if (wasReleasing && !nowReleasing) {
            booking.setCancelledBy(null);
            booking.setCancelledDate(null);
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Booking id={} updated successfully, status='{}'", saved.getId(), saved.getStatus());

        if (isRoomBooking) {
            Room room = saved.getRoom();
            if (!wasReleasing && nowReleasing) {
                // Cancelled/failed - free the room immediately.
                room.setStatus("Available");
                room.setAvailableFrom(null);
                roomRepository.save(room);
                log.info("Room '{}' (id={}) released back to Available - booking id={} status changed to '{}'",
                        room.getName(), room.getId(), saved.getId(), saved.getStatus());
            } else if (wasReleasing && !nowReleasing) {
                // Reactivated - re-lock the room through its checkout date.
                room.setStatus("Booked");
                if (saved.getCheckOut() != null && !saved.getCheckOut().isBlank()) {
                    room.setAvailableFrom(LocalDate.parse(saved.getCheckOut()).plusDays(1));
                }
                roomRepository.save(room);
                log.info("Room '{}' (id={}) re-locked as Booked - booking id={} reactivated to status '{}'",
                        room.getName(), room.getId(), saved.getId(), saved.getStatus());
            }
        }

        return saved;
    }

    @Override
    @Transactional
    public Booking cancelBookingByUser(Long id) {
        User currentUser = userService.getCurrentUser();
        Booking booking = getBookingById(id);

        if (booking.getUser() == null || !booking.getUser().getId().equals(currentUser.getId())) {
            log.warn("User id={} attempted to cancel booking id={} that does not belong to them",
                    currentUser.getId(), id);
            throw new ForbiddenException("You can only cancel your own bookings");
        }

        if (!"pending".equalsIgnoreCase(booking.getStatus())) {
            throw new BadRequestException("Only pending bookings can be cancelled");
        }

        booking.setStatus("Cancelled");
        booking.setCancelledBy("user");
        booking.setCancelledDate(LocalDate.now().toString());

        Booking saved = bookingRepository.save(booking);

        if ("rooms".equalsIgnoreCase(saved.getCategory()) && saved.getRoom() != null) {
            Room room = saved.getRoom();
            if (!roomAvailabilityService.isActivelyBookedByOther(room.getId(), saved.getId())) {
                room.setStatus("Available");
                room.setAvailableFrom(null);
                roomRepository.save(room);
                log.info("Room '{}' (id={}) released back to Available - booking id={} cancelled by user",
                        room.getName(), room.getId(), saved.getId());
            }
        }

        log.info("Booking id={} cancelled by user id={}", saved.getId(), currentUser.getId());
        return saved;
    }

    @Override
    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);

        if (!isRoomReleasingStatus(booking.getStatus())
                && "rooms".equalsIgnoreCase(booking.getCategory())
                && booking.getRoom() != null) {
            Room room = booking.getRoom();
            // Only release the room if no OTHER active booking still
            // holds it (guards against clobbering a legitimate booking
            // when cleaning up a stray duplicate).
            if (!roomAvailabilityService.isActivelyBookedByOther(room.getId(), booking.getId())) {
                room.setStatus("Available");
                room.setAvailableFrom(null);
                roomRepository.save(room);
                log.info("Room '{}' (id={}) released back to Available - booking id={} deleted",
                        room.getName(), room.getId(), id);
            }
        }

        bookingRepository.deleteById(id);
        log.info("Booking id={} deleted", id);
    }

    private Long requireItemId(Booking booking) {
        if (booking.getItemId() == null) {
            log.warn("itemId missing for category='{}'", booking.getCategory());
            throw new BadRequestException("itemId is required for " + booking.getCategory() + " bookings");
        }
        return booking.getItemId();
    }

    private boolean isRoomReleasingStatus(String status) {
        return status != null && ROOM_RELEASING_STATUSES.contains(status.toLowerCase());
    }

  
    private void validate(Booking booking) {
        if (booking.getCategory() == null || booking.getCategory().isBlank()) {
            throw new BadRequestException("Category is required");
        }
        String category = booking.getCategory().toLowerCase();
        boolean needsStayDates = category.equals("rooms");
        boolean needsBookingDate = category.equals("dining") || category.equals("experience");

        if (needsStayDates) {
            if (booking.getCheckIn() == null || booking.getCheckOut() == null) {
                throw new BadRequestException("Check-in and check-out dates are required");
            }
            LocalDate in;
            LocalDate out;
            try {
                in = LocalDate.parse(booking.getCheckIn());
                out = LocalDate.parse(booking.getCheckOut());
            } catch (Exception e) {
                throw new BadRequestException("Dates must be in YYYY-MM-DD format");
            }
            if (in.isBefore(LocalDate.now())) {
                throw new BadRequestException("Check-in cannot be in the past");
            }
            if (!out.isAfter(in)) {
                throw new BadRequestException("Check-out must be at least one day after check-in");
            }
        } else if (needsBookingDate) {
            if (booking.getBookingDate() == null || booking.getBookingDate().isBlank()) {
                throw new BadRequestException(
                        category.equals("dining") ? "Reservation date is required" : "Date is required");
            }
            LocalDate date;
            try {
                date = LocalDate.parse(booking.getBookingDate());
            } catch (Exception e) {
                throw new BadRequestException("Date must be in YYYY-MM-DD format");
            }
            if (date.isBefore(LocalDate.now())) {
                throw new BadRequestException("Date cannot be in the past");
            }
            if (booking.getReservationTime() == null || booking.getReservationTime().isBlank()) {
                throw new BadRequestException(
                        category.equals("dining") ? "Reservation time is required" : "Start time is required");
            }
        }
    }
}
