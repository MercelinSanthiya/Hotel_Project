package com.HotelBooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "experiences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String duration;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer slotsLeft;

    @Column(length = 2000)
    private String description;

    private String imageUrl;

    @Column(nullable = false)
    private String status; 

    // ---- Offer (discount) fields ----
    // Percentage off the experience's price (0-100). Null/blank means no offer.
    private Integer offerPercent;

    // ISO-8601 local date-time string (e.g. "2026-08-20T18:00") for when
    // the offer expires and should be auto-cleared.
    private String offerExpiry;
}
