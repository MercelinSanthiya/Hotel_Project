package com.HotelBooking.serviceimpl;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.DiningOutlet;
import com.HotelBooking.exception.BadRequestException;
import com.HotelBooking.exception.ResourceNotFoundException;
import com.HotelBooking.repository.DiningOutletRepository;
import com.HotelBooking.responseEntity.DiningRequest;
import com.HotelBooking.service.DiningService;
import com.HotelBooking.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiningServiceImpl implements DiningService {

    private static final Logger log = LoggerFactory.getLogger(DiningServiceImpl.class);

    private final DiningOutletRepository diningOutletRepository;
    private final FileStorageService fileStorageService;

    public DiningServiceImpl(DiningOutletRepository diningOutletRepository, FileStorageService fileStorageService) {
        this.diningOutletRepository = diningOutletRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<DiningOutlet> getAllOutlets() {
        log.debug("Fetching all dining outlets from repository");
        return diningOutletRepository.findAll();
    }

    @Override
    public DiningOutlet getOutletById(Long id) {
        return diningOutletRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Dining outlet not found: id={}", id);
                    return new ResourceNotFoundException("Food & Drinks outlet not found: " + id);
                });
    }

    @Override
    public DiningOutlet createOutlet(DiningRequest request) {
        log.info("Creating dining outlet '{}', cuisine='{}', seats={}",
                request.getName(), request.getCuisine(), request.getSeats());

        validate(request);

        DiningOutlet outlet = new DiningOutlet();
        outlet.setName(request.getName());
        outlet.setCuisine(request.getCuisine());
        outlet.setHours(request.getHours());
        outlet.setSeats(request.getSeats());
        outlet.setDescription(request.getDescription());
        outlet.setStatus(request.getStatus());
        outlet.setEntranceFee(request.getEntranceFee() != null ? request.getEntranceFee() : 0d);

      
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            outlet.setImageUrl(fileStorageService.store(request.getImage(), AppConstants.DINING_IMAGE_FOLDER));
        }

        DiningOutlet saved = diningOutletRepository.save(outlet);
        log.info("Dining outlet saved successfully: id={}, name='{}'", saved.getId(), saved.getName());

        return saved;
    }

    @Override
    public DiningOutlet updateOutlet(Long id, DiningRequest request) {
        log.info("Updating dining outlet id={}", id);

        validate(request);
        DiningOutlet outlet = getOutletById(id);

        outlet.setName(request.getName());
        outlet.setCuisine(request.getCuisine());
        outlet.setHours(request.getHours());
        outlet.setSeats(request.getSeats());
        outlet.setDescription(request.getDescription());
        outlet.setStatus(request.getStatus());
        outlet.setEntranceFee(request.getEntranceFee() != null ? request.getEntranceFee() : 0d);

        
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            fileStorageService.delete(outlet.getImageUrl());
            outlet.setImageUrl(fileStorageService.store(request.getImage(), AppConstants.DINING_IMAGE_FOLDER));
        }

        DiningOutlet saved = diningOutletRepository.save(outlet);
        log.info("Dining outlet id={} updated successfully", saved.getId());

        return saved;
    }

    @Override
    public void deleteOutlet(Long id) {
        log.info("Deleting dining outlet id={}", id);

        DiningOutlet outlet = getOutletById(id);
        diningOutletRepository.delete(outlet);

        log.info("Dining outlet id={} deleted successfully", id);
    }

    private void validate(DiningRequest request) {
        if (request == null) {
            throw new BadRequestException("Dining outlet request must not be null");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Outlet name is required");
        }
        if (request.getCuisine() == null || request.getCuisine().isBlank()) {
            throw new BadRequestException("Cuisine is required");
        }
        if (request.getHours() == null || request.getHours().isBlank()) {
            throw new BadRequestException("Open hours are required");
        }
        if (request.getSeats() == null || request.getSeats() <= 0) {
            throw new BadRequestException("Seats must be a positive number");
        }
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            throw new BadRequestException("Status is required");
        }
        if (request.getEntranceFee() == null || request.getEntranceFee() < 0) {
            throw new BadRequestException("Entrance fee must be a non-negative number");
        }
    }
}