package com.HotelBooking.serviceimpl;

import com.HotelBooking.entity.Role;
import com.HotelBooking.entity.User;
import com.HotelBooking.exception.ApiException;
import com.HotelBooking.repository.UserRepository;
import com.HotelBooking.responseEntity.UserResponse;
import com.HotelBooking.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        log.debug("Fetching all users from repository");
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Override
    public UserResponse getUserById(Long id) {
        log.debug("Fetching user by id={}", id);
        return UserResponse.from(findEntity(id));
    }

    @Override
    public UserResponse createUser(Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.getOrDefault("password", "changeme123");
        Role role = Role.valueOf(body.getOrDefault("role", "USER").toUpperCase());

        log.info("Admin creating user: username='{}', email='{}', role={}", username, email, role);

        if (username == null || username.isBlank()) {
            log.warn("Create user failed - username missing");
            throw new ApiException("Username is required");
        }
        if (email == null || email.isBlank()) {
            log.warn("Create user failed - email missing");
            throw new ApiException("Email is required");
        }
        if (userRepository.existsByUsername(username)) {
            log.warn("Create user failed - username already taken: '{}'", username);
            throw new ApiException("Username is already taken");
        }
        if (userRepository.existsByEmail(email)) {
            log.warn("Create user failed - email already registered: '{}'", email);
            throw new ApiException("Email is already registered");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        User saved = userRepository.save(user);
        log.info("User created successfully: id={}, username='{}', role={}", saved.getId(), saved.getUsername(), saved.getRole());

        return UserResponse.from(saved);
    }

    @Override
    public UserResponse updateUser(Long id, Map<String, String> body) {
        log.info("Updating user id={}", id);

        User user = findEntity(id);

        if (body.containsKey("email")) {
            user.setEmail(body.get("email"));
        }
        if (body.containsKey("role")) {
            user.setRole(Role.valueOf(body.get("role").toUpperCase()));
        }
        if (body.containsKey("password") && !body.get("password").isBlank()) {
            user.setPassword(passwordEncoder.encode(body.get("password")));
        }

        User saved = userRepository.save(user);
        log.info("User id={} updated successfully", saved.getId());

        return UserResponse.from(saved);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            log.warn("Attempted to delete non-existent user: id={}", id);
            throw new ApiException("User not found: " + id);
        }
        userRepository.deleteById(id);
        log.info("User id={} deleted", id);
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            log.warn("getCurrentUser() called with no authenticated user in context");
            throw new ApiException("You must be logged in to do that");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("Logged-in user could not be resolved from repository: username='{}'", username);
                    return new ApiException("Logged-in user could not be found: " + username);
                });
    }

    @Override
    public UserResponse getCurrentUserProfile() {
        return UserResponse.from(getCurrentUser());
    }

    private User findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found: id={}", id);
                    return new ApiException("User not found: " + id);
                });
    }
}