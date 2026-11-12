package com.HotelBooking.scheduler;

import com.HotelBooking.serviceimpl.RoomAvailabilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background safety net that guarantees a booked room automatically
 * becomes available to ALL users again once its checkout date has
 * passed - even on days nobody happens to browse the rooms list
 * (which would otherwise be the only trigger for the release check).
 */
@Component
public class RoomAvailabilityScheduler {

    private static final Logger log = LoggerFactory.getLogger(RoomAvailabilityScheduler.class);

    private final RoomAvailabilityService roomAvailabilityService;

    public RoomAvailabilityScheduler(RoomAvailabilityService roomAvailabilityService) {
        this.roomAvailabilityService = roomAvailabilityService;
    }

    // Runs every hour, and also right at midnight, so a room frees up
    // for booking the same day its "available from" date arrives.
    @Scheduled(cron = "0 0 * * * *")
    public void releaseExpiredRoomBookings() {
        log.debug("Scheduled sweep: releasing any rooms whose checkout date has passed");
        roomAvailabilityService.releaseExpiredRooms();
    }
}
