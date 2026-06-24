package com.meetrivo.repository;

import com.meetrivo.model.AuthProvider;
import com.meetrivo.model.SocialAccount;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SocialAccountRepository extends MongoRepository<SocialAccount, String> {
    Optional<SocialAccount> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
    Optional<SocialAccount> findByUserIdAndProvider(String userId, AuthProvider provider);
    List<SocialAccount> findByUserId(String userId);
    boolean existsByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
}
