package com.HotelBooking.service;

import com.HotelBooking.entity.DiningOutlet;
import com.HotelBooking.responseEntity.DiningRequest;

import java.util.List;

public interface DiningService {
    List<DiningOutlet> getAllOutlets();
    DiningOutlet getOutletById(Long id);
    DiningOutlet createOutlet(DiningRequest request);
    DiningOutlet updateOutlet(Long id, DiningRequest request);
    void deleteOutlet(Long id);
}