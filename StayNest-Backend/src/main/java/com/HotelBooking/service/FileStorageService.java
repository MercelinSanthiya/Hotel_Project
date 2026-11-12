package com.HotelBooking.service;

import com.HotelBooking.constants.AppConstants;
import com.HotelBooking.exception.ApiException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadRoot = Paths.get(AppConstants.UPLOAD_ROOT_DIR).toAbsolutePath().normalize();

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadRoot, e);
        }
    }

  
    public String store(MultipartFile file, String subfolder) {
        validate(file);

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String extension = original.contains(".") ? original.substring(original.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID() + extension;

        Path targetDir = uploadRoot.resolve(subfolder);
        Path targetFile = targetDir.resolve(filename);

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetFile);
        } catch (IOException e) {
            throw new ApiException("Failed to store image: " + e.getMessage());
        }

        return AppConstants.IMAGE_URL_PREFIX + "/" + subfolder + "/" + filename;
    }

   
    public void delete(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || !imageUrl.startsWith(AppConstants.IMAGE_URL_PREFIX)) {
            return;
        }
        try {
            String relative = imageUrl.substring(AppConstants.IMAGE_URL_PREFIX.length());
            Path file = uploadRoot.resolve("." + relative).normalize();
            Files.deleteIfExists(file);
        } catch (IOException ignored) {
           
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("No image file was provided");
        }
        if (file.getSize() > AppConstants.MAX_IMAGE_SIZE_BYTES) {
            throw new ApiException("Image is too large. Maximum size is 5MB");
        }
        String contentType = file.getContentType();
        boolean allowed = contentType != null &&
                Arrays.asList(AppConstants.ALLOWED_IMAGE_TYPES).contains(contentType);
        if (!allowed) {
            throw new ApiException("Unsupported image type: " + contentType);
        }
    }
}
