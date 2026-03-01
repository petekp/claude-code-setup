# Real-Time Notifications in Next.js: Design Recommendation

## Overview

You need three things working together: (1) a way to create and store notifications when events happen, (2) a way to push those notifications to users in real time, and (3) a UI layer to display them. Here's my recommended approach for each layer, with reasoning.

---

## Architecture Decision: Server-Sent Events (SSE) over WebSockets

For a Next.js app, I'd recommend **Server-Sent Events (SSE)** as the real-time transport rather than WebSockets. Here's why:

| Factor | SSE | WebSockets |
|--------|-----|------------|
| Direction | Server-to-client (perfect for notifications) | Bidirectional (overkill here) |
| Next.js compatibility | Works with Route Handlers natively | Requires a separate server or custom setup |
| Vercel/serverless deployment | Supported (with caveats on duration) | Not supported on serverless platforms |
| Complexity | Simple HTTP — auto-reconnects, works through proxies | Requires connection upgrade, heartbeats, reconnection logic |
| Scaling | Pair with Redis Pub/Sub for multi-instance | Same scaling challenges, more complexity |

Notifications are inherently unidirectional — the server tells the client something happened. SSE is purpose-built for this. You don't need WebSockets unless you're also building real-time chat or collaborative editing.

**Caveat:** If you're deploying to Vercel's serverless functions, SSE connections will be limited by function duration (typically 25 seconds on Hobby, longer on Pro). For production scale, you'd want either a long-running server (e.g., a separate Node service or Vercel's Edge Runtime with streaming) or a third-party service. I'll address this below.

---

## System Design

### Data Model

```sql
-- notifications table
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
recipient_id  UUID NOT NULL REFERENCES users(id)
actor_id      UUID NOT NULL REFERENCES users(id)
type          TEXT NOT NULL CHECK (type IN ('comment', 'like', 'follow'))
entity_id     UUID          -- the post/comment that was acted on (nullable for follows)
entity_type   TEXT          -- 'post', 'comment', etc.
message       TEXT NOT NULL  -- precomputed display text
read          BOOLEAN DEFAULT false
created_at    TIMESTAMPTZ DEFAULT now()

-- index for fetching a user's notifications efficiently
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, read) WHERE read = false;
```

**Why precompute the message?** It's tempting to store only structured data and render the message client-side ("User X commented on Post Y"). But precomputing means you don't need to join against users/posts on every fetch, and you avoid broken messages if the referenced content gets deleted. Store the structured fields (actor_id, entity_id, type) too, so you can still build links and handle deduplication.

### Notification Creation (Server-Side)

Notifications get created as side effects of user actions. The key principle: **the notification write should happen in the same transaction as the action itself, or via a reliable async mechanism** — otherwise you risk lost notifications.

**Option A: Same-transaction write (simpler)**

```typescript
// app/actions/comments.ts
"use server"

async function createComment(postId: string, content: string) {
  const user = await getCurrentUser()

  // Single transaction: create comment + notification
  await db.transaction(async (tx) => {
    const comment = await tx.insert(comments).values({
      postId,
      authorId: user.id,
      content,
    }).returning()

    const post = await tx.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    // Don't notify yourself
    if (post.authorId !== user.id) {
      await tx.insert(notifications).values({
        recipientId: post.authorId,
        actorId: user.id,
        type: "comment",
        entityId: postId,
        entityType: "post",
        message: `${user.name} commented on your post`,
      })

      // Publish to real-time channel
      await publishNotification(post.authorId)
    }
  })
}
```

**Option B: Event-driven with a queue (more scalable)**

For a larger app, decouple notification creation from the action using a lightweight queue (Inngest, QStash, or even a simple database-backed job queue):

```typescript
// When a comment is created, emit an event
await inngest.send({
  name: "comment.created",
  data: { commentId, postId, authorId: user.id },
})

// A separate function handles notification creation
export const onCommentCreated = inngest.createFunction(
  { id: "notify-on-comment" },
  { event: "comment.created" },
  async ({ event }) => {
    // Create notification, send push, send email digest, etc.
  }
)
```

**My recommendation:** Start with Option A. It's simpler, easier to debug, and perfectly adequate until you have complex notification rules (batching, digest emails, multi-channel delivery). You can refactor to Option B later without changing the client.

### Real-Time Delivery

Here's how to wire up SSE in Next.js using a Route Handler:

```typescript
// app/api/notifications/stream/route.ts
import { getCurrentUser } from "@/lib/auth"

export const runtime = "nodejs" // Need long-lived connections

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send a heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"))
      }, 30_000)

      // Subscribe to this user's notification channel
      const unsubscribe = subscribeToUserChannel(user.id, (notification) => {
        const data = JSON.stringify(notification)
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      })

      // Cleanup when client disconnects
      const cleanup = () => {
        clearInterval(heartbeat)
        unsubscribe()
      }

      // AbortSignal isn't directly available here, so we rely on
      // the stream closing when the client disconnects
      controller.close = new Proxy(controller.close, {
        apply(target, thisArg, args) {
          cleanup()
          return Reflect.apply(target, thisArg, args)
        },
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
```

### The Pub/Sub Layer

For a single-server setup, you can use an in-memory event emitter. For multi-instance, use Redis Pub/Sub:

```typescript
// lib/notifications/pubsub.ts
import { Redis } from "ioredis"

const publisher = new Redis(process.env.REDIS_URL)
const subscriber = new Redis(process.env.REDIS_URL)

export async function publishNotification(userId: string) {
  await publisher.publish(`notifications:${userId}`, "new")
}

export function subscribeToUserChannel(
  userId: string,
  callback: (notification: unknown) => void
) {
  const channel = `notifications:${userId}`

  subscriber.subscribe(channel)

  const handler = (ch: string, message: string) => {
    if (ch === channel) {
      // Fetch the latest notification from DB rather than passing it
      // through Redis — keeps the pub/sub payload small and avoids
      // serialization issues
      callback({ type: "new_notification" })
    }
  }

  subscriber.on("message", handler)

  return () => {
    subscriber.unsubscribe(channel)
    subscriber.off("message", handler)
  }
}
```

**Design note:** The pub/sub channel just signals "hey, there's something new." The client then fetches the actual notification data. This is simpler and more reliable than serializing full notification objects through the pub/sub layer.

### Client-Side: Hook and UI

```typescript
// hooks/use-notifications.ts
"use client"

import { useEffect, useCallback, useRef, useState } from "react"

type Notification = {
  id: string
  type: "comment" | "like" | "follow"
  message: string
  read: boolean
  createdAt: string
  entityId: string | null
  entityType: string | null
  actorId: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications")
    if (res.ok) {
      const data = await res.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchNotifications()

    // Set up SSE connection
    const eventSource = new EventSource("/api/notifications/stream")
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      // When we get a ping, refetch notifications
      fetchNotifications()
    }

    eventSource.onerror = () => {
      // EventSource auto-reconnects, but you can add
      // exponential backoff logic here if needed
    }

    return () => {
      eventSource.close()
    }
  }, [fetchNotifications])

  const markAsRead = useCallback(async (notificationId: string) => {
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
    })
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
```

```tsx
// components/notification-bell.tsx
"use client"

import { useNotifications } from "@/hooks/use-notifications"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">
                No notifications yet
              </p>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

### REST Endpoints for CRUD

```typescript
// app/api/notifications/route.ts
export async function GET() {
  const user = await getCurrentUser()

  const results = await db.query.notifications.findMany({
    where: eq(notifications.recipientId, user.id),
    orderBy: desc(notifications.createdAt),
    limit: 50,
  })

  const unreadCount = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.recipientId, user.id),
        eq(notifications.read, false)
      )
    )

  return Response.json({
    notifications: results,
    unreadCount: unreadCount[0].count,
  })
}
```

---

## Scaling Considerations

### When to introduce a third-party service

If you're deploying to a serverless platform like Vercel, long-lived SSE connections are problematic. At that point, consider:

1. **Pusher / Ably / Soketi** -- Managed WebSocket/SSE services. Your server publishes events via their API, their infrastructure handles the connection to the client. This is the most pragmatic approach for serverless deployments.

2. **Supabase Realtime** -- If you're already using Supabase, it has built-in realtime subscriptions on database changes. You'd subscribe to inserts on the notifications table filtered by recipient_id.

3. **Dedicated WebSocket server** -- A separate long-running Node.js service (e.g., on Railway, Fly.io, or a VPS) that handles the real-time connections. Your Next.js app calls its API to publish events.

### Deduplication and batching

You'll want to handle cases like: "10 people liked your post" shouldn't create 10 separate notifications. Strategies:

- **Batch by time window:** Group notifications of the same type for the same entity within a window (e.g., 5 minutes). Use a background job that aggregates pending notifications.
- **Update in place:** When a "like" notification already exists for a post, update its message and bump the timestamp rather than creating a new row.

### Notification preferences

Eventually you'll want users to control their notifications. Add a `notification_preferences` table:

```sql
notification_preferences (
  user_id     UUID REFERENCES users(id),
  type        TEXT,   -- 'comment', 'like', 'follow'
  channel     TEXT,   -- 'in_app', 'email', 'push'
  enabled     BOOLEAN DEFAULT true,
  PRIMARY KEY (user_id, type, channel)
)
```

Check preferences before creating notifications. This is another reason the event-driven architecture (Option B above) pays off later -- the notification handler can check preferences in one place.

---

## Recommended Implementation Order

1. **Database schema and notification creation** -- Get the data model in place and create notifications inline with actions (Option A).
2. **REST API for fetching notifications** -- Build the bell icon + dropdown with polling (fetch every 30s) as a quick first pass.
3. **Replace polling with SSE** -- Add the streaming route handler and the EventSource hook.
4. **Mark as read / mark all as read** -- CRUD operations for read state.
5. **Notification preferences** -- Let users mute specific types.
6. **Evaluate third-party service** -- If deploying to serverless, swap the SSE transport for Pusher/Ably at this point. The rest of the architecture stays the same.
7. **Email digests and push notifications** -- Additional delivery channels, implemented via background jobs.

---

## Key Takeaways

- **Start with SSE, not WebSockets.** Notifications are server-to-client. Don't over-engineer the transport.
- **Pub/Sub signals, not payloads.** Use Redis Pub/Sub (or in-memory events) to signal that something new exists, then let the client fetch it. This avoids serialization bugs and keeps the pub/sub layer thin.
- **Create notifications transactionally with the action.** Don't lose notifications to failed async jobs. Move to an event-driven model only when you need batching, digests, or multi-channel delivery.
- **Design the data model for reads, not writes.** Index on (recipient_id, created_at DESC) because that's your hot query path.
- **Plan for serverless constraints.** If you're on Vercel, you'll likely need a managed real-time service for production. Design your architecture so swapping the transport layer doesn't require rewriting the notification logic.
