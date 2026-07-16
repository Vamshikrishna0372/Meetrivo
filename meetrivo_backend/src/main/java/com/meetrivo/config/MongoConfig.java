package com.meetrivo.config;

import com.meetrivo.model.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    /**
     * Registers lenient converters for Role ↔ String so that legacy MongoDB
     * documents storing old values like "USER" or "ADMIN" are safely mapped to
     * their modern equivalents (MEMBER / ORGANIZATION_ADMIN) and persisted
     * back as the canonical name without throwing IllegalArgumentException.
     */
    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(
                new StringToRoleConverter(),
                new RoleToStringConverter()
        ));
    }

    /** Mongo → Java: lenient mapping handles "USER", "ADMIN", null, unknown values. */
    @ReadingConverter
    static class StringToRoleConverter implements Converter<String, Role> {
        @Override
        public Role convert(String source) {
            return Role.fromString(source);
        }
    }

    /** Java → Mongo: always persist the canonical enum name. */
    @WritingConverter
    static class RoleToStringConverter implements Converter<Role, String> {
        @Override
        public String convert(Role source) {
            return source == null ? Role.MEMBER.name() : source.name();
        }
    }
}
