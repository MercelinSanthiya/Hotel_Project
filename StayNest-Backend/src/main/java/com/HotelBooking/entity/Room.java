package com.HotelBooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category; 

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer capacity;

    @Column(length = 2000)
    private String description;

    private String imageUrl; 

    @Column(nullable = false)
    private String status; 

  
    private String morningFood;   
    private String afternoonFood; 
    private String eveningFood;  

  
    private Integer maxPersons;

    
    private Boolean wifi = false;
    private Boolean tv = false;
    private Boolean ac = false;

    private java.time.LocalDate availableFrom;

    // ---- Offer (discount) fields ----
    // Percentage off the room's price (0-100). Null/blank means no offer.
    private Integer offerPercent;

    // When this offer stops being valid. Stored as an ISO-8601 local
    // date-time string (e.g. "2026-08-20T18:00") coming straight from an
    // HTML <input type="datetime-local">. Once this moment has passed,
    // the offer is automatically cleared (see RoomServiceImpl).
    private String offerExpiry;
}