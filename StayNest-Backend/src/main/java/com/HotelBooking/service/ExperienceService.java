package com.HotelBooking.service;

import com.HotelBooking.entity.Experience;
import com.HotelBooking.responseEntity.ExperienceRequest;

import java.util.List;

public interface ExperienceService {
    List<Experience> getAllExperiences();
    Experience getExperienceById(Long id);
    Experience createExperience(ExperienceRequest request);
    Experience updateExperience(Long id, ExperienceRequest request);
    void deleteExperience(Long id);
}