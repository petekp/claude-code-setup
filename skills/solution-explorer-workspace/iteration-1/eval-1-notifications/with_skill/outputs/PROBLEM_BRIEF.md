# Problem Brief: Real-Time Notifications

## Problem Statement

The application needs a way to keep users informed about social interactions happening asynchronously -- when someone else comments on their post, likes their content, or follows them. The underlying need is **awareness without active checking**: users should passively learn about relevant activity so they can decide whether to engage, without having to repeatedly visit and scan the app for changes.

This is fundamentally a fan-out delivery problem: a single action by one user (e.g., leaving a comment) must produce a notification for a different user, potentially across multiple delivery channels, with low latency and high reliability.

## Dimensions

### Performance characteristics
- **Latency**: Notifications should appear within 1-5 seconds of the triggering action. Users tolerate slight delay for social notifications (this is not a chat application), but multi-minute delays feel broken.
- **Throughput**: Depends heavily on user base. A social app with 10K DAU might generate 50K-200K notification events per day. At 1M DAU, this becomes 5M-20M events/day.
- **Memory footprint**: In-app notification feeds need bounded storage. Old notifications should be purgeable.

### Complexity budget
This is a foundational feature, not a differentiator. It should work reliably and be reasonably maintainable, but it shouldn't consume weeks of engineering effort. Medium complexity budget -- worth doing right, not worth over-engineering.

### Integration surface
- Next.js app (App Router assumed, given greenfield)
- Some database (to be determined -- likely PostgreSQL or a managed service)
- Authentication system (users have identities)
- Existing content models: posts, comments, likes, follows
- Potential future channels: email digest, push notifications, mobile

### User experience requirements
- In-app notification indicator (badge/count of unread)
- Notification feed/dropdown showing recent notifications
- Read/unread state tracking
- Real-time updates without page refresh
- Graceful degradation if real-time connection drops (fall back to showing on next page load)

### Maintenance trajectory
- Notification types will grow over time (mentions, shares, etc.)
- Preference management will be needed eventually (mute certain types)
- This will be maintained by a small team; simplicity matters

### Scale expectations
- Starting small (hundreds to low thousands of users)
- Realistic growth: up to 50K-100K users over the next 1-2 years
- Not building for millions-of-users scale on day one, but the architecture shouldn't paint us into a corner

## Success Criteria

### Must
1. **Real-time delivery**: Notifications appear in-app within 5 seconds of the triggering action, without requiring page refresh
2. **Three notification types**: Comment on post, like on content, new follower -- all functional at launch
3. **Unread tracking**: Users can see how many unread notifications they have, and mark them as read
4. **Reliable delivery**: No silent notification loss -- if a notification is created, it must eventually be visible to the recipient
5. **Next.js compatible**: Works with Next.js App Router, server components, and standard deployment targets (Vercel, self-hosted Node)

### Should
1. **Extensible notification types**: Adding a new notification type (e.g., "mentioned you") should require minimal boilerplate
2. **Notification persistence**: Notifications stored for at least 30 days, queryable and paginated
3. **Preference foundation**: Architecture supports per-user, per-type notification preferences in the future
4. **Graceful degradation**: If the real-time transport fails, notifications still appear on next page load or poll
5. **Reasonable cost**: Infrastructure costs scale linearly (or better) with user count, no $500/month baseline for a small app

### Nice
1. **Multi-channel ready**: Architecture can extend to email/push without a rewrite
2. **Batching/digest support**: Foundation for "you have 5 new likes" style grouping
3. **Real-time badge without full feed load**: Show unread count without fetching all notifications
4. **Optimistic UI**: Notification count updates instantly when user marks as read

## Assumptions

1. **Next.js App Router is the framework** -- Status: assumed (greenfield, modern Next.js project)
2. **PostgreSQL (or Postgres-compatible) is available as the primary database** -- Status: assumed (most common choice for this type of app, but the solution should work with alternatives)
3. **Users are authenticated and have stable user IDs** -- Status: assumed (notifications are meaningless without identity)
4. **The app is deployed to a platform that supports long-lived connections (WebSocket or SSE)** -- Status: assumed (Vercel supports SSE and Edge functions; self-hosted Node supports WebSocket. Serverless-only environments may constrain options.)
5. **Initial scale is small (< 10K users)** -- Status: assumed (greenfield app, not launching to millions)
6. **In-app notifications are the primary channel; email/push are future additions** -- Status: assumed (the request focused on in-app "get notified")

## Constraints

- **Greenfield**: No existing notification infrastructure to integrate with or migrate from
- **Next.js ecosystem**: Solution must work within Next.js paradigms (API routes, server actions, server components)
- **Small team**: Solution should be maintainable by 1-2 engineers, not require dedicated infrastructure expertise
- **Deployment flexibility**: Should work on Vercel (serverless/edge) AND self-hosted Node.js -- or at minimum, one of these with a clear path to the other
- **Budget conscious**: A startup/indie app; solutions requiring $100+/month at low scale are less attractive than those that start cheap and scale with usage
