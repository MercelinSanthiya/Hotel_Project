package com.HotelBooking.controller;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.responseEntity.UserResponse;
import com.HotelBooking.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(AppConstants.ADMIN_USERS_BASE)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getOne(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.createUser(body));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.updateUser(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
