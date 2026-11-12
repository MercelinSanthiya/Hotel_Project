package com.HotelBooking.config;

import com.HotelBooking.entity.*;
import com.HotelBooking.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoomRepository roomRepository;
    private final DiningOutletRepository diningOutletRepository;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       RoomRepository roomRepository, DiningOutletRepository diningOutletRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roomRepository = roomRepository;
        this.diningOutletRepository = diningOutletRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@hotel.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            System.out.println("=================================================");
            System.out.println(" Seeded default admin account");
            System.out.println(" username: admin");
            System.out.println(" password: admin123");
            System.out.println(" Change this after your first login.");
            System.out.println("=================================================");
        }

        
        if (roomRepository.count() == 0) {
            Room room = new Room();
            room.setName("Ocean Deluxe");
            room.setCategory("Deluxe");
            room.setPrice(240.0);
            room.setCapacity(2);
            room.setDescription("Warmly appointed room with garden or city views.");
            room.setStatus("Available");
            roomRepository.save(room);
        }

        if (diningOutletRepository.count() == 0) {
            DiningOutlet outlet = new DiningOutlet();
            outlet.setName("The Grand Table");
            outlet.setCuisine("Modern European");
            outlet.setHours("7:00 - 23:00");
            outlet.setSeats(80);
            outlet.setDescription("Refined dining in the heart of the property.");
            outlet.setStatus("Open");
            outlet.setEntranceFee(50.0);
            diningOutletRepository.save(outlet);
        }
    }
}
