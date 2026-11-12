package com.HotelBooking.config;

import com.HotelBooking.constants.AppConstants;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = Paths.get(AppConstants.UPLOAD_ROOT_DIR).toAbsolutePath().normalize().toString();

        registry.addResourceHandler(AppConstants.IMAGE_URL_PREFIX + "/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
