# Prototype Comparison: Real-Time Notifications

## Comparison Criteria (defined before prototyping)

1. **Code complexity**: Total lines of infrastructure code required (excluding shared UI). Measured by counting the prototype files.
2. **Architectural simplicity**: Number of moving parts / services the developer must understand and configure.
3. **Deployment compatibility**: Does it work on Vercel without workarounds? Does it require additional infrastructure?
4. **Single-write vs dual-write**: Does creating a notification require writing to one place or two? Dual-writes introduce failure modes.
5. **Built-in reconnection handling**: How well does the approach handle dropped connections without custom code?
6. **Vendor coupling**: How tightly does the approach bind you to a specific platform?
7. **Cost at target scale (10K users, ~100K notifications/day)**: Estimated monthly cost.

## Results

### Prototype A: SSE + PostgreSQL
- **Location:** `prototypes/a-sse-postgres/`
- **Code complexity:** ~180 lines across 4 files (schema, route handler, hook, create function). The SSE route handler is the most complex single file at ~70 lines, managing the ReadableStream lifecycle, pg_notify listener, and keepalive.
- **Architectural simplicity:** 3 components: PostgreSQL (with LISTEN/NOTIFY trigger), Next.js Route Handler (SSE endpoint), client EventSource. Developer must understand SSE protocol, pg_notify mechanics, and ReadableStream API. Moderate cognitive load.
- **Deployment compatibility:** Works on Vercel with caveats. SSE is supported, but connections are dropped at the function timeout limit (10s on Hobby, 300s on Pro). The `EventSource` API reconnects automatically, but there will be brief gaps during reconnection. On self-hosted Node.js: works perfectly with no limitations.
- **Single-write vs dual-write:** **Single write.** The INSERT into the notifications table fires the pg_notify trigger automatically. The SSE endpoint listens for pg_notify events. No explicit pub/sub call needed.
- **Built-in reconnection handling:** EventSource has built-in automatic reconnection with configurable retry interval. However, during reconnection, the client must fetch missed notifications (a separate REST call). The prototype includes this pattern.
- **Vendor coupling:** Zero vendor coupling. Standard PostgreSQL + standard web APIs. Fully portable.
- **Cost at target scale:** $0 beyond existing database and compute costs. No per-message pricing, no third-party service.
- **Surprises:**
  - The pg_notify approach creates an elegant single-write pattern, but it has a subtle issue: the LISTEN connection is per-server-process. On a multi-instance deployment, only one process receives the pg_notify. You'd need Redis pub/sub or similar to fan out to all instances. This is a hidden scaling cliff.
  - On Vercel specifically, the Route Handler that opens a LISTEN connection to PostgreSQL holds that connection for the duration of the SSE stream. With many concurrent users, this could exhaust the Postgres connection pool. The dedicated `listenPool` helps, but there's still a per-user connection concern.
  - The 10-second function timeout on Vercel Hobby makes this approach impractical for Hobby-tier deployments. It would reconnect every 10 seconds.

### Prototype B: Pusher Channels
- **Location:** `prototypes/b-pusher/`
- **Code complexity:** ~160 lines across 4 files (server config, auth route, hook, create function). Slightly less code than SSE because Pusher abstracts the transport entirely. No ReadableStream management.
- **Architectural simplicity:** 3 components: PostgreSQL (notification storage), Pusher service (real-time transport), Pusher client SDK. Developer must understand Pusher channels, authentication flow, and the dual-write pattern. The auth endpoint adds a file but is straightforward boilerplate.
- **Deployment compatibility:** Excellent on Vercel. No long-lived connections on your server -- Pusher's infrastructure handles WebSocket connections with clients. Your server just makes HTTP calls to Pusher's API to trigger events. Works identically on self-hosted.
- **Single-write vs dual-write:** **Dual write.** Must INSERT into database AND call `pusher.trigger()`. The prototype wraps the Pusher call in try/catch so a Pusher failure doesn't lose the notification, but there's still a window where the DB write succeeds and the Pusher trigger fails (notification appears on next page load but not in real-time).
- **Built-in reconnection handling:** Excellent. Pusher's client SDK handles reconnection, exponential backoff, and connection state management. It also falls back from WebSocket to HTTP streaming to polling automatically.
- **Vendor coupling:** Moderate. Locked to Pusher for real-time transport. However, the notification data model and business logic are in your database, so switching to a different pub/sub service (Ably, custom SSE) requires changing only the transport layer, not the data model.
- **Cost at target scale:** ~$49-99/month at 100K notifications/day. Free tier covers prototyping (200K messages/day, 100 concurrent connections). Beyond that, the Startup plan at $49/month covers 1M messages/day and 500 connections.
- **Surprises:**
  - The Pusher client SDK adds ~45KB to the client bundle (gzipped). For a Next.js app that's aggressive about bundle size, this is notable but not disqualifying.
  - The auth endpoint pattern is clean and simple, but it's a critical security surface. If misconfigured, users could subscribe to other users' notification channels.
  - Pusher's free tier limit of 100 concurrent connections is quite low. A social app with 10K DAU could easily have 500+ concurrent connections during peak hours, pushing you into paid tier quickly.

### Prototype C: Supabase Realtime
- **Location:** `prototypes/c-supabase-realtime/`
- **Code complexity:** ~120 lines across 3 files (schema, hook, create function). The simplest prototype. No SSE route handler, no auth endpoint, no pub/sub configuration. The schema includes RLS policies and publication setup, but these are one-time declarations.
- **Architectural simplicity:** 2 components: Supabase (database + real-time + auth), client SDK. This is the fewest moving parts of any approach. Developer must understand Supabase's Realtime subscription API and Row Level Security, but doesn't need to think about transport protocols at all.
- **Deployment compatibility:** Excellent on Vercel. The Supabase client connects directly to Supabase's infrastructure -- no server-side connection management needed in your Next.js app. Works identically on any platform.
- **Single-write vs dual-write:** **Single write.** Insert a row into the notifications table. Supabase Realtime detects the INSERT via WAL replication and pushes it to subscribed clients. This is the cleanest write path of all three approaches.
- **Built-in reconnection handling:** Good. Supabase's client SDK handles WebSocket reconnection automatically. On reconnect, the subscription resumes. However, notifications that arrived during disconnection must be fetched explicitly (same as SSE approach).
- **Vendor coupling:** High. Tightly coupled to Supabase for database, auth, and real-time. Migrating away means replacing all three. However, the underlying database is standard PostgreSQL, so the schema and data are portable even if the real-time subscriptions are not.
- **Cost at target scale:** $0-25/month. Supabase Free tier includes 500 concurrent Realtime connections, 2GB database, and 50K monthly active users. The Pro plan at $25/month removes most limits. This is the cheapest option at scale.
- **Surprises:**
  - The `filter` parameter on `postgres_changes` subscription is essential. Without it, every client would receive every notification INSERT, and client-side filtering would be needed. With the filter (`recipient_id=eq.${userId}`), only the intended recipient receives the event. This is efficient and secure (combined with RLS).
  - The create-notification function is remarkably simple -- it's just a Supabase INSERT. The real-time delivery is entirely implicit. This is both a strength (simplicity) and a risk (harder to debug when things go wrong, because there's no explicit pub/sub call to inspect).
  - Supabase Realtime Postgres Changes has a known throughput limitation: it processes WAL events sequentially. For very high-write-volume tables, this can introduce latency. For a notification table at the target scale (100K inserts/day = ~1.2 inserts/second), this is a non-issue.

## Verdict

The key differentiating question was: **"How much operational complexity does each approach actually add, and does the transport work reliably?"**

Prototyping answered it clearly along two axes:

**1. Operational complexity ranking (simplest to most complex):**
1. Supabase Realtime -- fewest lines, fewest files, fewest concepts, single write
2. Pusher -- slightly more code, dual write, but excellent managed reconnection
3. SSE + PostgreSQL -- most code, subtle scaling cliffs (multi-instance fan-out, connection pool pressure)

**2. Deployment robustness on Vercel:**
1. Pusher -- zero server-side connection management; Pusher handles everything
2. Supabase Realtime -- Supabase handles connections; no server-side concern
3. SSE + PostgreSQL -- function timeout issues, connection pool pressure, multi-instance challenges

The SSE approach, while offering maximum control and zero vendor cost, has the most operational surprises. The single-write elegance of pg_notify is offset by the multi-instance fan-out problem and Vercel timeout constraints. It's the right choice for self-hosted deployments where you have full control over the runtime, but on Vercel it requires workarounds.

Pusher is the most deployment-robust option but introduces a third-party dependency and dual-write pattern.

Supabase Realtime is the simplest end-to-end if you adopt Supabase as your platform. The single-write pattern and implicit real-time delivery are genuinely elegant. The coupling concern is real but mitigated by the PostgreSQL foundation.

## Updated Understanding

Several insights emerged from prototyping that weren't visible during analysis:

1. **The UI layer is identical across all approaches.** The `useNotifications` hook has the same interface regardless of backend transport. This means the transport choice is a pure backend/infrastructure decision that doesn't affect the user experience code at all. Switching transports later is feasible -- you'd rewrite the hook internals and the create-notification function, but touch nothing in the UI.

2. **Single-write vs dual-write is more important than it appeared in analysis.** The Pusher approach requires careful error handling for the dual-write case. The SSE and Supabase approaches avoid this entirely because the real-time delivery is triggered by the database write itself. This makes them more reliable by default.

3. **The "zero vendor cost" of SSE is misleading at small scale.** While SSE has no per-message cost, the operational complexity (managing connections, handling multi-instance fan-out, dealing with Vercel timeouts) has a real engineering cost that may exceed $49/month of Pusher or $25/month of Supabase at small scale.

4. **Database choice strongly influences notification architecture choice.** If you're already using Supabase, approach 4a is the obvious winner. If you're using raw PostgreSQL, approach 1a or 2a makes more sense. The "best" notification approach is partly determined by what you've already chosen for your data layer.
