package com.meetrivo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService extends BaseService {

    private final JavaMailSender mailSender;

    public MailService(org.springframework.beans.factory.ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.frontend.url:https://themeetrivo.vercel.app}")
    private String frontendUrl;

    public void sendVerificationEmail(String toEmail, String username, String token) {
        String subject = "Verify your Meetrivo Account";
        String verificationUrl = frontendUrl + "/verify?token=" + token;
        String text = String.format(
                "Hello %s,\n\nWelcome to Meetrivo! Please verify your email by clicking the link below:\n%s\n\nIf you did not sign up for Meetrivo, please ignore this email.\n\nBest regards,\nThe Meetrivo Team",
                username, verificationUrl
        );

        sendEmail(toEmail, subject, text);
    }

    public void sendResetPasswordEmail(String toEmail, String username, String token) {
        String subject = "Reset your Meetrivo Password";
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String text = String.format(
                "Hello %s,\n\nYou requested to reset your password. Please click the link below to complete the request:\n%s\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Meetrivo Team",
                username, resetUrl
        );

        sendEmail(toEmail, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        if (mailHost == null || mailHost.trim().isEmpty() || mailUsername == null || mailUsername.trim().isEmpty()) {
            logInfo(String.format("[MAIL MOCK] To: %s | Subject: %s | Text:\n%s", to, subject, text));
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            logInfo("Email sent successfully to: " + to);
        } catch (Exception e) {
            logError("Failed to send email to " + to + ". Falling back to logging.", e);
            logInfo(String.format("[MAIL FALLBACK] To: %s | Subject: %s | Text:\n%s", to, subject, text));
        }
    }
}
