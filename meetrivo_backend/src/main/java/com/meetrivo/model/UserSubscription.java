package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_subscriptions")
public class UserSubscription {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String planId;

    private SubscriptionStatus status;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Builder.Default
    private boolean autoRenew = true;

    private LocalDateTime createdAt;
}
