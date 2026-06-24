package com.meetrivo.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LoggerUtil {

    public void info(String message) {
        log.info("[INFO] {}", message);
    }

    public void info(String message, Object... args) {
        log.info("[INFO] " + message, args);
    }

    public void warn(String message) {
        log.warn("[WARN] {}", message);
    }

    public void warn(String message, Object... args) {
        log.warn("[WARN] " + message, args);
    }

    public void error(String message) {
        log.error("[ERROR] {}", message);
    }

    public void error(String message, Throwable throwable) {
        log.error("[ERROR] {}", message, throwable);
    }
}
