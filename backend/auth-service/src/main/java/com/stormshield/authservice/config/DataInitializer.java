package com.stormshield.authservice.config;

import com.stormshield.authservice.entity.User;
import com.stormshield.authservice.entity.UserRole;
import com.stormshield.authservice.entity.UserStatus;
import com.stormshield.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdminAccount();
    }

    private void seedAdminAccount() {
        String adminEmail = "admin@stormshield.com";
        
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Default admin account already exists. Skipping initialization.");
            return;
        }

        log.info("Creating default admin account: {}", adminEmail);
        
        User admin = User.builder()
                .fullName("System Administrator")
                .email(adminEmail)
                .phoneNumber("0000000000") // Default placeholder
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(admin);
        log.info("Default admin account created successfully.");
    }
}
