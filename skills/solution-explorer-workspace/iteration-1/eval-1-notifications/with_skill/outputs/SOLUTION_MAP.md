# Solution Map: Real-Time Notifications

## Paradigm 1: Custom-Built with Direct Transport

**Core bet**: You own the full stack. Notifications are first-class data in your database, and you pick a transport layer to push them to connected clients. Maximum control, maximum responsibility.

### Approach 1a: SSE (Server-Sent Events) + PostgreSQL

- **How it works:** Notification events are written to a `notifications` table in PostgreSQL. A Next.js Route Handler opens an SSE stream per connected client. When a notification-triggering action occurs (comment, like, follow), the API route that handles the action also writes to the notifications table and signals the SSE connection. The signal mechanism can be PostgreSQL LISTEN/NOTIFY (the DB tells the server process a new row was inserted), an in-memory pub/sub (if single-process), or Redis pub/sub (if multi-process). The client uses the `EventSource` API to receive real-time updates. On reconnection, the client fetches missed notifications via a standard REST/Server Action query using a `last_seen_id` cursor.

- **Gains:**
  - No external real-time service dependency -- everything runs on your own infra
  - SSE is natively supported in Next.js Route Handlers via `ReadableStream`
  - Works on Vercel (SSE is supported, unlike WebSockets)
  - Notifications are queryable SQL data -- easy to paginate, filter, aggregate
  - Automatic reconnection built into the `EventSource` API
  - Unidirectional (server-to-client) is exactly what notifications need

- **Gives up:**
  - SSE has a browser limit of ~6 concurrent connections per domain (HTTP/2 mitigates this)
  - Need to handle multi-process fan-out yourself (Redis pub/sub or similar) once you scale past a single server instance
  - On Vercel, SSE connections have timeout limits (function execution duration); need to handle reconnects gracefully
  - Must build the notification storage, querying, read-state tracking from scratch

- **Shines when:** You want full ownership, are deploying to Vercel or similar, and your scale is moderate (< 50K concurrent connections)

- **Risks:**
  - Vercel's serverless function timeout (default 10s, up to 300s on Pro) means SSE connections get dropped periodically and must reconnect
  - PostgreSQL LISTEN/NOTIFY doesn't persist messages -- if no listener is connected when the event fires, it's lost (mitigated by the notifications table being the source of truth)
  - Connection management complexity grows with scale

- **Complexity:** moderate

### Approach 1b: WebSocket (Socket.io) + PostgreSQL

- **How it works:** A persistent WebSocket server (using Socket.io or `ws`) maintains bidirectional connections with clients. When a notification-triggering action occurs, the server writes to the notifications table and emits the event to the target user's socket room. The client receives instant updates. A separate REST/Server Action endpoint handles historical notification queries.

- **Gains:**
  - True bidirectional communication (useful if you later need typing indicators, presence, etc.)
  - Mature ecosystem (Socket.io has reconnection, room management, fallbacks built in)
  - Lower latency than SSE in some scenarios due to persistent TCP connection
  - Can handle very high message rates efficiently

- **Gives up:**
  - **Does not work on Vercel's serverless architecture** -- requires a dedicated long-running server process
  - Requires a separate WebSocket server alongside the Next.js app (or a custom server wrapping Next.js)
  - More complex deployment topology
  - Socket.io adds ~45KB to client bundle
  - Bidirectional capability is overkill for notifications (server-to-client only)

- **Shines when:** You're self-hosting on a VPS/container and plan to build additional real-time features (chat, presence, collaborative editing)

- **Risks:**
  - Deployment complexity: running a WebSocket server alongside Next.js means custom infrastructure
  - Socket.io has scaling challenges (need sticky sessions or Redis adapter for multi-instance)
  - Locks you out of Vercel unless you add a sidecar service (e.g., on Railway, Fly.io)

- **Complexity:** moderate-to-complex

### Approach 1c: Polling + PostgreSQL

- **How it works:** The simplest possible approach. Notifications are written to a `notifications` table. The client polls a REST endpoint (or Server Action) every N seconds to check for new notifications. An unread count endpoint returns quickly. The full notification feed is loaded on demand.

- **Gains:**
  - Dead simple to implement -- no special transport, no connection management
  - Works everywhere: Vercel, Cloudflare, any serverless platform
  - No state to manage on the server side
  - Easy to reason about, debug, and monitor
  - Zero additional infrastructure

- **Gives up:**
  - Not truly real-time: notifications appear with a delay equal to the poll interval
  - Wasteful: most polls return empty results, especially for low-activity users
  - At 10-second polling with 10K connected users, that's 1K requests/second to your API with mostly empty responses
  - Feels sluggish to users compared to push-based approaches

- **Shines when:** You need to ship fast, scale is tiny, and "real-time" means "within 15-30 seconds" is acceptable

- **Risks:**
  - Polling at aggressive intervals (1-2s) creates meaningful server load at scale
  - Users with the app open in multiple tabs multiply the load
  - Hard to make it feel instantaneous without defeating the efficiency purpose

- **Complexity:** simple

---

## Paradigm 2: Managed Real-Time Infrastructure (Pub/Sub as a Service)

**Core bet**: Outsource the hard part (maintaining persistent connections at scale, global fan-out, guaranteed delivery) to a specialized service. You focus on business logic.

### Approach 2a: Pusher Channels + Custom Storage

- **How it works:** When a notification-triggering action occurs, your API writes the notification to your database AND publishes an event to a Pusher channel (e.g., `private-user-{userId}`). The client subscribes to their user channel via the Pusher JS SDK. Pusher handles the transport (WebSocket with fallbacks), connection management, and global distribution. Notification persistence, querying, and read-state are still managed by your database.

- **Gains:**
  - Battle-tested at scale (used by GitHub, Mailchimp, etc.)
  - Client SDK handles reconnection, fallbacks, and connection state
  - Works on Vercel -- no WebSocket server needed on your side
  - Private channels with auth prevent users from snooping on others' notifications
  - Presence channels available if you later want "who's online" features

- **Gives up:**
  - Third-party dependency for real-time delivery
  - Cost: free tier is 200K messages/day, 100 concurrent connections. Paid starts at $49/month
  - Dual-write problem: must write to both your DB and Pusher, and handle failures in either
  - Pusher is transport only -- you still build notification storage, preferences, and UI

- **Shines when:** You want real-time that "just works" without managing connection infrastructure, and you're okay with a managed service cost

- **Risks:**
  - Vendor lock-in for the transport layer (though switching pub/sub providers is less painful than switching databases)
  - If Pusher has an outage, real-time notifications stop (but persisted notifications are still queryable)
  - Cost can surprise at scale: 1M messages/day on Pusher costs ~$100-200/month

- **Complexity:** simple-to-moderate

### Approach 2b: Ably Realtime + Custom Storage

- **How it works:** Similar to Pusher but using Ably's platform. Ably provides guaranteed message delivery with message history, so even if the client disconnects briefly, it can retrieve missed messages from Ably's buffer (up to 2 minutes on free tier, 24-72 hours on paid).

- **Gains:**
  - Message history/replay -- clients can catch up on missed messages without hitting your DB
  - Usage-based pricing (pay per message, not per connection tier) -- better for unpredictable traffic
  - Global edge network for low-latency delivery
  - Stronger delivery guarantees than Pusher

- **Gives up:**
  - Similar third-party dependency as Pusher
  - Slightly more complex SDK and concepts (channels, presence, history)
  - Cost: free tier is 6M messages/month, paid starts at $49.99/month
  - Still need your own notification storage for long-term persistence and querying

- **Shines when:** Reliable delivery matters (financial notifications, critical alerts) and you want message replay built in

- **Risks:**
  - Over-engineering for social notifications where occasional missed real-time delivery is acceptable (user sees it on next page load)
  - More complex mental model than simpler alternatives

- **Complexity:** moderate

---

## Paradigm 3: Notification-as-a-Service (Full Stack)

**Core bet**: Don't just outsource transport -- outsource the entire notification system: storage, preferences, UI components, multi-channel delivery. Notifications are a solved problem; buy it.

### Approach 3a: Novu (Open Source)

- **How it works:** Novu provides a complete notification infrastructure. You define notification workflows (templates) in code or their dashboard. When a triggering action occurs, you call `novu.trigger('comment-on-post', { to: userId, payload: { ... } })`. Novu handles routing, delivery, storage, and provides a pre-built `<Inbox />` React component that drops into your Next.js app. It supports in-app, email, SMS, push, and chat channels.

- **Gains:**
  - Full notification system in ~6 lines of integration code
  - Pre-built, customizable inbox UI component (`@novu/nextjs`)
  - Multi-channel out of the box (in-app + email + push)
  - Open source with self-hosting option -- no vendor lock-in
  - Workflow builder for complex notification logic (digests, delays, conditions)
  - Notification preferences per user, per channel built in

- **Gives up:**
  - Another service to run/manage (even self-hosted has operational overhead)
  - Less control over notification data model and storage
  - Pre-built UI may not match your design system without significant customization
  - Learning curve: Novu's concepts (workflows, triggers, subscribers, topics) are its own abstraction layer
  - Cloud pricing: free tier is 30K events/month, paid starts at $250/month for teams

- **Shines when:** You want multi-channel notifications quickly and notification preferences are a priority

- **Risks:**
  - Dependency on Novu's abstraction layer for a core feature
  - If you outgrow Novu or it goes in a direction you don't like, migration is painful (your notification logic lives in their workflow definitions)
  - $250/month cloud tier is steep for a small app

- **Complexity:** simple (integration) / moderate (customization)

### Approach 3b: Knock

- **How it works:** Similar to Novu but fully managed (no self-host option). Knock provides an API for triggering notifications, manages delivery across channels, stores notification history, handles preferences, and offers React components for in-app notification feeds. Vercel uses Knock for their own notifications, which is a strong signal for Next.js compatibility.

- **Gains:**
  - Used by Vercel themselves -- best-in-class Next.js integration
  - Fastest time-to-working-demo of any option (~1 hour)
  - Managed infrastructure -- zero operational burden
  - Sophisticated features: batching, digests, schedules, preferences
  - Clean API design and good documentation

- **Gives up:**
  - Fully managed only -- no self-host escape hatch
  - Cost: free tier is 10K notifications/month. Paid plans are usage-based
  - Your notification data lives in Knock's infrastructure
  - Even more of a black box than Novu

- **Shines when:** Speed of implementation is the top priority and you trust managed services for core features

- **Risks:**
  - Vendor lock-in with no self-host option
  - Pricing can escalate as notification volume grows
  - Your notification UX is constrained by Knock's component capabilities (or you build custom UI against their API)

- **Complexity:** simple

---

## Paradigm 4: Reactive Database (Notifications as Queries)

**Core bet**: Instead of building a notification "system," use a database that natively supports real-time subscriptions. Notifications become just another query that auto-updates when the underlying data changes. No pub/sub layer, no transport management -- the database IS the real-time layer.

### Approach 4a: Supabase Realtime + Postgres

- **How it works:** Notifications are rows in a Supabase Postgres table. The client subscribes to changes on the `notifications` table filtered by `user_id` using Supabase's Realtime feature (built on Phoenix Channels/WebSocket). When a new notification row is inserted, the subscription automatically pushes the change to the client. Notification querying, pagination, and read-state use standard Supabase queries. Row Level Security ensures users only see their own notifications.

- **Gains:**
  - If you're already using Supabase, this is essentially "free" -- notifications are just another table with a subscription
  - Real-time is a built-in feature of the platform, not a bolt-on
  - Full SQL access to notification data
  - Row Level Security provides authorization without extra code
  - Generous free tier: 500 concurrent Realtime connections, 200MB database

- **Gives up:**
  - Tightly coupled to Supabase -- harder to migrate if you leave
  - Supabase Realtime has limitations: Postgres Changes has a throughput ceiling, and complex filters can be slow
  - No built-in notification abstractions (preferences, batching, digests) -- you build those yourself
  - Realtime broadcasts to all subscribers matching the filter; at scale, this creates DB load

- **Shines when:** Supabase is already your database/auth provider, or you're evaluating it for the project

- **Risks:**
  - Supabase Realtime Postgres Changes replicates WAL events, which at very high write volumes can create backpressure
  - Scaling past ~10K concurrent Realtime connections requires careful planning
  - If you need multi-channel notifications later, Supabase doesn't help with email/push

- **Complexity:** simple (if already on Supabase) / moderate (if adopting Supabase for this)

### Approach 4b: Convex Reactive Queries

- **How it works:** Convex is a reactive database where queries automatically re-execute when their dependencies change. You write a `getNotifications(userId)` query function; Convex tracks which table rows it reads and pushes updated results to the client whenever those rows change. Zero subscription management code -- it's built into the query model.

- **Gains:**
  - True reactivity: zero subscription boilerplate, queries just update
  - Consistency guarantees: all clients see the same snapshot of data
  - TypeScript-native: query functions are just TypeScript
  - Handles the connection management, reconnection, and state sync automatically
  - Generous free tier for small apps

- **Gives up:**
  - Requires adopting Convex as your database -- this is a foundational choice, not just a notification decision
  - Young platform with a smaller ecosystem than PostgreSQL
  - Less control over query optimization (Convex decides how to index and serve)
  - Vendor lock-in to Convex's proprietary data model

- **Shines when:** You're starting greenfield and open to a non-traditional database that makes real-time trivial

- **Risks:**
  - Betting your entire data layer on a relatively new platform
  - If Convex doesn't work out, migration is expensive (proprietary query model)
  - Limited ecosystem for tooling, ORMs, admin panels compared to Postgres

- **Complexity:** simple (for notifications) / complex (for the platform commitment)

---

## Paradigm 5: Edge-First / Serverless-Native

**Core bet**: Embrace the serverless constraint instead of fighting it. Use patterns designed for stateless, ephemeral execution: edge KV stores for fast reads, webhooks for event propagation, and client-side intelligence for real-time feel.

### Approach 5a: Upstash Redis + SSE at the Edge

- **How it works:** Notification events are published to Upstash Redis channels. An Edge-compatible SSE endpoint subscribes to the user's Redis channel and streams events to the client. Notification history is stored in Redis Sorted Sets (sorted by timestamp) for fast retrieval. Upstash's REST-based Redis protocol works in edge runtimes where TCP connections are unavailable.

- **Gains:**
  - Works in Vercel Edge Runtime (no Node.js runtime needed)
  - Upstash Redis is designed for serverless: per-request pricing, global replication
  - Redis Sorted Sets are excellent for chronological feeds (notifications are a natural fit)
  - Sub-millisecond reads for notification counts and recent items
  - Built-in TTL for automatic notification expiry

- **Gives up:**
  - Redis is not a relational database -- complex queries (e.g., "all notifications where the source post has been deleted") require denormalization
  - Upstash has per-request pricing that could surprise at high poll/subscription rates
  - Less familiar data modeling patterns for most developers
  - No built-in notification abstractions

- **Shines when:** You're deploying to Vercel's Edge Runtime and want sub-millisecond notification delivery with minimal infrastructure

- **Risks:**
  - Redis as primary notification store means no referential integrity with your main database
  - Need to keep Redis and your primary DB in sync (dual-write problem)
  - Upstash Redis channels don't guarantee delivery if no subscriber is listening

- **Complexity:** moderate

---

## Non-obvious Options

### Hybrid: Polling with Optimistic Cheating

Instead of building real-time infrastructure, combine polling with **optimistic local notifications**. When user A comments on user B's post, the API writes the notification to the DB. User B's client polls every 30 seconds. BUT -- for the common case where user B is looking at the same post -- the comment mutation's response includes a flag that triggers a local notification immediately. This gives instant feedback in the most common scenarios (both users on the same page) and acceptable delay elsewhere. No WebSocket, no SSE, no pub/sub service. This is a "good enough" approach that many successful apps (early Twitter, early Instagram) used.

### Reframe: Do You Need Real-Time at All?

For a social app with comments, likes, and follows, the notification latency tolerance is actually quite high. Nobody expects to see a notification the instant someone likes their post. A 15-30 second delay is imperceptible in this context. The real requirement is an **unread badge that updates reasonably quickly** and a **notification feed that's complete when opened**. This reframe suggests that aggressive polling (every 10-15 seconds for just the unread count -- a tiny payload) combined with on-demand feed loading might be the right answer. It's the simplest architecture that meets actual user needs.

### The "Game Developer" Approach: Client-Predicted Notifications

Borrow from game networking: the client maintains a local model of who might notify them. When the user's content gets viewed (trackable via analytics), the client optimistically predicts "notifications incoming" and pre-renders a placeholder. When the real notification arrives (via poll or push), it replaces the prediction. This makes the perceived latency near-zero for common patterns.

### Server Actions + Streaming: Next.js Native

Use Next.js Server Actions for all mutation operations (comment, like, follow). In the Server Action response, include a `revalidatePath` or `revalidateTag` call that invalidates the notification count on the recipient's next server component render. Combine with React's `useOptimistic` hook for instant local feedback. This is not technically "real-time push" but leverages Next.js's built-in cache invalidation to keep notification state fresh. It works entirely within the Next.js paradigm with zero additional infrastructure.

---

## Eliminated Early

- **Firebase Cloud Messaging (FCM) for web push only**: FCM is excellent for native push notifications but overkill and awkward as the primary in-app notification transport. It requires service worker setup, VAPID key management, and user permission prompts. Better suited as a secondary channel (browser push when tab is closed) rather than the core in-app system. Could be added later on top of any approach.

- **Liveblocks**: Designed for collaborative editing scenarios (cursors, shared text, presence). Has notification features, but they're tightly coupled to their collaboration model. Using Liveblocks just for notifications would mean adopting an entire collaboration platform for one feature.

- **GraphQL Subscriptions**: Adds the complexity of a GraphQL layer (schema, resolvers, codegen) just for notifications. Unless the app is already GraphQL-based, this is a heavy dependency for a single feature. The transport underneath is still WebSocket, so it shares the same deployment constraints as Approach 1b.

- **Apache Kafka / RabbitMQ**: Enterprise-grade message brokers that are wildly over-powered for a small-to-medium social app's notification needs. Operational complexity is enormous. Not appropriate until you're processing millions of events per day across multiple consumers.

- **Custom WebTransport**: Emerging standard that could eventually supersede WebSocket and SSE, but browser support is still incomplete (no Safari as of early 2026) and Next.js/Node.js ecosystem support is immature. Worth watching, not worth building on today.
