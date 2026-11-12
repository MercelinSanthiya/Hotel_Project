package com.HotelBooking.controller;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.Experience;
import com.HotelBooking.exception.BadRequestException;
import com.HotelBooking.exception.ResourceNotFoundException;
import com.HotelBooking.responseEntity.ApiResponse;
import com.HotelBooking.responseEntity.ExperienceRequest;
import com.HotelBooking.service.ExperienceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(AppConstants.EXPERIENCES_BASE)
public class ExperienceController {

    private static final Logger log = LoggerFactory.getLogger(ExperienceController.class);

    private final ExperienceService experienceService;

    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Experience>>> getAll() {
        log.info("API called: Get All Experiences");

        List<Experience> experiences = experienceService.getAllExperiences();

        
        return ResponseEntity.ok(ApiResponse.success(experiences));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Experience>> getOne(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid experience ID: " + id);
        }

        log.info("API called: Get Experience by id: {}", id);

        Experience experience = experienceService.getExperienceById(id);
        return ResponseEntity.ok(ApiResponse.success(experience));
    }

    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Experience>> create(@ModelAttribute ExperienceRequest request) {

        if (request == null) {
            throw new BadRequestException("Experience request must not be null");
        }

        log.info("API called: Create Experience, name='{}'", request.getName());

        Experience created = experienceService.createExperience(request);

        log.info("Experience created successfully: id={}, name='{}'", created.getId(), created.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Experience created successfully", created));
    }

    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Experience>> update(
            @PathVariable Long id,
            @ModelAttribute ExperienceRequest request) {

        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid experience ID: " + id);
        }
        if (request == null) {
            throw new BadRequestException("Experience update data must not be null");
        }

        log.info("API called: Update Experience id: {}", id);

        Experience existing = experienceService.getExperienceById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("Experience not found: " + id);
        }

        Experience updated = experienceService.updateExperience(id, request);

        log.info("Experience updated successfully for id: {}", id);

        return ResponseEntity.ok(ApiResponse.success("Experience updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {

        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid experience ID: " + id);
        }

        log.warn("API called: Delete Experience id: {}", id);

        Experience existing = experienceService.getExperienceById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("Experience not found: " + id);
        }

        experienceService.deleteExperience(id);

        log.info("Experience deleted successfully id: {}", id);

        return ResponseEntity.ok(ApiResponse.success("Experience deleted successfully", null));
    }
}