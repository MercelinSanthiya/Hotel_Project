package com.HotelBooking.controller;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.Room;
import com.HotelBooking.exception.BadRequestException;
import com.HotelBooking.exception.ResourceNotFoundException;
import com.HotelBooking.responseEntity.ApiResponse;
import com.HotelBooking.responseEntity.RoomRequest;
import com.HotelBooking.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.ROOMS_BASE)
public class RoomController {

    private static final Logger log = LoggerFactory.getLogger(RoomController.class);

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<Room>>> getAll() {
        log.info("API called: Get All Rooms");

        List<Room> rooms = roomService.getAllRooms();

        
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Room>> getOne(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid room ID: " + id);
        }

        log.info("API called: Get Room by id: {}", id);

        Room room = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Room>> create(@ModelAttribute RoomRequest request) {

        if (request == null) {
            throw new BadRequestException("Room request must not be null");
        }

        log.info("API called: Create Room, name='{}'", request.getName());

        Room created = roomService.createRoom(request);

        log.info("Room created successfully: id={}, name='{}'", created.getId(), created.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Room created successfully", created));
    }

    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Room>> update(
            @PathVariable Long id,
            @ModelAttribute RoomRequest request) {

        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid room ID: " + id);
        }
        if (request == null) {
            throw new BadRequestException("Room update data must not be null");
        }

        log.info("API called: Update Room id: {}", id);

        Room existing = roomService.getRoomById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("Room not found: " + id);
        }

        Room updated = roomService.updateRoom(id, request);

        log.info("Room updated successfully for id: {}", id);

        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {

        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid room ID: " + id);
        }

        log.warn("API called: Delete Room id: {}", id);

        Room existing = roomService.getRoomById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("Room not found: " + id);
        }

        roomService.deleteRoom(id);

        log.info("Room deleted successfully id: {}", id);

        return ResponseEntity.ok(ApiResponse.success("Room deleted successfully", null));
    }
}