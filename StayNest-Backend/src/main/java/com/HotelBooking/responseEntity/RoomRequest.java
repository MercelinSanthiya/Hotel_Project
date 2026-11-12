package com.HotelBooking.responseEntity;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

public class RoomRequest {

    private String name;
    private String category;
    private Double price;
    private Integer capacity;
    private String description;
    private String status;
    private MultipartFile image;

    private String morningFood;
    private String afternoonFood;
    private String eveningFood;
    private Integer maxPersons;
    private Boolean wifi;
    private Boolean tv;
    private Boolean ac;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate availableFrom;

    private Integer offerPercent;
    private String offerExpiry;

    public Integer getOfferPercent() {
        return offerPercent;
    }

    public void setOfferPercent(Integer offerPercent) {
        this.offerPercent = offerPercent;
    }

    public String getOfferExpiry() {
        return offerExpiry;
    }

    public void setOfferExpiry(String offerExpiry) {
        this.offerExpiry = offerExpiry;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    public String getMorningFood() {
        return morningFood;
    }

    public void setMorningFood(String morningFood) {
        this.morningFood = morningFood;
    }

    public String getAfternoonFood() {
        return afternoonFood;
    }

    public void setAfternoonFood(String afternoonFood) {
        this.afternoonFood = afternoonFood;
    }

    public String getEveningFood() {
        return eveningFood;
    }

    public void setEveningFood(String eveningFood) {
        this.eveningFood = eveningFood;
    }

    public Integer getMaxPersons() {
        return maxPersons;
    }

    public void setMaxPersons(Integer maxPersons) {
        this.maxPersons = maxPersons;
    }

    public Boolean getWifi() {
        return wifi;
    }

    public void setWifi(Boolean wifi) {
        this.wifi = wifi;
    }

    public Boolean getTv() {
        return tv;
    }

    public void setTv(Boolean tv) {
        this.tv = tv;
    }

    public Boolean getAc() {
        return ac;
    }

    public void setAc(Boolean ac) {
        this.ac = ac;
    }

    public LocalDate getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalDate availableFrom) {
        this.availableFrom = availableFrom;
    }
}