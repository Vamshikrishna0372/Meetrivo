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
@Document(collection = "mobile_devices")
@CompoundIndexes({
    @CompoundIndex(name = "user_device_idx", def = "{'userId': 1, 'deviceToken': 1}", unique = true)
})
public class MobileDevice {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String deviceToken;

    private MobilePlatform platform;

    private String deviceName;

    private LocalDateTime registeredAt;
}
