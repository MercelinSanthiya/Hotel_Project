package com.HotelBooking.serviceimpl;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.Room;
import com.HotelBooking.exception.BadRequestException;
import com.HotelBooking.exception.ResourceNotFoundException;
import com.HotelBooking.repository.RoomRepository;
import com.HotelBooking.responseEntity.RoomRequest;
import com.HotelBooking.service.FileStorageService;
import com.HotelBooking.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {

    private static final Logger log = LoggerFactory.getLogger(RoomServiceImpl.class);

    private final RoomRepository roomRepository;
    private final FileStorageService fileStorageService;
    private final RoomAvailabilityService roomAvailabilityService;

    public RoomServiceImpl(RoomRepository roomRepository,
                            FileStorageService fileStorageService,
                            RoomAvailabilityService roomAvailabilityService) {
        this.roomRepository = roomRepository;
        this.fileStorageService = fileStorageService;
        this.roomAvailabilityService = roomAvailabilityService;
    }

    @Override
    public List<Room> getAllRooms() {
        log.debug("Fetching all rooms from repository");
        // Auto-release any rooms whose checkout date has passed so the
        // list always reflects real-time availability (blocked through
        // checkout date, bookable again from the day after).
        roomAvailabilityService.releaseExpiredRooms();
        List<Room> rooms = roomRepository.findAll();
        rooms.forEach(this::clearOfferIfExpired);
        return rooms;
    }

    @Override
    public Room getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Room not found: id={}", id);
                    return new ResourceNotFoundException("Room not found: " + id);
                });
        clearOfferIfExpired(room);
        return roomAvailabilityService.releaseIfExpired(room);
    }

    /**
     * If this room has an offer whose expiry date/time has passed, clear
     * it (both in memory and in the database) so it disappears from the
     * home page / offers section automatically - no manual admin action
     * required.
     */
    private void clearOfferIfExpired(Room room) {
        if (room == null || room.getOfferPercent() == null) return;
        String expiry = room.getOfferExpiry();
        if (expiry == null || expiry.isBlank()) return;
        try {
            LocalDateTime expiryDateTime = LocalDateTime.parse(expiry);
            if (LocalDateTime.now().isAfter(expiryDateTime)) {
                room.setOfferPercent(null);
                room.setOfferExpiry(null);
                roomRepository.save(room);
                log.info("Offer on room '{}' (id={}) auto-expired and was cleared", room.getName(), room.getId());
            }
        } catch (Exception e) {
            log.warn("Could not parse offerExpiry '{}' for room id={} - leaving offer as-is", expiry, room.getId());
        }
    }

    @Override
    public Room createRoom(RoomRequest request) {
        log.info("Creating room '{}', category='{}', price={}, capacity={}",
                request.getName(), request.getCategory(), request.getPrice(), request.getCapacity());

        validate(request);
        if (request.getImage() == null || request.getImage().isEmpty()) {
            throw new BadRequestException("A room photo is required");
        }

        Room room = new Room();
        room.setName(request.getName());
        room.setCategory(request.getCategory());
        room.setPrice(request.getPrice());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setStatus(request.getStatus());

      
        room.setImageUrl(fileStorageService.store(request.getImage(), AppConstants.ROOMS_IMAGE_FOLDER));

    
        room.setMorningFood(request.getMorningFood());
        room.setAfternoonFood(request.getAfternoonFood());
        room.setEveningFood(request.getEveningFood());
        room.setMaxPersons(request.getMaxPersons());
        room.setWifi(request.getWifi() != null && request.getWifi());
        room.setTv(request.getTv() != null && request.getTv());
        room.setAc(request.getAc() != null && request.getAc());
        room.setAvailableFrom(request.getAvailableFrom());
        applyOffer(room, request.getOfferPercent(), request.getOfferExpiry());

        Room saved = roomRepository.save(room);
        log.info("Room saved successfully: id={}, name='{}'", saved.getId(), saved.getName());

        return saved;
    }

    @Override
    public Room updateRoom(Long id, RoomRequest request) {
        log.info("Updating room id={}", id);

        validate(request);
        Room room = getRoomById(id);

        // Guard the root cause of duplicate bookings: don't let an admin
        // edit push this room back to "Available" while the Bookings
        // table shows it's still actively held by a guest through their
        // checkout date. Cancel/complete that booking first, or the room
        // will free itself automatically the day after checkout.
        boolean adminWantsAvailable = "available".equalsIgnoreCase(request.getStatus());
        if (adminWantsAvailable && roomAvailabilityService.isActivelyBooked(id)) {
            throw new BadRequestException(
                    "This room still has an active booking through its checkout date - "
                            + "cancel that booking (or wait until the day after checkout) before marking it Available.");
        }

        room.setName(request.getName());
        room.setCategory(request.getCategory());
        room.setPrice(request.getPrice());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setStatus(request.getStatus());

        room.setMorningFood(request.getMorningFood());
        room.setAfternoonFood(request.getAfternoonFood());
        room.setEveningFood(request.getEveningFood());
        room.setMaxPersons(request.getMaxPersons());
        room.setWifi(request.getWifi() != null && request.getWifi());
        room.setTv(request.getTv() != null && request.getTv());
        room.setAc(request.getAc() != null && request.getAc());
        room.setAvailableFrom(request.getAvailableFrom());
        applyOffer(room, request.getOfferPercent(), request.getOfferExpiry());

       
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            fileStorageService.delete(room.getImageUrl());
            room.setImageUrl(fileStorageService.store(request.getImage(), AppConstants.ROOMS_IMAGE_FOLDER));
        }

        Room saved = roomRepository.save(room);
        log.info("Room id={} updated successfully", saved.getId());

        return saved;
    }

    @Override
    public void deleteRoom(Long id) {
        log.info("Deleting room id={}", id);

        Room room = getRoomById(id);
        roomRepository.delete(room);

        log.info("Room id={} deleted successfully", id);
    }

    private void validate(RoomRequest request) {
        if (request == null) {
            throw new BadRequestException("Room request must not be null");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Room name is required");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new BadRequestException("Room category is required");
        }
        if (request.getPrice() == null || request.getPrice() < 0) {
            throw new BadRequestException("Room price must be a non-negative number");
        }
        if (request.getCapacity() == null || request.getCapacity() <= 0) {
            throw new BadRequestException("Room capacity must be a positive number");
        }
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            throw new BadRequestException("Room status is required");
        }
        if (request.getOfferPercent() != null) {
            if (request.getOfferPercent() < 0 || request.getOfferPercent() > 100) {
                throw new BadRequestException("Offer percent must be between 0 and 100");
            }
            if (request.getOfferExpiry() == null || request.getOfferExpiry().isBlank()) {
                throw new BadRequestException("Please set an expiry date/time for the offer");
            }
            try {
                LocalDateTime.parse(request.getOfferExpiry());
            } catch (Exception e) {
                throw new BadRequestException("Offer expiry must be a valid date/time");
            }
        }
    }

    /**
     * Sets (or clears) the offer on a room. An empty/zero percent clears
     * the offer entirely so admins can remove it at any time.
     */
    private void applyOffer(Room room, Integer offerPercent, String offerExpiry) {
        if (offerPercent == null || offerPercent <= 0) {
            room.setOfferPercent(null);
            room.setOfferExpiry(null);
            return;
        }
        room.setOfferPercent(offerPercent);
        room.setOfferExpiry(offerExpiry);
    }
}