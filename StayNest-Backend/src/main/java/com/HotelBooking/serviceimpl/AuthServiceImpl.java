package com.HotelBooking.serviceimpl;

import com.HotelBooking.entity.Role;
import com.HotelBooking.entity.User;
import com.HotelBooking.exception.DuplicateResourceException;
import com.HotelBooking.repository.UserRepository;
import com.HotelBooking.responseEntity.AuthResponse;
import com.HotelBooking.responseEntity.LoginRequest;
import com.HotelBooking.responseEntity.RegisterRequest;
import com.HotelBooking.security.JwtUtil;
import com.HotelBooking.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    private UserDetails toUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registration attempt for username='{}', email='{}'", request.getUsername(), request.getEmail());

        if (userRepository.existsByUsername(request.getUsername())) {
            log.warn("Registration failed - username already taken: '{}'", request.getUsername());
            throw new DuplicateResourceException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already registered: '{}'", request.getEmail());
            throw new DuplicateResourceException("Email is already registered");
        }

        Role role = Role.USER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = Role.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                log.warn("Invalid role '{}' supplied during registration, defaulting to USER", request.getRole());
                role = Role.USER;
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        User saved = userRepository.save(user);
        log.info("User registered successfully: id={}, username='{}', role={}", saved.getId(), saved.getUsername(), saved.getRole());

        UserDetails userDetails = toUserDetails(saved);
        String token = jwtUtil.generateToken(userDetails);
        log.debug("JWT token generated for new user '{}'", saved.getUsername());

        return new AuthResponse(token, saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole().name());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email='{}'", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - no user found for email='{}'", request.getEmail());
                    return new BadCredentialsException("Invalid email or password");
                });

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            log.warn("Login failed - bad credentials for email='{}'", request.getEmail());
            throw ex; 
        }

        UserDetails userDetails = toUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        log.info("Login successful for username='{}', email='{}', role={}",
                user.getUsername(), user.getEmail(), user.getRole());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }
}