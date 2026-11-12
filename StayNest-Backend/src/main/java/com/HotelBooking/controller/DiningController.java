package com.HotelBooking.controller;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.DiningOutlet;
import com.HotelBooking.exception.BadRequestException;
import com.HotelBooking.exception.ResourceNotFoundException;
import com.HotelBooking.responseEntity.ApiResponse;
import com.HotelBooking.responseEntity.DiningRequest;
import com.HotelBooking.service.DiningService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(AppConstants.DINING_BASE)
public class DiningController {

    private static final Logger log = LoggerFactory.getLogger(DiningController.class);

    private final DiningService diningService;

    public DiningController(DiningService diningService) {
        this.diningService = diningService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DiningOutlet>>> getAll() {
        log.info("API called: Get All Dining Outlets");

        List<DiningOutlet> outlets = diningService.getAllOutlets();

       
        return ResponseEntity.ok(ApiResponse.success(outlets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiningOutlet>> getOne(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid outlet ID: " + id);
        }

        log.info("API called: Get Dining Outlet by id: {}", id);

        DiningOutlet outlet = diningService.getOutletById(id);
        return ResponseEntity.ok(ApiResponse.success(outlet));
    }

    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DiningOutlet>> create(@ModelAttribute DiningRequest request) {

        if (request == null) {
            throw new BadRequestException("Dining outlet request must not be null");
        }

        log.info("API called: Create Dining Outlet, name='{}'", request.getName());

        DiningOutlet created = diningService.createOutlet(request);

        log.info("Dining outlet created successfully: id={}, name='{}'", created.getId(), created.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Outlet created successfully", created));
    }

   
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DiningOutlet>> update(
            @PathVariable Long id,
            @ModelAttribute DiningRequest request) {

        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid outlet ID: " + id);
        }
        if (request == null) {
            throw new BadRequestException("Dining outlet update data must not be null");
        }

        log.info("API called: Update Dining Outlet id: {}", id);

        DiningOutlet existing = diningService.getOutletById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("Food & Drinks outlet not found: " + id);
        }

        DiningOutlet updated = diningService.updateOutlet(id, request);

        log.info("Dining outlet updated successfully for id: {}", id);

        return ResponseEntity.ok(ApiResponse.success("Outlet updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {

        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid outlet ID: " + id);
        }

        log.warn("API called: Delete Dining Outlet id: {}", id);

        DiningOutlet existing = diningService.getOutletById(id);
        if (existing == null) {
            throw new ResourceNotFoundException("Food & Drinks outlet not found: " + id);
        }

        diningService.deleteOutlet(id);

        log.info("Dining outlet deleted successfully id: {}", id);

        return ResponseEntity.ok(ApiResponse.success("Outlet deleted successfully", null));
    }
}