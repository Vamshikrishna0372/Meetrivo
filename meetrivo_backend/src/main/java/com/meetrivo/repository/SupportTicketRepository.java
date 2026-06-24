package com.meetrivo.repository;

import com.meetrivo.model.SupportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends MongoRepository<SupportTicket, String> {
    Optional<SupportTicket> findByTicketId(String ticketId);
    List<SupportTicket> findByUserId(String userId);
    List<SupportTicket> findByStatus(String status);
}
