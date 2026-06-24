package com.meetrivo.service;

import com.meetrivo.model.SupportTicket;
import com.meetrivo.model.User;
import com.meetrivo.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class SupportTicketService extends BaseService {

    private final SupportTicketRepository supportTicketRepository;
    private final Random random = new Random();

    public SupportTicket createTicket(SupportTicket ticket) {
        User user = getCurrentUser();
        ticket.setUserId(user.getId());
        ticket.setUsername(user.getUsername());
        ticket.setTicketId(generateUniqueTicketId());
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        SupportTicket saved = supportTicketRepository.save(ticket);
        logInfo("Created support ticket: " + saved.getTicketId() + " for user: " + user.getUsername());
        return saved;
    }

    public List<SupportTicket> getUserTickets() {
        User user = getCurrentUser();
        return supportTicketRepository.findByUserId(user.getId());
    }

    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAll();
    }

    public SupportTicket updateTicketStatus(String ticketId, String status) {
        SupportTicket ticket = supportTicketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found: " + ticketId));
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        SupportTicket saved = supportTicketRepository.save(ticket);
        logInfo("Updated support ticket status: " + ticketId + " to " + status);
        return saved;
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private String generateUniqueTicketId() {
        String ticketId;
        do {
            int num = 100000 + random.nextInt(900000);
            ticketId = "TKT-" + num;
        } while (supportTicketRepository.findByTicketId(ticketId).isPresent());
        return ticketId;
    }
}
