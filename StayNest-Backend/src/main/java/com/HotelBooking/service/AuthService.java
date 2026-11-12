package com.HotelBooking.service;

import com.HotelBooking.responseEntity.AuthResponse;
import com.HotelBooking.responseEntity.LoginRequest;
import com.HotelBooking.responseEntity.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}