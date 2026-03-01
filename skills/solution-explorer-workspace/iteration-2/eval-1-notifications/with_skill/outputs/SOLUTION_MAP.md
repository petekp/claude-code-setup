# Solution Map: Real-Time Notifications

## Paradigm 1: Managed Notification Infrastructure (Outsource the Problem)

**Core bet:** Notifications are a solved, commoditized problem. The fastest and most reliable path is to pay a service that specializes in this, rather than building and maintaining notification infrastructure yourself.

### Approach 1a: Knock

- **How it works:** Knock is a managed notification-as-a-service platform. You trigger notifications from your server by calling the Knock API (e.g., `knock.notify("new-comment", { recipients: [postAuthor.id], data: { ... } })`). Knock handles workflow orchestration (batching, delays, digests), multi-channel delivery (in-app, email, push, SMS), and provides embeddable React components (`<NotificationFeed />`, `<NotificationIconButton />`) that connect to their real-time feed via WebSocket. Your backend becomes a thin event emitter; Knock does everything downstream.
- **Gains:** Near-zero infrastructure to manage. Batching/digests ("Alice and 4 others liked your post") are built-in. Multi-channel support from day one. Notification preferences UI provided. Real-time feed with unread counts out of the box. Enterprise-grade reliability (99.99% SLA). TypeScript SDK with excellent DX. Vercel-compatible (just API calls from server actions).
- **Gives up:** Vendor lock-in to Knock's data model and workflow engine. Pricing jumps from free (10K notifications/month) to $250/month with no intermediate tier. Notification data lives in Knock's infrastructure, not your database. Customization of the notification feed UI is constrained by their component API. You don't own the real-time transport layer.
- **Shines when:** You want to ship fast, don't want to build notification infrastructure, and plan to expand to email/push/SMS. The team is small and values operational simplicity over control.
- **Risks:** Cost grows with usage and becomes significant at scale. Migrating away is painful once your workflows are deeply integrated. If Knock has an outage, your notifications are down with no fallback. The free tier is generous for development but small for production (10K/month).
- **Complexity:** Simple (from your perspective -- the complexity is in Knock's infrastructure)

### Approach 1b: Novu (Open Source, Self-Hosted or Cloud)

- **How it works:** Similar model to Knock but open-source (MIT license). You can use Novu Cloud (hosted) or self-host the entire stack. Novu provides a workflow engine, React notification center component (`<NotificationCenter />`), and multi-channel delivery. Trigger notifications via their SDK: `novu.trigger('comment-notification', { to: { subscriberId: userId }, payload: { ... } })`.
- **Gains:** Open-source means no vendor lock-in -- you can fork, self-host, and customize anything. More flexible pricing: free tier (10K/month), $30/month starter, $250/month team tier. Self-hosting option for data sovereignty. Active community (38K+ GitHub stars). React components for notification center.
- **Gives up:** Self-hosting means you own the infrastructure complexity (Docker, Redis, MongoDB, Workers). Less mature than Knock for enterprise features. Documentation and DX are good but a step behind Knock. Batching/digest capabilities are less polished. Self-hosted requires meaningful DevOps effort.
- **Shines when:** You want the benefits of a notification platform but need self-hosting capability, have budget constraints, or want escape hatches from vendor lock-in.
- **Risks:** Self-hosting a complex multi-service system (API server, workers, web socket server, MongoDB, Redis) is significant operational overhead for a small team. Cloud version may have reliability concerns compared to Knock. Rapid development pace means API surface can change.
- **Complexity:** Moderate (Cloud) / Complex (Self-Hosted)

---

## Paradigm 2: Managed Real-Time Transport + Custom Notification Logic (Build on Real-Time Primitives)

**Core bet:** The hard part of notifications is the real-time transport, not the business logic. Use a managed service for the transport layer (pub/sub, SSE, WebSockets) and build the notification logic yourself.

### Approach 2a: Upstash Realtime + Custom Notification Layer

- **How it works:** Use Upstash Realtime (built on Redis) as the real-time event delivery mechanism. When a social event occurs (comment, like, follow), your server action writes a notification record to your database AND publishes an event via `realtime.emit("notification.created", { ... })`. On the client, `useRealtime()` hook receives events instantly. You build the notification feed, unread counts, and read state yourself against your own database. Upstash handles the real-time delivery and connection management.
- **Gains:** Serverless-native -- works on Vercel out of the box. Tiny client bundle (1.9kB gzipped). Full type safety with Zod schemas. You own your notification data model and UI completely. History support (new clients can load past events). Simple API surface. Cost-effective: Upstash Redis free tier is generous (10K commands/day), paid starts at $10/month. No separate WebSocket server needed.
- **Gives up:** You build everything above the transport layer: notification data model, feed UI, unread count logic, read/mark-all-read mutations, batching/digest logic, preference management. No multi-channel support -- in-app only unless you build email/push yourself. No built-in workflow engine.
- **Shines when:** You want real-time delivery without managing WebSocket infrastructure, and you're comfortable building the notification UX yourself. The team has frontend strength and wants full control over the user experience.
- **Risks:** Upstash dependency for real-time delivery. Building batching, digests, and multi-channel delivery from scratch is significant work if you need it later. Connection management edge cases (reconnection, missed messages) are handled by Upstash, but you need to trust their implementation.
- **Complexity:** Moderate

### Approach 2b: Supabase Realtime (Database Change Streams)

- **How it works:** If you're using Supabase as your database, Supabase Realtime can broadcast database changes over WebSockets. Insert a row into a `notifications` table, and all subscribed clients with matching filters receive the change instantly. Client subscribes via `supabase.channel('notifications').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.${userId}' }, callback).subscribe()`.
- **Gains:** If you're already on Supabase, this is nearly free -- it's built into the platform. The notification source of truth IS the database row, eliminating dual-write problems. Row-Level Security (RLS) ensures users only see their own notifications. Built on WebSockets via Phoenix (Elixir), which is battle-tested for real-time. Generous free tier (500 concurrent connections, 2M realtime messages/month).
- **Gives up:** Tightly coupled to Supabase as your database. Postgres change streams have latency (typically 100-500ms, occasionally more). No workflow engine, batching, or digest support. Row-level subscriptions mean each client opens a subscription filtered to their user ID. Scaling to many concurrent users means many Realtime connections. No multi-channel delivery.
- **Shines when:** Supabase is already your database. You want the simplest possible architecture where "insert a row = deliver a notification." The scale is moderate (hundreds to low thousands of concurrent users).
- **Risks:** Supabase Realtime has had reliability issues at scale (community reports of dropped connections, missed messages under heavy load). Postgres logical replication adds load to your database. If you ever leave Supabase, you lose the real-time layer entirely.
- **Complexity:** Simple (if already on Supabase) / Moderate (if adopting Supabase for this)

### Approach 2c: Pusher Channels / Ably

- **How it works:** Use a dedicated real-time messaging service (Pusher or Ably) for the transport. Your server publishes events to named channels (e.g., `private-user-${userId}`), and clients subscribe to their channel. You build notification storage, feed, and read state in your own database. Pusher/Ably handle connection management, reconnection, and message delivery.
- **Gains:** Mature, battle-tested real-time infrastructure (Pusher has been around since 2010). Excellent client libraries for all platforms. Private channels with authentication for security. Presence channels if you need online status. Works on any deployment platform (just HTTP API calls from server).
- **Gives up:** Monthly cost scales with concurrent connections (Pusher: $49/month for 500 connections, Ably: consumption-based). You build all notification logic yourself. Another vendor dependency. Pusher's pricing model is quota-based, which can be unpredictable. No notification-specific features (batching, digests, preferences).
- **Shines when:** You need proven real-time transport with broad platform support and your team is comfortable building notification logic. You might use the same service for other real-time features (live updates, presence).
- **Risks:** Cost at scale (100K+ connections gets expensive). Pusher's pricing has jumps that can surprise you. Feature-wise, you're paying for generic pub/sub when you only need server-to-client notifications.
- **Complexity:** Moderate

---

## Paradigm 3: Self-Built with Native Web Technologies (Own Everything)

**Core bet:** Modern web standards (SSE, streaming) and Next.js capabilities are sufficient for notification delivery. No external service dependency is worth the coupling and cost. Keep the architecture simple and fully under your control.

### Approach 3a: Server-Sent Events via Next.js Route Handler

- **How it works:** Create a Route Handler (`/api/notifications/stream`) that returns a `ReadableStream` with SSE formatting. Client connects with `EventSource` API. When a notification is created (via server action or API), you either: (a) poll a database/Redis for new notifications and push them through the stream, or (b) use an in-process pub/sub mechanism. Notifications are stored in your database. The SSE endpoint streams new ones to connected clients.
- **Gains:** Zero external dependencies for real-time delivery. SSE is a web standard with built-in reconnection and event IDs. Works within Next.js Route Handlers. No WebSocket server needed. HTTP-compatible (works through proxies, CDNs, firewalls). Unidirectional (server-to-client) which is exactly what notifications need -- no wasted bidirectional capacity.
- **Gives up:** **Critical limitation on Vercel**: Edge Functions have a 300-second execution limit. SSE connections will be dropped after 5 minutes, requiring client-side reconnection logic. Serverless functions are stateless -- you can't maintain an in-process subscriber list across invocations. This means you need Redis or similar for cross-instance pub/sub coordination. Scaling to many concurrent users means many open HTTP connections (each consumes a serverless function slot). No built-in batching, digest, or multi-channel support.
- **Shines when:** You're deploying on a long-running Node.js server (not serverless). You want zero vendor dependencies. The user base is small enough that connection count isn't a concern.
- **Risks:** **Vercel deployment is problematic.** Each SSE connection ties up a serverless function for its duration. On Hobby plan (10s timeout), SSE is essentially unusable. On Pro (60s) it's awkward. Even on Enterprise (300s), connections reset every 5 minutes. You need a coordination layer (Redis) to fan out events to the right SSE streams, which partially defeats the "no dependencies" advantage. Debugging SSE connection lifecycle issues is notoriously fiddly.
- **Complexity:** Moderate (self-hosted) / Complex (on Vercel, due to serverless constraints)

### Approach 3b: WebSocket Server (Separate Process)

- **How it works:** Run a dedicated WebSocket server (Node.js with `ws` library or Socket.io) alongside your Next.js app. When notifications are created, your Next.js server actions publish events to Redis pub/sub, and the WebSocket server subscribes and pushes to connected clients. Client maintains a persistent WebSocket connection to the WS server.
- **Gains:** Full bidirectional communication. Persistent connections with no timeout. Complete control over the transport layer. Can handle high throughput. Battle-tested libraries (Socket.io has 60K+ GitHub stars). Room/namespace support for organizing connections.
- **Gives up:** **Cannot run on Vercel.** Requires a separate server process (e.g., on Railway, Fly.io, Render, or a VPS). Two deployment targets to manage. Redis needed for coordination between Next.js and WS server. CORS and authentication complexity (two origins). Overkill for unidirectional notifications -- WebSockets are designed for bidirectional communication.
- **Shines when:** You're already self-hosting, need bidirectional communication for other features (chat, collaborative editing), or the user base is large enough to justify dedicated infrastructure.
- **Risks:** Operational complexity of running and scaling a separate WebSocket server. Memory management for long-lived connections. Need to handle graceful shutdown, connection draining, and horizontal scaling. Authentication token sharing between Next.js app and WS server.
- **Complexity:** Complex

---

## Paradigm 4: Reactive Database (Real-Time as a Data Layer Feature)

**Core bet:** If the database itself is reactive, the notification system becomes trivially simple. The database change IS the notification. No separate transport layer needed.

### Approach 4a: Convex (Reactive Backend Platform)

- **How it works:** Convex is a reactive database where queries automatically re-execute when their underlying data changes. You define a `notifications` table and a query function like `getUnreadNotifications(userId)`. Any component using `useQuery(api.notifications.getUnreadNotifications)` automatically updates when a new notification row is inserted. There's no pub/sub, no SSE, no WebSocket setup -- reactivity is built into the data layer. Mutations (like creating a comment) can insert notification records as a side effect, and all subscribed UIs update instantly.
- **Gains:** Dramatically simpler architecture. No transport layer to configure. Real-time is a property of the database, not a separate system. Full TypeScript, end-to-end type safety. Built-in authentication and authorization. Serverless-native, works on Vercel. Automatic connection management and reconnection. Transactional consistency -- the notification insert and the comment insert can be in the same transaction.
- **Gives up:** All-in on Convex as your backend. This is not "add Convex for notifications" -- it's "use Convex for your entire data layer." If you already have a PostgreSQL database, you'd need to migrate or dual-write. No multi-channel delivery (in-app only). No batching/digest primitives. Convex is a relatively young platform (founded 2021). Vendor lock-in is significant.
- **Shines when:** You're greenfield and choosing your entire backend stack. You value simplicity and type safety over ecosystem maturity. You're building a real-time-first application where notifications are just one of many reactive features.
- **Risks:** Convex is younger and less battle-tested than PostgreSQL/Supabase. Migrating away from Convex would be a major effort (it's your entire data layer). Pricing at scale is less predictable. Limited ecosystem of tools and extensions compared to PostgreSQL.
- **Complexity:** Simple (within the Convex ecosystem) / Complex (if migrating to Convex)

---

## Paradigm 5: Pull-Based with Optimistic Updates (Avoid Real-Time Entirely)

**Core bet:** "Real-time" is a spectrum, not a binary. For social notifications (not trading alerts), 5-15 second latency is fine. Polling with smart caching and optimistic UI gives 90% of the UX benefit at 10% of the infrastructure complexity.

### Approach 5a: SWR/React Query Polling with Short Intervals

- **How it works:** Use SWR or TanStack Query to poll a `/api/notifications/unread-count` endpoint every 5-15 seconds. When the count changes, fetch the full notification list. Use `refetchInterval` in TanStack Query or `refreshInterval` in SWR. Combine with optimistic updates: when a user takes an action that would generate a notification for someone else, don't wait for the poll -- but for the recipient, 5-15 seconds is acceptable latency.
- **Gains:** Absurdly simple to implement. No WebSocket, SSE, Redis, or external service needed. Works perfectly on Vercel serverless. Scales well with caching (a lightweight count endpoint can be cached aggressively). SWR/TanStack Query handle background refetching, stale-while-revalidate, and focus-based refetching automatically. Easy to reason about -- it's just HTTP requests. Total implementation is probably 50-100 lines of code.
- **Gives up:** Not truly "real-time" -- notifications arrive with 5-15 second latency. Polling generates constant server load proportional to connected users (though lightweight count endpoints mitigate this). No push capability -- user must have the app open. No streaming updates for the notification feed itself.
- **Shines when:** The team is small, the app is young, and "good enough" notification latency (5-15 seconds) is acceptable. The priority is shipping quickly with minimal infrastructure.
- **Risks:** If the app grows, polling N users every 5 seconds generates N/5 requests per second. At 10K concurrent users, that's 2K requests/second to the count endpoint. This is manageable with caching but starts to matter. Users accustomed to instant notifications (Slack, Discord) may find the delay noticeable. Difficult to add batching/digest later without architectural changes.
- **Complexity:** Simple

---

## Non-Obvious Options

### Hybrid: Polling + SSE Upgrade Path

Start with Approach 5a (polling) for the MVP. Structure the notification data model and API to be transport-agnostic (the endpoint returns notifications regardless of how the client learned about them). When latency matters, upgrade the transport to SSE or a managed service without changing the data layer or UI components. This is a "walk before you run" strategy that avoids premature optimization while keeping the door open.

### Notification-as-Email-First

Reframe the problem: instead of building an in-app notification system, send an email for each event (using Resend, Postmark, or similar). Add a `/notifications` page that queries the same events table. No real-time transport needed -- email IS the notification channel, and the in-app page is just a history view. This works surprisingly well for low-traffic apps where users aren't constantly in the app.

### Edge Function + KV Store Pattern

Use Vercel KV (Redis) to store per-user notification queues. An edge function on each page load checks the KV store for pending notifications and includes them in the server-rendered response. Combine with a lightweight polling endpoint for updates while the page is open. This leverages edge infrastructure for low-latency notification delivery without persistent connections.

### Browser Push Notifications (Web Push API)

Use the Web Push API with a service worker to deliver notifications even when the app tab isn't focused. This is orthogonal to in-app notifications -- it handles the "user isn't looking at the app" case. Can be combined with any of the above approaches. Firebase Cloud Messaging (FCM) provides a free, managed implementation. The main limitation is that users must grant permission, and browser support varies.

---

## Eliminated Early

- **GraphQL Subscriptions**: Adds GraphQL as a dependency for a single feature. If the app isn't already using GraphQL, the overhead (schema definition, subscription server, client setup) far exceeds the benefit for notifications alone. Eliminated because the integration cost is disproportionate to the feature scope.

- **Apache Kafka / RabbitMQ**: Enterprise message brokers designed for service-to-service communication at massive scale. Overkill for a greenfield app with hundreds to thousands of users. The operational complexity (cluster management, topic configuration, consumer groups) is inappropriate for a small team. Eliminated on complexity budget grounds.

- **WebRTC Data Channels**: Designed for peer-to-peer communication, not server-to-client notifications. Wrong tool for the job. Eliminated because notifications are inherently server-originated.

- **WebTransport**: Promising new protocol (HTTP/3-based) for bidirectional streaming, but browser support is incomplete and Next.js/Vercel support is non-existent as of early 2026. Eliminated on maturity grounds.

- **Socket.io on Vercel**: Socket.io requires a persistent server process. Vercel's serverless model doesn't support this. Eliminated on deployment constraint grounds.
