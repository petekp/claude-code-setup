# Problem Brief: Real-Time Notifications

## Problem Statement

The application needs a system that informs users, in real time, when meaningful social interactions occur: someone commenting on their post, liking their content, or following them. The underlying need is **social feedback loops** -- users who don't learn about engagement on their content disengage from the platform. The system must deliver awareness of these events with low latency while the user is active, and not lose notifications when the user is offline.

This is more than just "show a toast." It encompasses: generating notification records from social events, persisting them, delivering them in real time to connected clients, surfacing unread counts, and rendering a notification feed with read/unread state. It also implies a future trajectory toward additional channels (email digests, push notifications) even if those aren't in the initial scope.

## Dimensions

**Performance characteristics**
- Latency: notifications should appear within 1-3 seconds of the triggering event for active users
- Throughput: depends on user base, but the architecture should not collapse under moderate growth (10K-100K active users)
- Memory footprint: persistent connections per active user consume server memory; this is a key scaling axis

**Complexity budget**
- This is a social app feature, not a trading platform. The complexity should be proportional -- we want something a small team can operate and debug. Overly sophisticated event-sourcing architectures would be overkill unless they come "for free" via a managed service.

**Integration surface**
- Next.js App Router (assumed latest stable version)
- Some database (assumed PostgreSQL or similar relational DB, or a managed backend like Supabase/Convex)
- Authentication system (assumed to exist -- we know which user is which)
- Deployment platform affects transport choices significantly (Vercel serverless vs. self-hosted Node.js)

**User experience requirements**
- Real-time badge/count update on a notification bell
- Notification feed (list of recent notifications with read/unread state)
- Toast or in-app alert for high-priority notifications while user is active
- Graceful degradation: if real-time delivery fails, notifications should still be visible on next page load

**Maintenance trajectory**
- Small team maintaining this. Should not require a dedicated infrastructure engineer.
- Likely to evolve: adding email/push channels, notification preferences, batching/digest features.

**Scale expectations**
- Current: greenfield, so effectively 0 users
- Near-term: hundreds to low thousands of concurrent users
- Realistic ceiling: tens of thousands of concurrent users before a fundamental rearchitecture would be warranted

## Success Criteria

### Must
1. **Real-time delivery to active users**: notifications appear within 1-3 seconds while user has the app open
2. **Persistence**: notifications are stored and retrievable even if user was offline when they occurred
3. **Correct targeting**: notifications go to the right user (the post author, not the commenter)
4. **Read/unread state**: users can mark notifications as read; unread count is accurate
5. **Works with Next.js App Router**: compatible with the application framework
6. **Deployable on Vercel or similar serverless platforms**: unless there's a compelling reason to self-host, the solution must work in a serverless deployment model
7. **Three notification types supported**: comment, like, follow

### Should
1. **Notification feed UI**: a paginated or infinite-scroll list of past notifications
2. **Scalable to 10K+ concurrent users** without architectural changes
3. **Extensible to new notification types** without major refactoring
4. **Batching/deduplication**: "Alice and 4 others liked your post" rather than 5 separate notifications
5. **Low operational overhead**: minimal infrastructure to manage
6. **Type-safe**: TypeScript throughout

### Nice
1. **Notification preferences**: users can control which notifications they receive
2. **Email/push channel support**: extend beyond in-app to other delivery channels
3. **Analytics**: track notification delivery rates, open rates
4. **Offline queueing**: notifications delivered when user reconnects, in order

## Assumptions

1. **Next.js App Router with React Server Components** -- the app uses the modern Next.js architecture, not Pages Router. Status: assumed (confirmed by problem statement saying "Next.js app")
2. **Vercel or serverless deployment** -- the app is deployed on a serverless platform, which constrains transport options (no long-running WebSocket server in the main app process). Status: assumed (unconfirmed, but this is the dominant Next.js deployment model and designing for it is the safer bet)
3. **PostgreSQL or managed database already exists** -- there's a data layer for posts, users, likes, comments, follows. Status: assumed (greenfield, but a database is implied by having "posts" and "users")
4. **Authentication exists** -- we can identify the current user on both server and client. Status: assumed (required for "someone comments on THEIR post")
5. **Small team** -- no dedicated DevOps or infrastructure team; operational simplicity matters. Status: assumed (typical for greenfield Next.js projects)
6. **English-language, single-region deployment** -- no i18n or multi-region latency concerns initially. Status: assumed
7. **Moderate scale** -- not building for millions of concurrent users. Status: assumed (greenfield app)

## Constraints

- **Serverless function timeout**: Vercel serverless functions have a max execution time (default 10s on Hobby, 60s on Pro, 300s on Enterprise). This limits long-lived connection strategies within the main app.
- **No persistent WebSocket server in Next.js on Vercel**: Next.js Route Handlers on Vercel are serverless and cannot maintain persistent WebSocket connections. Any WebSocket-based solution requires a separate server or managed service.
- **Budget sensitivity**: as a greenfield project, cost should scale with usage. Avoid high fixed costs before there's traction.
- **Next.js streaming support**: Route Handlers support streaming responses (ReadableStream), which enables SSE within the serverless constraint, though with platform-specific limitations.
