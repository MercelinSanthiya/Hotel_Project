package com.HotelBooking.constants;

public final class AppConstants {

    private AppConstants() {

    }


    public static final String API_BASE = "/api";
    public static final String AUTH_BASE = API_BASE + "/auth";
    public static final String ROOMS_BASE = API_BASE + "/rooms";
    public static final String DINING_BASE = API_BASE + "/dining";
    public static final String EXPERIENCES_BASE = API_BASE + "/experiences";
    public static final String GALLERY_BASE = API_BASE + "/gallery";
    public static final String BOOKINGS_BASE = API_BASE + "/bookings";
    public static final String ADMIN_USERS_BASE = API_BASE + "/admin/users";
    public static final String PROFILE_BASE = API_BASE + "/profile";


    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_USER = "USER";



    public static final String UPLOAD_ROOT_DIR = "uploads";


    public static final String IMAGE_URL_PREFIX = "/uploads";

    public static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024 * 1024;

    public static final String[] ALLOWED_IMAGE_TYPES = {
            "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"
    };


    public static final String ROOMS_IMAGE_FOLDER = "rooms";
    public static final String DINING_IMAGE_FOLDER = "dining";
    public static final String EXPERIENCES_IMAGE_FOLDER = "experiences";
    public static final String GALLERY_IMAGE_FOLDER = "gallery";
}
