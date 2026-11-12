package com.HotelBooking.service;

import com.HotelBooking.entity.Room;
import com.HotelBooking.responseEntity.RoomRequest;

import java.util.List;

public interface RoomService {
    List<Room> getAllRooms();
    Room getRoomById(Long id);
    Room createRoom(RoomRequest request);
    Room updateRoom(Long id, RoomRequest request);
    void deleteRoom(Long id);
}