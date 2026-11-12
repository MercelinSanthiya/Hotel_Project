package com.HotelBooking.serviceimpl;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.entity.Experience;
import com.HotelBooking.exception.BadRequestException;
import com.HotelBooking.exception.ResourceNotFoundException;
import com.HotelBooking.repository.ExperienceRepository;
import com.HotelBooking.responseEntity.ExperienceRequest;
import com.HotelBooking.service.ExperienceService;
import com.HotelBooking.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExperienceServiceImpl implements ExperienceService {

    private static final Logger log = LoggerFactory.getLogger(ExperienceServiceImpl.class);

    private final ExperienceRepository experienceRepository;
    private final FileStorageService fileStorageService;

    public ExperienceServiceImpl(ExperienceRepository experienceRepository, FileStorageService fileStorageService) {
        this.experienceRepository = experienceRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<Experience> getAllExperiences() {
        log.debug("Fetching all experiences from repository");
        List<Experience> experiences = experienceRepository.findAll();
        experiences.forEach(this::clearOfferIfExpired);
        return experiences;
    }

    @Override
    public Experience getExperienceById(Long id) {
        Experience experience = experienceRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Experience not found: id={}", id);
                    return new ResourceNotFoundException("Experience not found: " + id);
                });
        clearOfferIfExpired(experience);
        return experience;
    }

    /**
     * If this experience has an offer whose expiry date/time has passed,
     * clear it (in memory and in the database) so it disappears from the
     * home page / offers section automatically.
     */
    private void clearOfferIfExpired(Experience experience) {
        if (experience == null || experience.getOfferPercent() == null) return;
        String expiry = experience.getOfferExpiry();
        if (expiry == null || expiry.isBlank()) return;
        try {
            LocalDateTime expiryDateTime = LocalDateTime.parse(expiry);
            if (LocalDateTime.now().isAfter(expiryDateTime)) {
                experience.setOfferPercent(null);
                experience.setOfferExpiry(null);
                experienceRepository.save(experience);
                log.info("Offer on experience '{}' (id={}) auto-expired and was cleared",
                        experience.getName(), experience.getId());
            }
        } catch (Exception e) {
            log.warn("Could not parse offerExpiry '{}' for experience id={} - leaving offer as-is",
                    expiry, experience.getId());
        }
    }

    @Override
    public Experience createExperience(ExperienceRequest request) {
        log.info("Creating experience '{}', price={}, slotsLeft={}",
                request.getName(), request.getPrice(), request.getSlotsLeft());

        validate(request);

        Experience experience = new Experience();
        experience.setName(request.getName());
        experience.setDuration(request.getDuration());
        experience.setPrice(request.getPrice());
        experience.setSlotsLeft(request.getSlotsLeft());
        experience.setDescription(request.getDescription());
        experience.setStatus(request.getStatus());
        applyOffer(experience, request.getOfferPercent(), request.getOfferExpiry());

      
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            experience.setImageUrl(fileStorageService.store(request.getImage(), AppConstants.EXPERIENCES_IMAGE_FOLDER));
        }

        Experience saved = experienceRepository.save(experience);
        log.info("Experience saved successfully: id={}, name='{}'", saved.getId(), saved.getName());

        return saved;
    }

    @Override
    public Experience updateExperience(Long id, ExperienceRequest request) {
        log.info("Updating experience id={}", id);

        validate(request);
        Experience experience = getExperienceById(id);

        experience.setName(request.getName());
        experience.setDuration(request.getDuration());
        experience.setPrice(request.getPrice());
        experience.setSlotsLeft(request.getSlotsLeft());
        experience.setDescription(request.getDescription());
        experience.setStatus(request.getStatus());
        applyOffer(experience, request.getOfferPercent(), request.getOfferExpiry());

       
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            fileStorageService.delete(experience.getImageUrl());
            experience.setImageUrl(fileStorageService.store(request.getImage(), AppConstants.EXPERIENCES_IMAGE_FOLDER));
        }

        Experience saved = experienceRepository.save(experience);
        log.info("Experience id={} updated successfully", saved.getId());

        return saved;
    }

    @Override
    public void deleteExperience(Long id) {
        log.info("Deleting experience id={}", id);

        Experience experience = getExperienceById(id);
        experienceRepository.delete(experience);

        log.info("Experience id={} deleted successfully", id);
    }

    private void validate(ExperienceRequest request) {
        if (request == null) {
            throw new BadRequestException("Experience request must not be null");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Experience name is required");
        }
        if (request.getDuration() == null || request.getDuration().isBlank()) {
            throw new BadRequestException("Duration is required");
        }
        if (request.getPrice() == null || request.getPrice() < 0) {
            throw new BadRequestException("Price must be a non-negative number");
        }
        if (request.getSlotsLeft() == null || request.getSlotsLeft() < 0) {
            throw new BadRequestException("Slots left must be zero or more");
        }
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            throw new BadRequestException("Status is required");
        }
        if (request.getOfferPercent() != null) {
            if (request.getOfferPercent() < 0 || request.getOfferPercent() > 100) {
                throw new BadRequestException("Offer percent must be between 0 and 100");
            }
            if (request.getOfferExpiry() == null || request.getOfferExpiry().isBlank()) {
                throw new BadRequestException("Please set an expiry date/time for the offer");
            }
            try {
                LocalDateTime.parse(request.getOfferExpiry());
            } catch (Exception e) {
                throw new BadRequestException("Offer expiry must be a valid date/time");
            }
        }
    }

    /**
     * Sets (or clears) the offer on an experience. An empty/zero percent
     * clears the offer entirely so admins can remove it at any time.
     */
    private void applyOffer(Experience experience, Integer offerPercent, String offerExpiry) {
        if (offerPercent == null || offerPercent <= 0) {
            experience.setOfferPercent(null);
            experience.setOfferExpiry(null);
            return;
        }
        experience.setOfferPercent(offerPercent);
        experience.setOfferExpiry(offerExpiry);
    }
}
