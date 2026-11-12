package com.HotelBooking.exception;

public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }
}