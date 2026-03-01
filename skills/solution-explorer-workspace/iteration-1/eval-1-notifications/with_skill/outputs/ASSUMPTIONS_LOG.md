# Assumptions Log (Test Run)

Since this was a test run without a human in the loop, the following assumptions were made where the skill instructs "ask the user to confirm or correct":

## Problem Framing Assumptions

1. **Next.js App Router** -- Assumed the project uses the modern App Router (not Pages Router). Rationale: greenfield project, App Router is the default for new Next.js projects.

2. **PostgreSQL as database** -- Assumed PostgreSQL or a Postgres-compatible service is available. This influenced the solution space significantly (pg_notify, Supabase's Postgres foundation).

3. **Authenticated users with stable IDs** -- Assumed basic auth is in place. Without this, notifications are meaningless.

4. **Vercel as a deployment target** -- Assumed the project may deploy to Vercel based on it being the most common Next.js deployment platform. This was a critical assumption because it eliminated WebSocket-based approaches.

5. **In-app notifications are the primary channel** -- Assumed email/push/SMS are future additions, not launch requirements. This deprioritized full-stack notification services (Novu, Knock).

6. **Small initial scale (< 10K users)** -- Assumed startup/indie context. This made cost sensitivity a factor and deprioritized enterprise-scale solutions.

## Decision Points Where User Input Would Have Changed the Outcome

- **If the user said "we're NOT using Supabase and don't want to"**: The recommendation would shift to Pusher Channels + Custom PostgreSQL. This is documented as the conditional alternative in DECISION.md.

- **If the user said "we need email notifications at launch"**: Novu would become a finalist, and potentially the winner, because building email delivery from scratch is significant work that notification services handle well.

- **If the user said "we're self-hosting on a VPS, not using Vercel"**: SSE + PostgreSQL would become more competitive because the Vercel timeout constraints wouldn't apply.

- **If the user said "we expect to hit 1M users within a year"**: The analysis would weight scalability much more heavily, potentially favoring Pusher or Ably for their proven scale characteristics.

- **If the user said "we already have Redis in our stack"**: SSE + PostgreSQL with Redis pub/sub for fan-out would be a stronger contender because the multi-instance scaling cliff would already be solved.

## Complexity Budget Assessment

Treated notifications as a "foundational but not differentiating" feature. A medium complexity budget: worth building properly, not worth over-engineering. If the user had said "notifications are our core differentiator" (e.g., a notification management product), the analysis would favor custom-built approaches with more control.
