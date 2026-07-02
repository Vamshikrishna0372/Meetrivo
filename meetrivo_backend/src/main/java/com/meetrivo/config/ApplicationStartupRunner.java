package com.meetrivo.config;

import com.meetrivo.model.AccountStatus;
import com.meetrivo.model.Role;
import com.meetrivo.model.User;
import com.meetrivo.repository.UserRepository;
import com.meetrivo.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Runs on application startup to perform initial data seeding.
 * Seeds default subscription plans (FREE, PRO, BUSINESS, ENTERPRISE) if none exist.
 * Seeds the default SUPER_ADMIN account if one does not already exist.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationStartupRunner implements ApplicationRunner {

    private final BillingService billingService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String SUPER_ADMIN_EMAIL    = "admin@meetrivo.com";
    private static final String SUPER_ADMIN_USERNAME = "superadmin";
    private static final String SUPER_ADMIN_FULLNAME = "Super Administrator";
    private static final String SUPER_ADMIN_PASSWORD = "Admin@123";

    @Override
    public void run(ApplicationArguments args) {
        log.info("Running application startup tasks...");
        try {
            billingService.seedDefaultPlans();
            seedSuperAdmin();
            log.info("Startup tasks completed successfully.");
        } catch (Exception e) {
            log.warn("Non-fatal startup task error: {}", e.getMessage());
        }
    }

    /**
     * Creates the default SUPER_ADMIN account only if one does not already exist.
     * Checks by e-mail to prevent duplicates on every restart.
     */
    private void seedSuperAdmin() {
        if (userRepository.existsByEmail(SUPER_ADMIN_EMAIL)) {
            log.info("Super admin account already exists — skipping seed.");
            return;
        }

        User superAdmin = User.builder()
                .email(SUPER_ADMIN_EMAIL)
                .username(SUPER_ADMIN_USERNAME)
                .fullName(SUPER_ADMIN_FULLNAME)
                .password(passwordEncoder.encode(SUPER_ADMIN_PASSWORD))
                .role(Role.SUPER_ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .emailVerified(true)
                .build();

        userRepository.save(superAdmin);
        log.info("Default super admin account created: {}", SUPER_ADMIN_EMAIL);
    }
}
