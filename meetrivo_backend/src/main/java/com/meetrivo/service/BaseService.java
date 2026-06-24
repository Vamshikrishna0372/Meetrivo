package com.meetrivo.service;

import com.meetrivo.util.LoggerUtil;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Base service providing common utilities like logging and shared logic.
 * Future-ready foundation for all business services.
 */
public abstract class BaseService {

    @Autowired
    protected LoggerUtil logger;

    protected void logInfo(String message) {
        logger.info(getClass().getSimpleName() + " - " + message);
    }

    protected void logError(String message, Throwable throwable) {
        logger.error(getClass().getSimpleName() + " - " + message, throwable);
    }
}
