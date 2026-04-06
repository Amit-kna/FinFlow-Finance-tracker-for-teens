# Security Hardening Implementation

This document details the security enhancements applied to the FinFlow application.

## 1. Rate Limiting

**Implementation:** Custom middleware in `lib/rate-limit.ts`.

- **Strategy:** IP-based in-memory rate limiting.
- **Endpoints:**
  - `/api/ai-scanner`: 10 req/min
  - `/api/ai-insights`: 15 req/min
  - `/api/safe-to-spend`: 20 req/min
  - `/api/scrape-singularity`: 5 req/min (heavy operation)
  - `/api/leaderboard`: 10 req/min
  - `/auth/callback`: 5 req/min (prevent brute-force)
- **Response:** Returns `429 Too Many Requests` with a clear error message when limit is exceeded.

## 2. Strict Input Validation

**Implementation:** Zod schema validation in `lib/validators.ts`.

- **Strategy:** Schema-based validation with strict type checking and length limits.
- **Validation Logic:**
  - All IDs must be valid UUIDs.
  - Request bodies are validated against specific schemas.
  - Unknown fields are rejected automatically by Zod if not defined in the schema.
- **Error Handling:** Returns `400 Bad Request` with detailed validation errors.

## 3. Secure API Key Handling

**Implementation:**
- **Environment Variables:** All external keys (Supabase, Modal endpoints) are read from `process.env`.
- **Hardcoded Keys:** Removed from code.
- **Client-Side Exposure:** Anon keys are prefixed with `NEXT_PUBLIC_` (as required by Supabase client), but service role keys and Modal URLs remain server-side only.
- **Logging:** Removed all `console.log` statements that could expose sensitive data.

## 4. Security Best Practices

- **Dependencies:** Updated `package.json` to include `zod` for validation.
- **Build:** Project builds successfully with `npm run build`.
- **Type Safety:** Added strict TypeScript types for validation schemas.