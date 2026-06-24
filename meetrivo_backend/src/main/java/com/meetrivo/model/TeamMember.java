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
@Document(collection = "team_members")
@CompoundIndexes({
    @CompoundIndex(name = "team_user_idx", def = "{'teamId': 1, 'userId': 1}", unique = true)
})
public class TeamMember {

    @Id
    private String id;

    @Indexed
    private String teamId;

    @Indexed
    private String userId;

    private String role; // e.g. MANAGER, MEMBER

    private LocalDateTime joinedAt;
}
