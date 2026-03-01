// lib/notifications/create-notification.ts
// Server-side utility to create notifications with Pusher delivery.
//
// Key difference from SSE approach: we explicitly trigger a Pusher event
// after inserting the notification. This is a "dual write" -- the database
// is the source of truth, Pusher is the real-time transport.
//
// If the Pusher trigger fails, the notification still exists in the DB
// and will appear on the user's next page load or poll.

import { db } from "@/lib/db";
import { pusher } from "@/lib/pusher/server";

type NotificationType = "comment" | "like" | "follow";

type CreateNotificationInput = {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityType?: string;
  entityId?: string;
};

const MESSAGE_TEMPLATES: Record<NotificationType, (actorName: string) => string> = {
  comment: (name) => `${name} commented on your post`,
  like: (name) => `${name} liked your post`,
  follow: (name) => `${name} started following you`,
};

export async function createNotification(input: CreateNotificationInput) {
  const actor = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, input.actorId),
    columns: { name: true },
  });

  if (!actor) return;
  if (input.recipientId === input.actorId) return;

  const message = MESSAGE_TEMPLATES[input.type](actor.name ?? "Someone");

  // Step 1: Write to database (source of truth)
  const [notification] = await db
    .insert(notifications)
    .values({
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      message,
    })
    .returning();

  // Step 2: Push via Pusher (real-time transport)
  // Wrapped in try/catch -- if Pusher fails, the notification is still in the DB
  try {
    await pusher.trigger(
      `private-notifications-${input.recipientId}`,
      "new-notification",
      {
        id: notification.id,
        type: notification.type,
        message: notification.message,
        actorId: notification.actorId,
        createdAt: notification.createdAt,
      }
    );
  } catch (error) {
    // Log but don't throw -- notification is persisted, just not pushed in real-time
    console.error("Pusher trigger failed:", error);
  }
}
