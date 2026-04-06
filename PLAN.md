# FinFlow Development Plan

**Current Phase:** Building the Engine

## Active Features & API Endpoints
- **Engine Logic & API Routes:**
  - `GET /api/leaderboard`: Ranks users globally by Money Score.
  - `GET /api/safe-to-spend?userId="..."`: Calculates safe limit based on transactions and goals.
  - `GET /api/ai-insights?userId="..."`: Returns AI-generated financial insights (Powered by Modal).
  - `POST /api/ai-scanner`: Parses receipt content into structured JSON transactions (Powered by Modal).
- `TBD`: Supabase Income/Expense logging routes
- `TBD`: Goals Tracker endpoints

## Audit Report (2026-03-22)
**Visual Score:** 9.5/10
**Functional Score:** 9/10
**Trust Score:** 9/10

### Visual Wins
- **Bento Grid Layout:** Extremely clean and high-density landing page grid.
- **Glassmorphism:** Consistent application of backdrop-blur and transparency across dashboard cards.
- **Typography:** Kinetic typography and smooth animations (Framer Motion) provide a premium feel.

### Critical Fails
- None identified in current UI.

### Logic & Trust Bugs / Edge Cases
- **Auth Redirect Loop:** Logged-in users are immediately redirected to `/dashboard` from the root, making the landing page inaccessible for marketing reference without logout.
- **Loading States:** Verify that all data-heavy components have skeleton loaders (to be tested during E2E).
- **AI Scanner Reliability:** Needs unit tests to ensure structured JSON output from varied receipt formats.

## Singularity Subreddit Scraper
- **Goal:** Fetch real-time posts/content from the Singularity subreddit when triggered by a UI button.
- **Endpoint:** `GET /api/scrape-singularity` (Live/Active)
- **Infrastructure:** `modal/singularity_scraper.py` (Modal Python Serverless Wrapper) & Next.js API Route for fallback

## Architecture: Customer Research & Analytics Integration
- **Platform:** PostHog (All-in-one product analytics, session replay, in-app surveys, and feature flags)
- **Infrastructure Approach:** 
  - `posthog-js` for Client Components/UI interactions (Session Replay, Pageviews)
  - `posthog-node` for Server Actions/API routes (Sensitive event tracking)
- **Integration Points:** 
  - Top-level `layout.tsx` wrapper for client-side capture.
  - Server-side event triggering within core workflows (e.g., successful transaction, auth events).
- **Data Synergy:** Native event export to Supabase data warehouse for long-term customer analysis.

*This document will be updated tracking live endpoints and architectural status.*
