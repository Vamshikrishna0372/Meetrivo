package com.meetrivo.repository;

import com.meetrivo.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    long countByAccountStatus(com.meetrivo.model.AccountStatus accountStatus);

    Optional<User> findByVerificationToken(String token);

    Optional<User> findByResetPasswordToken(String token);
}
