package com.meetrivo.util;

public class ApplicationConstants {
    public static final String API_VERSION = "1.0.0";
    public static final String APP_NAME = "Meetrivo";
    
    // Success Messages
    public static final String HEALTH_CHECK_SUCCESS = "Meetrivo Backend Running";
    public static final String OPERATION_SUCCESS = "Operation completed successfully";
    
    // Error Messages
    public static final String INTERNAL_SERVER_ERROR = "An unexpected error occurred. Please try again later.";
    public static final String VALIDATION_FAILED = "One or more validation errors occurred.";
    public static final String UNAUTHORIZED = "You are not authorized to access this resource.";
    public static final String FORBIDDEN = "Access to this resource is forbidden.";
    
    private ApplicationConstants() {
        // Prevent instantiation
    }
}
