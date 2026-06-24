package com.meetrivo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RateLimitingService extends BaseService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    // Fallback in-memory map for dev/testing when Redis is not available
    private final ConcurrentHashMap<String, RequestCounter> fallbackCache = new ConcurrentHashMap<>();

    private static class RequestCounter {
        int count;
        long resetTime;

        RequestCounter() {
            this.count = 0;
            this.resetTime = System.currentTimeMillis() + 60000; // 1 minute
        }

        synchronized boolean incrementAndCheck(int limit) {
            long now = System.currentTimeMillis();
            if (now > resetTime) {
                count = 1;
                resetTime = now + 60000;
                return true;
            }
            count++;
            return count <= limit;
        }
    }

    public boolean isAllowed(String key, int limit, int durationSeconds) {
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                redisTemplate.expire(key, durationSeconds, TimeUnit.SECONDS);
            }
            return count != null && count <= limit;
        } catch (Exception e) {
            // Fallback to in-memory rate limiting
            RequestCounter counter = fallbackCache.computeIfAbsent(key, k -> new RequestCounter());
            return counter.incrementAndCheck(limit);
        }
    }
}
