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
@Document(collection = "organization_invitations")
public class OrganizationInvitation {

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String email;

    private OrganizationRole role;

    @Builder.Default
    private InvitationStatus status = InvitationStatus.PENDING;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;
}
