// ============================================================
// KNOCK PROTOTYPE: Complete notification system
// Lines of app code needed: ~90
// External dependencies: @knocklabs/react, @knocklabs/node
// What Knock provides: real-time feed, unread counts, read
//   state, batching, preferences, UI components
// ============================================================

// --- 1. Server: Trigger notifications (server action) ---
// File: app/actions/notifications.ts
"use server";

import { Knock } from "@knocklabs/node";

const knock = new Knock(process.env.KNOCK_API_KEY);

type NotificationType = "comment" | "like" | "follow";

type NotificationData = {
  type: NotificationType;
  actorId: string;
  actorName: string;
  recipientId: string;
  targetId?: string;
  targetTitle?: string;
};

export async function triggerNotification(data: NotificationData) {
  // Knock workflow handles batching ("Alice and 4 others liked your post"),
  // channel routing (in-app, email, push), and delivery
  await knock.workflows.trigger(`${data.type}-notification`, {
    recipients: [data.recipientId],
    actor: data.actorId,
    data: {
      actorName: data.actorName,
      targetId: data.targetId,
      targetTitle: data.targetTitle,
    },
  });
}

// Usage in a comment creation action:
export async function createComment(postId: string, content: string) {
  // const comment = await db.comments.create({ postId, content, authorId });
  // const post = await db.posts.findById(postId);

  await triggerNotification({
    type: "comment",
    actorId: "current-user-id", // from auth
    actorName: "Current User",
    recipientId: "post-author-id", // post.authorId
    targetId: postId,
    targetTitle: "Post Title", // post.title
  });
}

// --- 2. Client: Notification provider (layout) ---
// File: app/layout.tsx (relevant portion)
// "use client" -- only the KnockProvider wrapper needs this

import {
  KnockProvider,
  KnockFeedProvider,
} from "@knocklabs/react";

function NotificationProvider({ children }: { children: React.ReactNode }) {
  // userId and userToken come from your auth system
  const userId = "current-user-id";
  const userToken = "knock-user-token"; // generated server-side via Knock API

  return (
    <KnockProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_KEY!} // safe: public key
      userId={userId}
      userToken={userToken}
    >
      <KnockFeedProvider feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_ID!}>
        {children}
      </KnockFeedProvider>
    </KnockProvider>
  );
}

// --- 3. Client: Notification bell with real-time count ---
// File: components/notification-bell.tsx
"use client";

import {
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react";
import { useRef, useState } from "react";

// This is CSS that Knock provides
import "@knocklabs/react/dist/index.css";

export function NotificationBell() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <NotificationIconButton
        ref={buttonRef}
        onClick={() => setIsVisible(!isVisible)}
        // Unread count badge is automatic -- Knock tracks it
      />
      <NotificationFeedPopover
        buttonRef={buttonRef}
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        // Feed content, read/unread state, mark-as-read --
        // all handled by Knock's component
      />
    </>
  );
}

// --- 4. That's it. ---
// No database schema for notifications.
// No real-time transport setup.
// No unread count logic.
// No read/mark-as-read mutations.
// No feed pagination.
// No batching logic.
// Knock handles all of this.

// What you configure in Knock's dashboard (not code):
// - Workflow templates for each notification type
// - Batching rules ("batch likes on same post within 5 minutes")
// - Channel configuration (in-app feed, email, push)
// - Notification templates with variable interpolation
