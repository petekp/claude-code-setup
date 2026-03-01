// ============================================================
// CONVEX PROTOTYPE: Complete notification system
// Lines of app code needed: ~220
// External dependencies: convex (full backend platform)
// What Convex provides: reactive database, real-time updates,
//   type-safe queries/mutations, auth, serverless functions
// What you build: notification schema, queries, mutations,
//   feed UI -- but NO transport layer
// ============================================================

// --- 1. Schema definition ---
// File: convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  notifications: defineTable({
    type: v.union(
      v.literal("comment"),
      v.literal("like"),
      v.literal("follow")
    ),
    recipientId: v.string(),
    actorId: v.string(),
    actorName: v.string(),
    actorAvatar: v.string(),
    targetId: v.optional(v.string()),
    targetTitle: v.optional(v.string()),
    message: v.string(),
    read: v.boolean(),
  })
    .index("by_recipient", ["recipientId", "read"])
    .index("by_recipient_time", ["recipientId"]),
  // ... other tables (posts, comments, users, etc.)
});

// --- 2. Query: Get notifications for current user ---
// File: convex/notifications.ts
// This query is REACTIVE -- it automatically re-runs when
// the underlying data changes. No pub/sub, no SSE, no WebSocket
// setup. The database reactivity IS the notification delivery.

import { query, mutation } from "./_generated/server";

const getNotifications = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    return ctx.db
      .query("notifications")
      .withIndex("by_recipient_time", (q) =>
        q.eq("recipientId", userId.subject)
      )
      .order("desc")
      .take(args.limit ?? 20);
  },
});

// --- 3. Query: Get unread count ---
// Also reactive -- badge updates instantly when a new
// notification is inserted anywhere in the system

const getUnreadCount = query({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", userId.subject).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});

// --- 4. Mutation: Create a notification ---
// File: convex/notifications.ts (continued)
// Called as a side effect of other mutations (comment, like, follow)

const createNotification = mutation({
  args: {
    type: v.union(
      v.literal("comment"),
      v.literal("like"),
      v.literal("follow")
    ),
    recipientId: v.string(),
    actorId: v.string(),
    actorName: v.string(),
    actorAvatar: v.string(),
    targetId: v.optional(v.string()),
    targetTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const message = buildMessage(args.type, args.actorName, args.targetTitle);

    // This single insert triggers real-time updates to all
    // clients that have active queries reading this user's
    // notifications. No additional pub/sub step needed.
    await ctx.db.insert("notifications", {
      ...args,
      message,
      read: false,
    });
  },
});

function buildMessage(
  type: "comment" | "like" | "follow",
  actorName: string,
  targetTitle?: string
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

// --- 5. Mutation: Mark as read ---

const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.recipientId !== userId.subject) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

const markAllAsRead = mutation({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientId", userId.subject).eq("read", false)
      )
      .collect();

    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { read: true }))
    );
  },
});

// --- 6. Usage in other mutations (e.g., creating a comment) ---
// File: convex/comments.ts

const createComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    // Create the comment
    // const commentId = await ctx.db.insert("comments", { ... });

    // Get the post to find the author
    // const post = await ctx.db.get(args.postId);

    // Create notification -- same transaction as the comment!
    // This is a key advantage: the notification insert and the
    // comment insert are transactionally consistent.
    // if (post && post.authorId !== userId.subject) {
    //   await ctx.db.insert("notifications", {
    //     type: "comment",
    //     recipientId: post.authorId,
    //     actorId: userId.subject,
    //     actorName: userId.name ?? "Someone",
    //     actorAvatar: userId.pictureUrl ?? "",
    //     targetId: args.postId,
    //     targetTitle: post.title,
    //     message: `${userId.name} commented on "${post.title}"`,
    //     read: false,
    //   });
    // }
  },
});

// --- 7. Client: Notification components ---
// File: components/notification-bell.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  // This is reactive. When a new notification is inserted into
  // the database, this count updates automatically. No polling,
  // no event subscription, no additional code.
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <BellIcon />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && <NotificationFeed onClose={() => setIsOpen(false)} />}
    </div>
  );
}

function BellIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

// --- 8. Client: Notification feed ---
// File: components/notification-feed.tsx

function NotificationFeed({ onClose }: { onClose: () => void }) {
  // Also reactive -- updates in real-time as notifications arrive
  const notifications = useQuery(api.notifications.getNotifications, {
    limit: 20,
  });
  const markRead = useMutation(api.notifications.markAsRead);
  const markAllRead = useMutation(api.notifications.markAllAsRead);

  if (notifications === undefined) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg border">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <button
          onClick={() => markAllRead()}
          className="text-sm text-blue-600 hover:underline"
        >
          Mark all read
        </button>
      </div>
      <ul>
        {notifications.map((notification) => (
          <li
            key={notification._id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
              !notification.read ? "bg-blue-50" : ""
            }`}
            onClick={() => markRead({ notificationId: notification._id })}
          >
            <p className="text-sm">{notification.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(notification._creationTime).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Summary ---
// Total app code: ~220 lines (this file, minus comments)
// Key advantage: NO transport layer code at all. Database
//   reactivity handles real-time delivery automatically.
// Key tradeoff: requires Convex as your entire backend.
// Missing vs Knock: batching/digest, preferences UI,
//   multi-channel, pre-built feed component
// Missing vs Upstash: nothing -- Convex does everything
//   Upstash does (and more), but at the cost of a bigger
//   platform commitment
