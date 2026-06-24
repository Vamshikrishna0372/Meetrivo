package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "subscription_plans")
public class SubscriptionPlan {

    @Id
    private String id;

    private String name;

    private String description;

    private Double price;

    private String currency;

    private BillingCycle billingCycle;

    private int meetingLimit;

    private int participantLimit;

    private int recordingLimit;

    private long storageLimit; // in bytes

    private List<String> features;

    @Builder.Default
    private boolean active = true;
}
