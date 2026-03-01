# Decision: Real-Time Notifications

## Selected Approach

**Supabase Realtime + PostgreSQL (Approach 4a)** -- Use Supabase as the database and real-time layer. Notifications are rows in a PostgreSQL table; Supabase Realtime automatically pushes inserts to subscribed clients via its built-in WebSocket infrastructure.

**Conditional alternative**: If the project is NOT using Supabase (or doesn't want to adopt it as the primary database), select **Pusher Channels + Custom PostgreSQL Storage (Approach 2a)** instead. The decision tree is:

```
Using Supabase already?  ──yes──>  Approach 4a (Supabase Realtime)
         │
         no
         │
         v
Willing to adopt Supabase?  ──yes──>  Approach 4a (Supabase Realtime)
         │
         no
         │
         v
Approach 2a (Pusher + PostgreSQL)
```

## Evidence for This Choice

### From prototyping:
- Supabase Realtime produced the **fewest lines of code** (120 lines vs 160 for Pusher vs 180 for SSE) and the **fewest files** (3 vs 4 for both alternatives)
- It is the only approach with a true **single-write** pattern -- inserting a row into the notifications table is the entire operation. No dual-write, no explicit pub/sub trigger, no pg_notify setup
- **Zero server-side connection management** -- Supabase handles the WebSocket infrastructure externally, so there's no connection pool pressure on the Next.js server

### From research:
- Supabase Realtime's Postgres Changes feature uses WAL replication to detect inserts, which is reliable and well-tested at the scale this project targets (~1.2 inserts/second at 100K notifications/day)
- Row Level Security provides authorization at the database level, reducing the security surface area compared to approaches that need custom auth endpoints (Pusher) or custom channel authorization (SSE)
- Supabase's free tier (500 concurrent Realtime connections, 50K MAU) covers the project through its initial growth phase

### From analysis:
- Lowest total cost: $0-25/month vs $49-99/month for Pusher vs $0 for SSE (but with hidden engineering costs)
- Best deployment compatibility: works on Vercel without any workarounds or timeout concerns
- Simplest mental model: "notifications are a table, inserts push to clients" is easier to reason about than "notifications are a table AND a pub/sub channel" or "notifications are a table AND an SSE stream with pg_notify"

## Why Not the Alternatives

### SSE + PostgreSQL (Approach 1a)
Rejected because of **operational complexity on Vercel**. Prototyping revealed three problems:
1. Vercel's function timeout (10s Hobby / 300s Pro) drops SSE connections, requiring constant reconnection. On Hobby tier, this makes the approach impractical.
2. Each SSE connection holds a PostgreSQL connection (for LISTEN). At scale, this pressures the connection pool -- a problem neither Pusher nor Supabase have because they manage connections externally.
3. Multi-instance deployments require adding Redis pub/sub for fan-out, which eliminates the "zero infrastructure" advantage.

The approach is excellent for **self-hosted Node.js deployments** where you control the runtime, but the problem brief lists Vercel as a target platform.

### Pusher Channels (Approach 2a)
Rejected as the primary recommendation (but retained as the conditional alternative) because:
1. **Dual-write complexity**: Every notification requires both a database INSERT and a Pusher trigger call. If either fails independently, the system enters an inconsistent state (notification exists but wasn't pushed, or was pushed but doesn't exist in the DB). Supabase's single-write avoids this entirely.
2. **Cost**: Pusher's free tier (100 concurrent connections) is limiting for even a moderately active social app. The Startup plan at $49/month is the effective baseline, vs $0-25/month for Supabase.
3. **Additional dependency**: Pusher adds a third-party service to the stack. Supabase consolidates database, auth, and real-time into one platform.

However, Pusher remains the right choice if you're NOT using Supabase for your database. Its deployment robustness and professional connection management are superior to custom SSE.

### Novu / Knock (Approaches 3a, 3b)
Not selected because the problem brief identifies multi-channel delivery (email, push) as "nice to have" rather than "must have." These platforms' primary value proposition is multi-channel orchestration, which isn't needed yet. Adopting them adds:
- A significant external dependency for a core feature
- Learning curve for their proprietary workflow/trigger abstractions
- Cost ($250/month for Novu paid, usage-based for Knock)
- Less control over the notification data model

If multi-channel becomes a MUST requirement, re-evaluate Novu (open-source, self-hostable) as a layer on top of whatever transport is chosen.

### Convex Reactive Queries (Approach 4b)
Not selected because adopting Convex as the primary database is a disproportionate commitment for a notification feature. Convex's reactivity makes notifications trivial, but it requires betting the entire data layer on a young, proprietary platform. The notification tail shouldn't wag the database dog.

## Implementation Plan

### Phase 1: Database Schema & Notification Creation (Day 1)

1. Create the `notifications` table with the schema from the prototype (`prototypes/c-supabase-realtime/schema.sql`)
2. Set up Row Level Security policies for the notifications table
3. Add the table to the `supabase_realtime` publication
4. Implement `createNotification()` server-side utility function
5. Wire notification creation into existing Server Actions for comments, likes, and follows

### Phase 2: Client-Side Real-Time (Day 1-2)

1. Implement the `useNotifications` hook with Supabase Realtime subscription
2. Build the `NotificationBell` component (based on shared prototype UI)
3. Add the notification bell to the app's header/navigation layout
4. Implement `markAsRead` and `markAllAsRead` functionality with optimistic updates

### Phase 3: Notification Feed (Day 2)

1. Create a full notification feed page with pagination (using Supabase's `.range()`)
2. Add notification type icons/avatars (different visual for comment vs like vs follow)
3. Implement click-through: clicking a notification navigates to the relevant content
4. Add "no notifications" empty state

### Phase 4: Polish & Edge Cases (Day 2-3)

1. Handle reconnection gracefully: fetch missed notifications on Supabase Realtime reconnect
2. Add loading skeletons for initial notification fetch
3. Implement notification count in the page title (`(3) App Name`)
4. Test with multiple browser tabs open (verify no duplicate notifications)
5. Add rate limiting on notification creation (prevent spam from rapid likes/unlikes)

### Phase 5: Future Extensions (Not Planned Yet)

- Per-user notification preferences (mute certain types)
- Email digest integration (daily/weekly summary)
- Browser push notifications (via Web Push API + service worker)
- Notification batching ("5 people liked your post")

## Known Risks and Mitigations

- **Risk:** Supabase Realtime Postgres Changes has throughput ceiling at very high write volumes
  - **Mitigation:** At the target scale (100K notifications/day = ~1.2/second), this is well within limits. If scale grows 10x, consider moving to Supabase's Broadcast channel (which bypasses WAL) or adding a Pusher layer for transport while keeping Supabase as the database.

- **Risk:** Supabase vendor coupling makes future migration harder
  - **Mitigation:** The notification schema is standard PostgreSQL. The `createNotification` function is a simple INSERT. The only Supabase-specific code is the client-side hook's subscription logic (~30 lines). If migrating away from Supabase, the hook would be rewritten to use SSE or Pusher -- the rest of the system (schema, create function, UI) is unchanged.

- **Risk:** Client reconnection gaps could cause missed real-time notifications
  - **Mitigation:** The hook fetches initial state on mount and should re-fetch after reconnection. Supabase's client SDK handles reconnection automatically. The notifications table is the source of truth -- anything missed in real-time is caught on next fetch.

- **Risk:** Notification volume grows beyond expectations (viral content, spam)
  - **Mitigation:** Add server-side rate limiting on notification creation (max N notifications per actor per recipient per hour). Add a batch/digest pattern for high-volume notification types (likes). These are additive changes, not architectural rewrites.

- **Risk:** Supabase free tier limits (500 concurrent Realtime connections) could be hit earlier than expected
  - **Mitigation:** Monitor connection count. The Pro plan at $25/month removes this limit. At 500+ concurrent connections, you likely have enough users to justify $25/month.
