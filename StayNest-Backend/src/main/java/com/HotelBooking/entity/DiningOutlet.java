package com.HotelBooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dining_outlets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiningOutlet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String cuisine;

    @Column(nullable = false)
    private String hours;

    @Column(nullable = false)
    private Integer seats;

    @Column(length = 2000)
    private String description;

    private String imageUrl;

    @Column(nullable = false)
    private String status; 

    // Flat entrance fee charged per guest when reserving a table (e.g. 50).
    @Column(nullable = false)
    private Double entranceFee = 0d;
}
