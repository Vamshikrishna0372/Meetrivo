package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "organization_members")
@CompoundIndexes({
    @CompoundIndex(name = "org_user_idx", def = "{'organizationId': 1, 'userId': 1}", unique = true)
})
public class OrganizationMember {

    @Id
    private String id;

    @Indexed
    private String organizationId;

    @Indexed
    private String userId;

    private OrganizationRole role;

    private LocalDateTime joinedAt;
}
