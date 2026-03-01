# Analysis: Real-Time Notifications

## Tradeoff Matrix

| Criterion | 1a: SSE + Postgres | 1b: WebSocket + Postgres | 1c: Polling + Postgres | 2a: Pusher | 2b: Ably | 3a: Novu | 3b: Knock | 4a: Supabase Realtime | 4b: Convex | 5a: Upstash Redis + SSE |
|---|---|---|---|---|---|---|---|---|---|---|
| **MUST: Real-time < 5s** | ~1-2s delivery via SSE stream | ~500ms delivery via persistent WS | Depends on interval; 10s poll = 5-10s avg delay | ~1s via Pusher WS | ~1s via Ably WS | ~1-2s via Novu's transport | ~1-2s via Knock's transport | ~1-2s via Supabase WS | ~500ms via reactive subscription | ~1s via Redis pub/sub + SSE |
| **MUST: 3 notification types** | You build the types; full control | Same as 1a | Same as 1a | Same as 1a (Pusher is transport only) | Same as 1a | Built-in workflow per type; straightforward | Built-in event types; straightforward | You build the types; full control | You build the types; full control | You build the types; full control |
| **MUST: Unread tracking** | Custom: `read_at` column, COUNT query | Same as 1a | Same as 1a | Custom (Pusher has no state) | Custom (Ably has no persistent state) | Built-in read/unread in Inbox component | Built-in read/unread tracking | Custom: `read_at` column, Supabase query | Custom: query with filter on `read` field | Custom: Redis bitmap or sorted set tracking |
| **MUST: Reliable delivery** | DB is source of truth; SSE reconnects fetch from DB | DB is source of truth; Socket.io has reconnection | DB is source of truth; next poll catches up | Dual-write: DB + Pusher. If Pusher fails, DB has it; next refresh catches up | Dual-write + Ably message history for replay | Novu manages delivery; has retry logic | Knock manages delivery; has retry logic | DB is source of truth; Realtime subscription reconnects | DB is source of truth; reactive queries re-run on reconnect | Dual-write: Redis + DB. If Redis fails, need fallback |
| **MUST: Next.js App Router compatible** | Native: Route Handlers + ReadableStream | Requires custom server or sidecar | Native: Server Actions or Route Handlers | Native: client SDK in any component | Native: client SDK in any component | Native: `@novu/nextjs` package | Native: React components + hooks | Native: `@supabase/ssr` + client | Native: Convex React hooks | Native: Edge-compatible Route Handlers |
| **SHOULD: Extensible types** | Add a row type enum + handler function (~30 lines per type) | Same as 1a | Same as 1a | Same as 1a (~30 lines + Pusher event name) | Same as 1a (~30 lines + Ably channel config) | Add a workflow in Novu dashboard or code (~10 lines) | Add an event type in Knock dashboard (~5 min) | Same as 1a (~30 lines per type) | Add a mutation + query update (~20 lines) | Same as 1a (~30 lines + Redis key pattern) |
| **SHOULD: 30-day persistence** | Native: Postgres with `created_at` index | Same as 1a | Same as 1a | Your DB handles this (Pusher has no storage) | Your DB handles this (Ably history maxes at 72h) | Novu stores notification history | Knock stores notification history | Native: Postgres with retention policy | Native: Convex stores all data | Redis TTL handles expiry; need separate long-term store |
| **SHOULD: Preference foundation** | Custom: `notification_preferences` table (~200 lines) | Same as 1a | Same as 1a | Same as 1a | Same as 1a | Built-in: per-subscriber, per-channel preferences | Built-in: sophisticated preference model | Custom: same as 1a | Custom: preferences table + query filter | Custom: same as 1a |
| **SHOULD: Graceful degradation** | SSE reconnects automatically; falls back to REST query | Socket.io has built-in fallback (long-polling) | Already polling; degradation is slower polling | Pusher SDK has automatic fallback | Ably SDK has automatic fallback | Inbox component handles offline state | Knock components handle offline state | Supabase client reconnects automatically | Convex client reconnects and re-syncs | SSE reconnects; falls back to Redis REST query |
| **SHOULD: Reasonable cost** | $0 (your own Postgres + compute) | $0 (your own infra, but more compute) | $0 (your own Postgres + compute) | $0-49/month depending on scale | $0-49.99/month depending on scale | $0-250/month (big jump to paid) | $0 for 10K notifs/month; usage-based after | $0 on Supabase free tier; $25/month Pro | $0 on free tier; usage-based | $0.30/100K requests on Upstash |
| **NICE: Multi-channel ready** | Must build email/push separately | Same as 1a | Same as 1a | Pusher is in-app only; email/push separate | Ably is in-app only; email/push separate | Built-in: email, SMS, push, chat | Built-in: email, SMS, push, Slack | In-app only; email/push separate | In-app only; email/push separate | In-app only; email/push separate |
| **NICE: Batching/digest** | Custom: cron job + aggregation query (~300 lines) | Same as 1a | Same as 1a | Custom | Custom | Built-in: digest workflow step | Built-in: batching and digest | Custom | Custom | Custom |
| **NICE: Unread count without full feed** | Single COUNT query; ~1ms | Same as 1a | Same as 1a | Separate count channel or REST call | Same as Pusher | Built-in in Inbox component | Built-in count endpoint | Single COUNT query via Supabase | Query with count aggregation | Redis ZCARD on sorted set; ~0.1ms |

## Eliminated

- **1b: WebSocket (Socket.io) + PostgreSQL**: Eliminated because it **fails MUST criterion #5 (Next.js compatible on standard deployment targets)**. WebSockets do not work on Vercel's serverless architecture. Since the problem brief lists Vercel as a target deployment platform, and WebSocket requires a dedicated long-running server, this approach requires additional infrastructure beyond Next.js. The bidirectional capability is also unnecessary for notifications. If the project were self-hosted only, this would be viable.

- **1c: Polling + PostgreSQL**: Eliminated because it **marginally fails MUST criterion #1 (real-time < 5s)**. With a 10-second poll interval, average notification delay is 5 seconds and worst case is 10 seconds. Reducing to 3-second polling meets the requirement but creates 333 requests/second at 1K concurrent users. The economics don't work. However, this is retained as a **degradation fallback** strategy, not a primary approach.

- **4b: Convex Reactive Queries**: Eliminated because adopting Convex as the primary database is a **disproportionate architectural commitment** for a notification feature. While Convex makes real-time trivial, it requires betting the entire data layer on a young, proprietary platform. This violates the complexity budget principle -- notifications shouldn't drive your database choice. If you were already choosing Convex for other reasons, this would be the obvious notification approach.

- **5a: Upstash Redis + SSE**: Eliminated because of the **dual-write complexity and data model mismatch**. Notifications have relational properties (link to post, link to commenter, etc.) that are awkward to model in Redis. Using Redis as the primary notification store means either denormalizing aggressively or maintaining two data stores. The operational overhead of keeping Redis and Postgres in sync outweighs the edge-runtime benefits for this use case.

- **2b: Ably Realtime**: Eliminated as a finalist because it's **substantively similar to Pusher (2a) but with more complexity**. Ably's stronger delivery guarantees and message replay are valuable for financial or critical systems, but social notifications (comments, likes, follows) don't need guaranteed-delivery semantics -- a missed real-time push that appears on next page load is acceptable. Pusher's simpler mental model wins for this use case.

## Finalists

1. **SSE + PostgreSQL (Approach 1a)** -- from Paradigm 1 (Custom-Built). Selected because it offers full ownership with zero external service dependencies, works on Vercel, uses standard web APIs, and keeps notification data as first-class SQL entities. It's the "build it right" approach for teams that want to understand and control every piece.

2. **Pusher Channels + Custom Storage (Approach 2a)** -- from Paradigm 2 (Managed Pub/Sub). Selected because it separates the hard problem (real-time transport at scale) from the domain problem (notification data model). Fastest path to production-quality real-time delivery with professional connection management, while still owning your notification data model and business logic.

3. **Supabase Realtime + Postgres (Approach 4a)** -- from Paradigm 4 (Reactive Database). Selected because if the project uses (or is open to) Supabase, this is the lowest-total-complexity option -- notifications are just a table with a real-time subscription. It collapses the database, real-time transport, and auth into a single platform.

**Note on Novu (3a) and Knock (3b)**: These are strong options if multi-channel is a near-term need, but they were not selected as finalists because: (a) the problem brief prioritizes in-app notifications with multi-channel as "nice to have," (b) Novu's $250/month paid tier and Knock's vendor lock-in are concerns for a budget-conscious project, and (c) buying a full notification service for a greenfield app means less understanding of how your own system works. If multi-channel were a MUST, Novu would be a finalist.

## Key Differentiator

**What single question would make the choice clear?**

"How much operational complexity does each approach actually add to the development workflow, and does SSE's connection management on Vercel work reliably enough for production use?"

The theoretical tradeoffs are well-understood. What's uncertain is the *practical experience*:
- Does SSE on Vercel actually reconnect gracefully, or do users experience janky notification gaps?
- Is the Pusher SDK integration as seamless as documented, or are there Next.js App Router gotchas?
- Does Supabase Realtime's Postgres Changes subscription actually deliver at low latency for filtered inserts?

These are questions that only prototyping can answer.

## Open Risks

1. **Vercel SSE timeout behavior**: SSE connections on Vercel are subject to function execution duration limits. On the Hobby plan, that's 10 seconds. On Pro, it's 300 seconds. This means SSE connections will be dropped and must reconnect. The question is whether this creates perceptible notification gaps.

2. **Supabase Realtime at scale**: Supabase's Postgres Changes feature replicates WAL events. For high-write-volume tables, this can create backpressure. The notification table is likely low-to-moderate volume, but this should be validated.

3. **Multi-process fan-out for SSE**: On a self-hosted setup with multiple Node.js processes, SSE requires a shared pub/sub layer (Redis) to fan out events to the correct process. This adds complexity that doesn't exist with managed services like Pusher.

4. **Notification preferences complexity**: All three finalists require building preferences from scratch. This is a significant future engineering effort that none of the finalist approaches simplify (unlike Novu/Knock which have it built in).
