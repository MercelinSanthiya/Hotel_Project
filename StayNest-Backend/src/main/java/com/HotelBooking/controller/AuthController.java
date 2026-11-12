package com.HotelBooking.controller;

import com.HotelBooking.responseEntity.ApiResponse;
import com.HotelBooking.responseEntity.AuthResponse;
import com.HotelBooking.responseEntity.LoginRequest;
import com.HotelBooking.responseEntity.RegisterRequest;
import com.HotelBooking.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register called for username='{}'", request.getUsername());

        AuthResponse response = authService.register(request);

        log.info("Registration response ready for username='{}'", response.getUsername());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        
        log.info("POST /api/auth/login called for email='{}'", request.getEmail());

        AuthResponse response = authService.login(request);

        log.info("Login response ready for username='{}'", response.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}