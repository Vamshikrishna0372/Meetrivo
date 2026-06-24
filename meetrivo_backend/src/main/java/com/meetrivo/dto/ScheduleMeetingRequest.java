package com.meetrivo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ScheduleMeetingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String timezone = "UTC";

    private boolean recurring = false;

    // e.g. DAILY, WEEKLY, MONTHLY or custom iCal RRULE string
    private String recurrenceRule;
}
