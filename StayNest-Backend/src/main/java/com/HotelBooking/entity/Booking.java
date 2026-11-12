package com.HotelBooking.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String guest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"bookings", "password"})
    private User user;

    @Column(nullable = false)
    private String category; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dining_outlet_id")
    private DiningOutlet diningOutlet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    private Experience experience;

    @Transient
    private Long itemId;

    @Column(nullable = false)
    private String itemName;

    
    @Column
    private String checkIn;

    @Column
    private String checkOut;

    
    @Column
    private String bookingDate;

   
    @Column
    private String reservationTime;

    
    @Column
    private Integer guests;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status; 

    // Who cancelled the booking ("user" or "admin"). Null if never cancelled.
    @Column
    private String cancelledBy;

    // ISO date (yyyy-MM-dd) the booking was cancelled on. Used to keep a
    // cancelled booking visible in the guest's profile on the day it was
    // cancelled, then drop it off the list starting the next day.
    @Column
    private String cancelledDate;
}