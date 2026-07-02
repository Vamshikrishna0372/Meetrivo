package com.meetrivo.model;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * Platform roles for users.
 * Includes a lenient deserialization factory method to handle legacy
 * role values (e.g. "USER", "ADMIN") that may still be stored in MongoDB
 * from before the enum was renamed.
 */
public enum Role {
    SUPER_ADMIN,
    ORGANIZATION_OWNER,
    ORGANIZATION_ADMIN,
    TEAM_MANAGER,
    MEMBER,
    GUEST;

    /**
     * Lenient factory method for JSON / MongoDB deserialization.
     * Maps legacy and unknown role strings to a safe default (MEMBER)
     * instead of throwing IllegalArgumentException.
     *
     * Mappings:
     *   "USER"  → MEMBER          (legacy default user role)
     *   "ADMIN" → ORGANIZATION_ADMIN  (legacy admin role)
     *   Any other unknown value → MEMBER (safe fallback)
     */
    @JsonCreator
    public static Role fromString(String value) {
        if (value == null) {
            return MEMBER;
        }
        switch (value.toUpperCase().trim()) {
            case "SUPER_ADMIN":     return SUPER_ADMIN;
            case "ORGANIZATION_OWNER": return ORGANIZATION_OWNER;
            case "ORGANIZATION_ADMIN": return ORGANIZATION_ADMIN;
            case "TEAM_MANAGER":    return TEAM_MANAGER;
            case "MEMBER":          return MEMBER;
            case "GUEST":           return GUEST;
            // ── Legacy / migrated values ─────────────────────────────────
            case "USER":            return MEMBER;           // legacy default
            case "ADMIN":           return ORGANIZATION_ADMIN; // legacy admin
            default:                return MEMBER;           // safe fallback
        }
    }
}
