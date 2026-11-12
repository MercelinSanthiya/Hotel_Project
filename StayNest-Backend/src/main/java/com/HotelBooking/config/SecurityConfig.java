package com.HotelBooking.config;



import com.HotelBooking.security.CustomUserDetailsService;
import com.HotelBooking.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
       
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()   

                        
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                       
                        .requestMatchers(HttpMethod.GET,
                                "/api/rooms/**", "/api/dining/**", "/api/experiences/**",
                                "/api/gallery/**"
                        ).permitAll()

                       
                        .requestMatchers("/api/profile/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/bookings/me").authenticated()

                        
                        .requestMatchers(HttpMethod.POST, "/api/bookings").authenticated()

                        // A guest may cancel their own pending booking - this must be
                        // listed before the broader ADMIN-only PUT /api/bookings/**
                        // rule below, since Spring Security uses the first matcher
                        // that matches the request.
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/cancel").authenticated()

                        
                        .requestMatchers(HttpMethod.POST,
                                "/api/rooms/**", "/api/dining/**", "/api/experiences/**",
                                "/api/gallery/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/rooms/**", "/api/dining/**", "/api/experiences/**",
                                "/api/gallery/**", "/api/bookings/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/rooms/**", "/api/dining/**", "/api/experiences/**",
                                "/api/gallery/**", "/api/bookings/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/**").hasRole("ADMIN")

                        .requestMatchers("/api/admin/**").hasRole("ADMIN") // user management, dashboard-only routes
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
