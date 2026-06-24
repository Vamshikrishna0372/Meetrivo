package com.meetrivo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences {
    @Builder.Default
    private String language = "en";

    @Builder.Default
    private String theme = "dark";

    @Builder.Default
    private boolean emailNotifications = true;

    @Builder.Default
    private boolean pushNotifications = true;

    @Builder.Default
    private String timezone = "UTC";
}
