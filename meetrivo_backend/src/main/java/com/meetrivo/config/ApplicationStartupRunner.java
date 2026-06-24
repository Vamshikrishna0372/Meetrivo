package com.meetrivo.config;

import com.meetrivo.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Runs on application startup to perform initial data seeding.
 * Seeds default subscription plans (FREE, PRO, BUSINESS, ENTERPRISE) if none exist.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationStartupRunner implements ApplicationRunner {

    private final BillingService billingService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Running application startup tasks...");
        try {
            billingService.seedDefaultPlans();
            log.info("Startup tasks completed successfully.");
        } catch (Exception e) {
            log.warn("Non-fatal startup task error: {}", e.getMessage());
        }
    }
}
