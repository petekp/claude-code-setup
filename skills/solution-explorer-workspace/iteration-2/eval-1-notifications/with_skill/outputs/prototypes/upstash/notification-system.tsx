// ============================================================
// UPSTASH REALTIME PROTOTYPE: Complete notification system
// Lines of app code needed: ~280
// External dependencies: @upstash/realtime, @upstash/redis
// What Upstash provides: real-time event delivery, connection
//   management, reconnection, type-safe events
// What you build: notification data model, feed UI, unread
//   counts, read/mark-as-read, batching (if needed)
// ============================================================

// --- 1. Shared: Notification types and Realtime schema ---
// File: lib/notifications/types.ts

import { z } from "zod";

const NotificationTypes = ["comment", "like", "follow"] as const;
type NotificationType = (typeof NotificationTypes)[number];

type Notification = {
  id: string;
  type: NotificationType;
  recipientId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  targetId: string | null;
  targetTitle: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

// Upstash Realtime event schema
const realtimeSchema = {
  notification: {
    created: z.object({
      id: z.string(),
      type: z.enum(NotificationTypes),
      actorName: z.string(),
      actorAvatar: z.string(),
      targetId: z.string().nullable(),
      targetTitle: z.string().nullable(),
      message: z.string(),
      createdAt: z.string(),
    }),
  },
};

// --- 2. Server: Database schema (Drizzle example) ---
// File: lib/notifications/schema.ts

// import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
//
// const notifications = pgTable("notifications", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   type: text("type").notNull(), // "comment" | "like" | "follow"
//   recipientId: text("recipient_id").notNull(),
//   actorId: text("actor_id").notNull(),
//   actorName: text("actor_name").notNull(),
//   actorAvatar: text("actor_avatar").notNull(),
//   targetId: text("target_id"),
//   targetTitle: text("target_title"),
//   message: text("message").notNull(),
//   read: boolean("read").notNull().default(false),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });

// --- 3. Server: Upstash Realtime setup ---
// File: lib/notifications/realtime.ts

import { Realtime } from "@upstash/realtime";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,  // safe: server-only
  token: process.env.UPSTASH_REDIS_TOKEN!, // safe: server-only
});

const realtime = new Realtime({
  redis,
  schema: realtimeSchema,
});

// Route handler for SSE connection
// File: app/api/notifications/realtime/route.ts
// export const GET = handle({ realtime });

// --- 4. Server: Trigger notifications (server action) ---
// File: app/actions/notifications.ts
// "use server";

function buildMessage(
  type: NotificationType,
  actorName: string,
  targetTitle: string | null
): string {
  switch (type) {
    case "comment":
      return `${actorName} commented on "${targetTitle}"`;
    case "like":
      return `${actorName} liked "${targetTitle}"`;
    case "follow":
      return `${actorName} started following you`;
  }
}

async function triggerNotification(data: {
  type: NotificationType;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  recipientId: string;
  targetId: string | null;
  targetTitle: string | null;
}) {
  const message = buildMessage(data.type, data.actorName, data.targetTitle);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // 1. Persist to database
  // await db.insert(notifications).values({
  //   id,
  //   type: data.type,
  //   recipientId: data.recipientId,
  //   actorId: data.actorId,
  //   actorName: data.actorName,
  //   actorAvatar: data.actorAvatar,
  //   targetId: data.targetId,
  //   targetTitle: data.targetTitle,
  //   message,
  //   read: false,
  //   createdAt,
  // });

  // 2. Push real-time event (Upstash delivers to connected clients)
  await realtime.emit("notification.created", {
    id,
    type: data.type,
    actorName: data.actorName,
    actorAvatar: data.actorAvatar,
    targetId: data.targetId,
    targetTitle: data.targetTitle,
    message,
    createdAt,
  });
}

// --- 5. Server: API endpoints for notification feed ---
// File: app/api/notifications/route.ts

// GET /api/notifications?cursor=...
// Returns paginated notifications for the current user
// async function GET(request: Request) {
//   const userId = await getCurrentUserId();
//   const url = new URL(request.url);
//   const cursor = url.searchParams.get("cursor");
//
//   const items = await db.select()
//     .from(notifications)
//     .where(eq(notifications.recipientId, userId))
//     .orderBy(desc(notifications.createdAt))
//     .limit(20)
//     .offset(cursor ? parseInt(cursor) : 0);
//
//   return Response.json({ items, nextCursor: ... });
// }

// --- 6. Server: Unread count endpoint ---
// File: app/api/notifications/unread-count/route.ts

// GET /api/notifications/unread-count
// async function GET() {
//   const userId = await getCurrentUserId();
//   const count = await db.select({ count: sql`count(*)` })
//     .from(notifications)
//     .where(and(
//       eq(notifications.recipientId, userId),
//       eq(notifications.read, false)
//     ));
//   return Response.json({ count: count[0].count });
// }

// --- 7. Server: Mark as read ---
// File: app/actions/mark-read.ts
// "use server";

async function markAsRead(notificationId: string) {
  // const userId = await getCurrentUserId();
  // await db.update(notifications)
  //   .set({ read: true })
  //   .where(and(
  //     eq(notifications.id, notificationId),
  //     eq(notifications.recipientId, userId)
  //   ));
}

async function markAllAsRead() {
  // const userId = await getCurrentUserId();
  // await db.update(notifications)
  //   .set({ read: true })
  //   .where(and(
  //     eq(notifications.recipientId, userId),
  //     eq(notifications.read, false)
  //   ));
}

// --- 8. Client: Notification bell with real-time updates ---
// File: components/notification-bell.tsx
"use client";

import { useRealtime } from "@upstash/realtime/react";
import { useState, useEffect, useCallback } from "react";

type RealtimeEvents = {
  "notification.created": {
    id: string;
    type: NotificationType;
    actorName: string;
    actorAvatar: string;
    targetId: string | null;
    targetTitle: string | null;
    message: string;
    createdAt: string;
  };
};

function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    async function load() {
      const [countRes, feedRes] = await Promise.all([
        fetch("/api/notifications/unread-count"),
        fetch("/api/notifications"),
      ]);
      const { count } = await countRes.json();
      const { items } = await feedRes.json();
      setUnreadCount(count);
      setNotifications(items);
      setIsLoading(false);
    }
    load();
  }, []);

  // Subscribe to real-time events
  useRealtime<RealtimeEvents>({
    event: "notification.created",
    onData(data) {
      // Prepend new notification to the list
      setNotifications((prev) => [
        {
          ...data,
          recipientId: "", // we know it's for us
          read: false,
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    },
  });

  const handleMarkAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Server mutation
    // await markAsRead(id);
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    // await markAllAsRead();
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
}

// --- 9. Client: Notification feed UI (you build this) ---
// File: components/notification-feed.tsx

function NotificationFeed() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg border">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <ul>
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
              !notification.read ? "bg-blue-50" : ""
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(notification.createdAt).toRelativeTimeString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Summary ---
// Total app code: ~280 lines (this file, minus comments)
// You own: data model, feed UI, unread counts, read state
// Upstash owns: real-time delivery, connection management
// Missing vs Knock: batching/digest, preferences UI,
//   multi-channel, pre-built feed component
