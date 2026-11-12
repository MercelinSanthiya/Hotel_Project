package com.HotelBooking.service;

import com.HotelBooking.entity.User;
import com.HotelBooking.responseEntity.UserResponse;

import java.util.List;
import java.util.Map;

public interface UserService {

   
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUser(Map<String, String> body);
    UserResponse updateUser(Long id, Map<String, String> body);
    void deleteUser(Long id);

  
    User getCurrentUser();
    UserResponse getCurrentUserProfile();
}
