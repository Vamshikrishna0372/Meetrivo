package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "breakout_rooms")
public class BreakoutRoom {

    @Id
    private String id;

    @Indexed
    private String meetingId;

    private String roomName;
    private String hostId;

    @Builder.Default
    private List<String> participantIds = new ArrayList<>();

    @Builder.Default
    private BreakoutRoomStatus status = BreakoutRoomStatus.OPEN;

    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
}
