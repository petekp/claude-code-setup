# Decision: Real-Time Notifications

## Selected Approach

**Upstash Realtime + Custom Notification Layer** -- Build the notification system on your own data model with Upstash Realtime handling the real-time transport. Start with core features (feed, unread count, read state) and add sophistication incrementally.

## Evidence for This Choice

**From prototyping:**
- The core notification system (feed, unread count, read state, real-time delivery) requires ~280 lines of code -- meaningful but not burdensome for a small team. The code is straightforward and debuggable.
- Upstash Realtime is serverless-native, works on Vercel out of the box, and has a tiny client footprint (1.9kB). No infrastructure to manage beyond an Upstash Redis instance.
- The dual-write concern (DB write + event emit) is real but manageable: emit after successful DB write, and on failure, the notification is still in the database and will appear on next page load (graceful degradation per MUST criterion #2).

**From research:**
- Upstash Realtime has Zod-based type safety, automatic connection management, and history support for catching up on missed events. The DX is modern and aligns with the TypeScript-first approach specified in the project's CLAUDE.md.
- Serverless-compatible real-time delivery without a separate WebSocket server is a hard constraint on Vercel, and Upstash solves this cleanly.
- Cost starts at $0 (free tier: 10K commands/day) and scales gradually ($10/month for higher usage), avoiding the cliff from Knock's $0 to $250/month jump.

**From analysis:**
- Upstash Realtime passes all MUST criteria. The "YOU BUILD" items for SHOULD criteria (feed UI, extensible types) are within the team's capability, and the items that are harder to build later (batching, multi-channel) are explicitly SHOULD/NICE -- not launch requirements.
- Vendor lock-in is minimal: Upstash-specific code is ~30 lines (the emit call and the useRealtime hook). The notification data model, API routes, and UI are yours regardless of transport.
- The approach aligns with the "walk before you run" philosophy: start with what you need, add what you want, and never be forced into a migration.

## Why Not the Alternatives

- **Knock (1a):** Knock is the most feature-complete option and would be the right choice if batching, multi-channel delivery, and preference management were MUST requirements. They aren't -- they're SHOULD/NICE. Paying $250/month (the first paid tier) for features you don't need yet, while losing ownership of your notification data and coupling your UX to Knock's React components, is premature optimization. If the app grows to need batching and email digests, migrating to Knock later is feasible: the notification data model and API can be adapted to trigger Knock workflows instead of (or in addition to) Upstash events. **Evidence:** The prototype showed Knock requires ~90 lines of code vs. ~280, but the missing 190 lines are straightforward CRUD and UI -- not novel infrastructure. The real Knock value (batching, digests, multi-channel) addresses problems the app doesn't have yet.

- **Convex (4a):** Convex offers the most elegant architecture -- database reactivity as notification delivery is genuinely beautiful. But choosing Convex for notifications means choosing Convex for everything. This is a greenfield app, so it's technically possible, but the commitment is disproportionate to the feature. PostgreSQL + Drizzle (or Prisma) is a more conventional and flexible backend choice with a larger ecosystem, more community knowledge, and easier hiring. If the team were already on Convex or evaluating it for other reasons, this would be the top choice. **Evidence:** The prototype confirmed the elegance (zero transport code, transactional consistency) but also revealed pain points (no bulk updates, full platform commitment, smaller ecosystem). The architectural beauty doesn't justify the scope of the bet for a single feature.

- **Supabase Realtime (2b):** Conditionally eliminated because it requires Supabase as the database. If the app were already on Supabase, this would be a strong contender (simpler than Upstash, no dual-write problem). But adopting Supabase specifically for notification delivery is a tail-wagging-the-dog decision. **Evidence:** Research showed Supabase Realtime has had reliability concerns at scale and Postgres logical replication adds database load.

- **Pusher/Ably (2c):** These are mature, reliable real-time transports, but they're more expensive than Upstash ($49/month for Pusher's first paid tier vs. $10/month for Upstash) and designed for generic pub/sub rather than the serverless-native, Next.js-optimized experience that Upstash provides. They solve the same problem with more cost and less DX. **Evidence:** Pricing research showed Pusher at $49/month for 500 concurrent connections; Upstash scales more gradually from its free tier.

- **Polling (5a):** Fails the real-time MUST criterion. While it's the simplest approach and would work as a fallback, the 5-15 second latency doesn't meet the 1-3 second requirement. **Evidence:** The tradeoff matrix showed this is the only approach that fails a MUST criterion.

## Implementation Plan

### Phase 1: Data Model and Core API (Day 1)

1. **Create the notifications database table** using Drizzle ORM:
   - Columns: id, type (enum: comment/like/follow), recipientId, actorId, actorName, actorAvatar, targetId, targetTitle, message, read (boolean), createdAt
   - Indexes: `(recipientId, read)` for unread count queries, `(recipientId, createdAt DESC)` for feed pagination

2. **Create server actions for notification triggers:**
   - `createNotification(type, recipientId, actorId, ...)` -- inserts a row and emits an Upstash Realtime event
   - Wire into existing actions: `createComment`, `likePost`, `followUser` each call `createNotification` after their primary operation

3. **Create API routes:**
   - `GET /api/notifications` -- paginated feed for current user
   - `GET /api/notifications/unread-count` -- unread count for current user
   - `POST /api/notifications/mark-read` -- mark one or all as read

### Phase 2: Real-Time Transport (Day 1-2)

4. **Set up Upstash Redis and Realtime:**
   - Create Upstash Redis instance (free tier)
   - Install `@upstash/realtime` and configure Zod event schema
   - Create the Realtime route handler (`GET /api/notifications/realtime`)

5. **Implement server-side event emission:**
   - After successful DB write in `createNotification`, call `realtime.emit("notification.created", { ... })`
   - Handle emit failure gracefully (log error, don't fail the parent operation)

### Phase 3: Client UI (Day 2-3)

6. **Build the `useNotifications` hook:**
   - Fetch initial data (unread count + recent notifications) on mount
   - Subscribe to `useRealtime` for live updates
   - Optimistic updates for mark-as-read

7. **Build the notification bell component:**
   - Unread count badge
   - Click to open notification feed popover

8. **Build the notification feed component:**
   - List of recent notifications with read/unread visual state
   - Click to mark as read (and navigate to the relevant content)
   - "Mark all as read" action
   - Empty state

### Phase 4: Polish and Edge Cases (Day 3-4)

9. **Handle edge cases:**
   - Don't notify yourself (if you comment on your own post)
   - Deduplicate: if someone likes, unlikes, and re-likes, don't send 2 notifications
   - Reconnection: when `useRealtime` reconnects, reconcile with database state
   - Stale data: if notification was marked as read on another device, the real-time stream won't know. Periodic refetch (every 60s) as a safety net.

10. **Add toast notifications** for high-salience events (new follower, comment) using Sonner or similar.

### Future Phases (Not Now)

- **Batching/digests:** Aggregate likes on the same post within a time window. Requires a background job (Upstash QStash or similar) to coalesce events before creating the notification row.
- **Email channel:** Use Resend or Postmark to send email for notifications when user hasn't been active in N minutes. Requires notification preferences.
- **Preferences:** Let users toggle notification types on/off per channel. Simple preferences table + check in `createNotification`.
- **Push notifications:** Add Web Push API via FCM for when the tab isn't focused. Orthogonal to in-app delivery.

## Known Risks and Mitigations

- **Risk:** Dual-write inconsistency -- DB write succeeds but Upstash emit fails (or vice versa).
  **Mitigation:** Always write to DB first. If emit fails, the notification is persisted and will appear on next page load or periodic refetch. Log emit failures for monitoring. This degrades to "slightly delayed" rather than "lost."

- **Risk:** Upstash Realtime is a relatively new product. Reliability at scale is less proven than Pusher or Ably.
  **Mitigation:** The fallback path is polling. If Upstash Realtime has issues, the periodic refetch (60s safety net) ensures notifications still appear. Worst case, replacing Upstash with Pusher or Ably requires changing ~30 lines of code.

- **Risk:** Channel targeting / message leakage. Upstash Realtime may broadcast events to all subscribers rather than targeting specific users.
  **Mitigation:** Implement per-user channels in Upstash (e.g., channel name = `notifications:${userId}`). Verify this works correctly before shipping. If per-user channels aren't supported, filter on the client and treat it as a known limitation (wasteful but secure if recipient filtering is server-validated).

- **Risk:** The "YOU BUILD" features (batching, preferences, multi-channel) become needed sooner than expected.
  **Mitigation:** The data model and API are transport-agnostic by design. Migrating to Knock for these features is feasible without a full rewrite. The notification table, feed UI, and read state logic all carry over.

- **Risk:** Notification volume causes database query performance issues as the table grows.
  **Mitigation:** Proper indexes on `(recipientId, read)` and `(recipientId, createdAt)`. Consider archiving or deleting notifications older than 90 days. Unread count query can be cached in Redis if needed.
