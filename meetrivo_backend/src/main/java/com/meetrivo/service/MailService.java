package com.meetrivo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender javaMailSender;

    public void sendVerificationEmail(String email, String username, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Meetrivo - Verify your email");
        message.setText("Hi " + username + ",\n\nPlease verify your email using this token: " + token);
        
        try {
            javaMailSender.send(message);
            log.info("Sent verification email to {}", email);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", email, e);
        }
    }

    public void sendResetPasswordEmail(String email, String username, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Meetrivo - Reset your password");
        message.setText("Hi " + username + ",\n\nPlease reset your password using this token: " + token);
        
        try {
            javaMailSender.send(message);
            log.info("Sent password reset email to {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", email, e);
        }
    }
}
