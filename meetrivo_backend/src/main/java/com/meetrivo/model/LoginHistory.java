package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "login_histories")
public class LoginHistory {

    @Id
    private String id;

    private String userId;
    private String username;
    private LocalDateTime loginTime;
    private String ipAddress;
    private String userAgent;
    private String status; // SUCCESS, FAILED
}
