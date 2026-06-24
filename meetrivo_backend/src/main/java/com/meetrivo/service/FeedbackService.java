package com.meetrivo.service;

import com.meetrivo.model.Feedback;
import com.meetrivo.model.User;
import com.meetrivo.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService extends BaseService {

    private final FeedbackRepository feedbackRepository;

    public Feedback submitFeedback(Feedback feedback) {
        User user = getCurrentUser();
        feedback.setUserId(user.getId());
        feedback.setUsername(user.getUsername());
        feedback.setCreatedAt(LocalDateTime.now());
        
        Feedback saved = feedbackRepository.save(feedback);
        logInfo("User submitted feedback. Category: " + saved.getCategory() + ", Rating: " + saved.getRating());
        return saved;
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    public List<Feedback> getUserFeedback() {
        User user = getCurrentUser();
        return feedbackRepository.findByUserId(user.getId());
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
