# Analysis: Real-Time Notifications

## Tradeoff Matrix

All approaches evaluated against the success criteria from the Problem Brief.

| Criterion | 1a: Knock | 1b: Novu | 2a: Upstash Realtime | 2b: Supabase Realtime | 2c: Pusher/Ably | 3a: SSE Route Handler | 3b: WebSocket Server | 4a: Convex | 5a: Polling |
|---|---|---|---|---|---|---|---|---|---|
| **MUST: Real-time (1-3s)** | YES (~500ms) | YES (~500ms) | YES (~200ms) | YES (~200-500ms) | YES (~100ms) | YES (~200ms) | YES (~100ms) | YES (~200ms) | NO (5-15s) |
| **MUST: Persistence** | YES (Knock stores) | YES (Novu stores) | YOU BUILD (your DB) | YES (Postgres row) | YOU BUILD (your DB) | YOU BUILD (your DB) | YOU BUILD (your DB) | YES (Convex DB) | YOU BUILD (your DB) |
| **MUST: Correct targeting** | YES (recipient API) | YES (subscriber API) | YOU BUILD (channel per user) | YES (RLS filter) | YOU BUILD (private channel) | YOU BUILD (user filter) | YOU BUILD (room per user) | YOU BUILD (query filter) | YOU BUILD (auth filter) |
| **MUST: Read/unread state** | YES (built-in) | YES (built-in) | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD |
| **MUST: Next.js App Router** | YES (API calls) | YES (API calls) | YES (native support) | YES (client SDK) | YES (API calls) | YES (Route Handler) | PARTIAL (separate server) | YES (native support) | YES (fetch) |
| **MUST: Vercel deployable** | YES | YES | YES | YES | YES | PARTIAL (timeout limits) | NO | YES | YES |
| **MUST: 3 notification types** | YES (workflow per type) | YES (trigger per type) | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD |
| **SHOULD: Notification feed** | YES (React component) | YES (React component) | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD |
| **SHOULD: 10K+ concurrent** | YES (managed infra) | MAYBE (depends on hosting) | YES (Redis-backed) | MAYBE (500 free, paid scales) | YES (paid tier) | NO (serverless connection limits) | YES (dedicated server) | YES (managed infra) | YES (cacheable endpoint) |
| **SHOULD: Extensible types** | YES (add workflow) | YES (add trigger) | YES (add event type) | YES (add row type) | YES (add channel event) | YES (add event type) | YES (add message type) | YES (add mutation) | YES (add query filter) |
| **SHOULD: Batching/dedup** | YES (built-in digest) | YES (built-in digest) | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD |
| **SHOULD: Low ops overhead** | YES (fully managed) | MODERATE (Cloud) | YES (managed Redis) | YES (if on Supabase) | YES (managed) | MODERATE (connection mgmt) | NO (separate server) | YES (managed) | YES (just HTTP) |
| **SHOULD: Type-safe** | YES (TS SDK) | YES (TS SDK) | YES (Zod schemas) | MODERATE (some TS) | MODERATE (some TS) | YOU BUILD | YOU BUILD | YES (end-to-end) | YES (TS fetch) |
| **NICE: Preferences** | YES (built-in) | YES (built-in) | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD |
| **NICE: Email/push** | YES (multi-channel) | YES (multi-channel) | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD | YOU BUILD |
| **Cost at launch** | $0 (free tier) | $0 (free tier) | $0 (free tier) | $0 (free tier) | $0 (free tier) | $0 | $5-10/mo (server) | $0 (free tier) | $0 |
| **Cost at 10K users** | ~$250/mo | ~$30-250/mo | ~$10-50/mo | ~$25-75/mo | ~$49-199/mo | Server costs | ~$20-50/mo + server | ~$25-100/mo | ~$0-20/mo |

## Eliminated

- **3a: SSE Route Handler (on Vercel)**: Eliminated because it PARTIALLY FAILS the "Vercel deployable" MUST criterion. Vercel's serverless function timeout (10s Hobby, 60s Pro) makes SSE connections impractical -- they'd reset constantly. Each open SSE connection consumes a serverless function slot, creating cost and concurrency problems. While technically possible with Edge Functions (300s limit), the 5-minute connection reset is awkward for a notification stream. If the deployment target were a long-running Node.js server, this approach would be viable, but the assumed Vercel deployment makes it a poor fit.

- **3b: WebSocket Server**: Eliminated because it FAILS the "Vercel deployable" MUST criterion outright. WebSocket servers require a persistent process, which is incompatible with Vercel's serverless model. This would require a separate server on Railway/Fly.io/Render, creating a split deployment architecture with CORS, auth sharing, and operational complexity disproportionate to the feature.

- **5a: Polling**: Eliminated because it FAILS the "Real-time (1-3s)" MUST criterion. With 5-15 second polling intervals, notifications arrive outside the 1-3 second requirement. While polling could be made faster (1-second intervals), this generates excessive server load and still doesn't guarantee sub-3-second delivery under load.

- **2b: Supabase Realtime**: Not eliminated on MUST criteria, but carries a significant conditional risk. This approach only makes sense if Supabase IS the database. Adopting Supabase specifically for notifications would mean either migrating the entire data layer or running a dual-database architecture, both of which violate the complexity budget. **Conditionally eliminated for a greenfield app that hasn't yet committed to Supabase.** If the app IS on Supabase, this would be a top-2 finalist.

## Finalists

1. **Knock (Approach 1a)** -- from Paradigm 1 (Managed Notification Infrastructure). Selected because it passes every MUST and SHOULD criterion out of the box, with minimal implementation effort. The most "batteries-included" option. Represents the bet that notification infrastructure should be outsourced entirely.

2. **Upstash Realtime (Approach 2a)** -- from Paradigm 2 (Managed Transport + Custom Logic). Selected because it offers real-time delivery with minimal infrastructure (serverless-native, works on Vercel) while keeping full control over the notification data model and UI. Represents the bet that you should own your notification logic but outsource the hard part (real-time transport).

3. **Convex (Approach 4a)** -- from Paradigm 4 (Reactive Database). Selected because it offers the most architecturally elegant solution -- real-time notifications as a natural consequence of database reactivity, with zero transport configuration. Represents the bet that the entire backend should be reactive, making notifications trivial. However, this is also the highest-commitment choice (requires adopting Convex as the full backend).

## Key Differentiator

**How much notification-specific logic do you want to build yourself, versus how much backend commitment are you willing to make?**

This is a spectrum:
- Knock: build almost nothing, commit to a notification vendor
- Upstash Realtime: build the notification layer, commit to a transport vendor
- Convex: build the notification layer, commit to an entire backend platform

The prototyping phase should answer: **Is the developer experience gap between "Knock hands you everything" vs. "you build on Upstash/Convex" large enough to justify Knock's higher cost and vendor coupling?** Specifically: how many lines of code, how much time, and how many edge cases does it take to build notification feed + unread counts + read state on top of Upstash Realtime vs. getting it for free from Knock?

## Open Risks

1. **Knock pricing trajectory**: At $250/month for the first paid tier, Knock is expensive for a young app. If the app doesn't monetize quickly, this becomes a significant fixed cost. There's no $50-100/month tier.

2. **Upstash Realtime maturity**: Upstash Realtime is relatively new (the Next.js 16 blog post suggests active development). Edge cases around connection reliability, message ordering, and at-scale behavior are less battle-tested than Knock or Pusher.

3. **Convex platform bet**: Choosing Convex for notifications means choosing Convex for everything. If Convex doesn't work out for other parts of the app, you're stuck or facing a migration.

4. **"YOU BUILD" accumulation**: For Upstash and Convex, the number of "YOU BUILD" items in the matrix (read state, batching, feed UI, preferences) adds up. Each is individually simple but collectively represents significant development time.
