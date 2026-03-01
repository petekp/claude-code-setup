# Prototype Comparison: Real-Time Notifications

## Comparison Criteria (Defined Before Prototyping)

1. **Lines of application code**: How much code do you write and maintain? Measured by counting non-comment, non-blank lines in the prototype.
2. **Number of concepts introduced**: How many new abstractions, APIs, or mental models does the developer need to learn?
3. **Built-in features vs. DIY**: For each of the SHOULD criteria (feed UI, batching, preferences, extensibility), is it provided or must you build it?
4. **Deployment complexity**: What infrastructure beyond "deploy Next.js to Vercel" is needed?
5. **Vendor commitment level**: What are you locked into, and how painful is it to switch?
6. **Time to first notification**: Estimated wall-clock time from "start coding" to "see a notification appear in the browser."

## Results

### Prototype A: Knock (Managed Notification Infrastructure)
- **Location:** `prototypes/knock/`
- **Lines of code:** ~90 lines of application code
- **Concepts to learn:** 4 -- Knock workflows (configured in dashboard), KnockProvider/KnockFeedProvider (React context), trigger API (`knock.workflows.trigger`), pre-built components (NotificationIconButton, NotificationFeedPopover)
- **Built-in features:**
  - Feed UI: YES (pre-built React component with customizable CSS)
  - Batching/digest: YES (configured in Knock dashboard)
  - Preferences: YES (Knock handles preference management)
  - Multi-channel: YES (email, push, SMS, Slack, etc.)
  - Read/unread state: YES (tracked by Knock)
  - Unread count badge: YES (built into NotificationIconButton)
- **Deployment complexity:** None beyond standard Next.js. Knock is a SaaS -- just API calls.
- **Vendor commitment:** HIGH. Notification data lives in Knock. Workflows, templates, and batching rules are configured in their dashboard. Migrating away means rebuilding the entire notification system from scratch.
- **Time to first notification:** ~2-3 hours (account setup, dashboard configuration, SDK integration, workflow template creation)
- **Surprises:**
  - The dashboard configuration step is non-trivial. You need to create workflow templates, configure channels, set up batching rules -- this is meaningful work that doesn't show up in the code line count.
  - Knock's React components are opinionated about styling. Customizing the notification feed to match your design system requires learning their theming API or overriding CSS.
  - The gap between free tier (10K/month) and paid ($250/month) is significant. There's no path for a growing app between "free" and "serious commitment."

### Prototype B: Upstash Realtime (Managed Transport + Custom Logic)
- **Location:** `prototypes/upstash/`
- **Lines of code:** ~280 lines of application code
- **Concepts to learn:** 6 -- Upstash Realtime setup (Redis + Realtime instance), Zod event schemas, `realtime.emit()` for publishing, `useRealtime()` hook for subscribing, your own notification data model (DB schema + API routes), your own state management (optimistic updates, cache invalidation)
- **Built-in features:**
  - Feed UI: NO (you build it)
  - Batching/digest: NO (you build it -- significant effort)
  - Preferences: NO (you build it)
  - Multi-channel: NO (in-app only unless you integrate email/push separately)
  - Read/unread state: NO (you build it -- DB column + mutations + optimistic updates)
  - Unread count badge: NO (you build it -- query + real-time increment)
- **Deployment complexity:** Low. Upstash Redis is serverless and Vercel-native. One environment variable for Redis connection.
- **Vendor commitment:** LOW-MODERATE. Upstash handles only the real-time transport. Your notification data lives in your database. Switching transport providers means replacing ~30 lines of Upstash-specific code (emit + useRealtime), not the whole system.
- **Time to first notification:** ~4-6 hours (Upstash setup, DB schema, server action, API routes for feed + unread count, client hook, basic feed UI)
- **Surprises:**
  - The "YOU BUILD" items add up faster than expected. Read state alone requires: a database column, a server action to update it, an optimistic update on the client, and logic to decrement the unread count. This is ~40 lines of nuanced code with race condition potential.
  - Upstash Realtime's `history` feature is valuable -- new clients can catch up on missed events. But you need to reconcile this with your database state (what if a notification was marked as read before the client reconnected?).
  - Channel-per-user targeting isn't built into Upstash Realtime's basic model. The current API broadcasts to all connected clients. You'd need to filter on the client side (wasteful) or implement user-specific channels (more setup). This is a meaningful gap the documentation glosses over.

### Prototype C: Convex (Reactive Database)
- **Location:** `prototypes/convex/`
- **Lines of code:** ~220 lines of application code
- **Concepts to learn:** 5 -- Convex schema definition, query functions (reactive), mutation functions, `useQuery()` hook (reactive subscriptions), `useMutation()` hook. Notably, there are ZERO transport concepts to learn -- no pub/sub, no SSE, no channels.
- **Built-in features:**
  - Feed UI: NO (you build it)
  - Batching/digest: NO (you build it)
  - Preferences: NO (you build it)
  - Multi-channel: NO (in-app only)
  - Read/unread state: PARTIAL (the data model is yours, but mutations are straightforward and reactivity handles the UI update automatically)
  - Unread count badge: PARTIAL (you write the query, but it updates in real-time automatically)
- **Deployment complexity:** Moderate. Convex requires its own deployment (managed service). Next.js deploys to Vercel, Convex backend deploys to Convex cloud. Two deploy targets, but both are managed.
- **Vendor commitment:** VERY HIGH. Convex is your entire backend -- database, server functions, auth integration, real-time. This isn't "add Convex for notifications"; it's "build your app on Convex." Leaving Convex means rewriting your entire data layer.
- **Time to first notification:** ~3-5 hours (Convex project setup, schema, queries, mutations, client components). Faster than Upstash because there's no transport layer to configure.
- **Surprises:**
  - The elegance is real. The `useQuery` reactive subscription model means that inserting a notification row in a mutation automatically updates the unread count and feed in all connected clients. There's no "event publishing" step. The mental model is simpler than any other approach.
  - Transactional consistency is a genuine advantage. In Convex, the comment creation and notification creation can be in the same transaction. With Upstash, the DB write and the realtime.emit() are separate operations that can fail independently (dual-write problem).
  - The `markAllAsRead` mutation is awkward -- you have to fetch all unread notifications and patch them individually. Convex doesn't support bulk updates natively.
  - Choosing Convex for notifications means forgoing PostgreSQL, Drizzle, and the broader SQL ecosystem. This is a major architectural decision that extends far beyond notifications.

## Verdict

The key differentiating question was: **Is the DX gap between "Knock hands you everything" vs. "you build on Upstash/Convex" large enough to justify Knock's cost and vendor coupling?**

**Answer: It depends on your trajectory.**

The prototyping revealed three distinct "right answers" for three distinct situations:

1. **If you want to ship notifications in a day and plan to expand to email/push/batching**: Knock wins. The ~90 lines of code vs. ~280 (Upstash) or ~220 (Convex) understates the real gap -- the dashboard-configured features (batching, digests, multi-channel, preferences) would be hundreds of additional lines to build yourself. The $250/month cost is the price of not building notification infrastructure.

2. **If you're greenfield and would choose Convex anyway**: Convex wins. The architectural elegance is compelling -- zero transport configuration, transactional consistency, and the simplest mental model. But this is only the right choice if you're comfortable committing your entire backend to Convex.

3. **If you want to own your data and incrementally add sophistication**: Upstash Realtime wins. You own everything, the vendor lock-in is minimal (just the transport layer), and you can evolve the system over time. The higher line count is the price of ownership and flexibility.

## Updated Understanding

New insights from prototyping that weren't visible during analysis:

1. **The "YOU BUILD" gap is non-linear.** Building basic read/unread state is simple. Building batching ("Alice and 4 others") is hard. The features you need at launch (read state, feed, count) are manageable DIY; the features you'll want at scale (batching, digests, preferences) are where Knock's value becomes clear.

2. **Channel targeting is an underappreciated complexity.** Upstash Realtime broadcasts to all subscribers. Ensuring that user A's notifications don't leak to user B requires either client-side filtering (security risk and bandwidth waste) or per-user channels (infrastructure complexity). Knock and Convex handle this correctly by default.

3. **The dual-write problem is real.** With Upstash, you write to the database AND emit a real-time event. If one succeeds and the other fails, you have inconsistency. Knock avoids this (Knock IS the store). Convex avoids this (the database write IS the event). This is a subtle but important architectural consideration.

4. **Dashboard configuration is hidden complexity.** Knock's line count looks magical, but the workflow templates, channel configuration, and batching rules configured in Knock's dashboard represent real design work. It's not "zero effort" -- it's "effort in a different medium."
