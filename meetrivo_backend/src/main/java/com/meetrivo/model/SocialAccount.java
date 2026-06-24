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
@Document(collection = "social_accounts")
public class SocialAccount {

    @Id
    private String id;

    @Indexed
    private String userId;

    private AuthProvider provider;

    @Indexed
    private String providerUserId;

    private String email;

    private LocalDateTime linkedAt;
}
