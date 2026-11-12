package com.HotelBooking.serviceimpl;

import com.HotelBooking.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmailId;

    @Value("${spring.mail.adminname}")
    private String adminEmail;

    public void sendBookingNotificationToAdmin(Booking booking) {
        try {
            SimpleMailMessage simpleMailMessage = new SimpleMailMessage();

            simpleMailMessage.setFrom(fromEmailId);
            simpleMailMessage.setTo(adminEmail);

            simpleMailMessage.setSubject("New Booking Received : " + booking.getItemName());

            String body =
                    "A new booking has been placed.\n\n" +

                            "Booking Details:\n" +
                            "Booking ID: " + booking.getId() + "\n" +
                            "Guest: " + booking.getGuest() + "\n" +
                            "Category: " + booking.getCategory() + "\n" +
                            "Item: " + booking.getItemName() + "\n" +
                            buildStayOrDateLines(booking) +
                            "Amount: " + booking.getAmount() + "\n" +
                            "Status: " + booking.getStatus() + "\n\n" +

                            "Regards,\n" +
                            "Hotel Booking Management System";

            simpleMailMessage.setText(body);

            javaMailSender.send(simpleMailMessage);
        } catch (Exception e) {
            // Never let a mail failure roll back or fail the booking.
            log.error("Failed to send admin notification email for booking id={}: {}",
                    booking.getId(), e.getMessage());
        }
    }

    public void sendBookingConfirmationToUser(Booking booking) {
        try {
            SimpleMailMessage simpleMailMessage = new SimpleMailMessage();

            simpleMailMessage.setFrom(fromEmailId);
            simpleMailMessage.setTo(booking.getUser().getEmail());

            simpleMailMessage.setSubject("Booking Confirmed : " + booking.getItemName());

            String body =
                    "Dear " + booking.getGuest() + ",\n\n" +
                            "Thank you for your booking! Here are your booking details:\n\n" +
                            "Booking ID: " + booking.getId() + "\n" +
                            "Category: " + booking.getCategory() + "\n" +
                            "Item: " + booking.getItemName() + "\n" +
                            buildStayOrDateLines(booking) +
                            "Amount Paid: " + booking.getAmount() + "\n" +
                            "Status: " + booking.getStatus() + "\n\n" +

                            "We look forward to hosting you.\n\n" +

                            "Regards,\n" +
                            "Hotel Booking Management Team";

            simpleMailMessage.setText(body);

            javaMailSender.send(simpleMailMessage);
        } catch (Exception e) {
            // Never let a mail failure roll back or fail the booking.
            log.error("Failed to send confirmation email for booking id={}: {}",
                    booking.getId(), e.getMessage());
        }
    }


    private String buildStayOrDateLines(Booking booking) {
        StringBuilder sb = new StringBuilder();

        if (booking.getCheckIn() != null && booking.getCheckOut() != null) {
            sb.append("Check-in: ").append(booking.getCheckIn()).append("\n");
            sb.append("Check-out: ").append(booking.getCheckOut()).append("\n");
        }

        if (booking.getBookingDate() != null) {
            sb.append("Date: ").append(booking.getBookingDate()).append("\n");
        }

        if (booking.getReservationTime() != null) {
            sb.append("Time: ").append(booking.getReservationTime()).append("\n");
        }

        if (booking.getGuests() != null) {
            sb.append("Guests: ").append(booking.getGuests()).append("\n");
        }

        return sb.toString();
    }
}