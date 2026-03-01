// lib/notifications/create-notification.ts
// Server-side utility to create notifications.
// Called from Server Actions or API routes when a triggering action occurs.
//
// The pg_notify trigger on the notifications table handles the real-time push.
// This function only needs to INSERT; the trigger does the rest.

import { db } from "@/lib/db"; // Your database client (Drizzle, Prisma, etc.)

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
  // Look up actor name for the message
  const actor = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, input.actorId),
    columns: { name: true },
  });

  if (!actor) return;

  // Don't notify yourself
  if (input.recipientId === input.actorId) return;

  const message = MESSAGE_TEMPLATES[input.type](actor.name ?? "Someone");

  await db.insert(notifications).values({
    recipientId: input.recipientId,
    actorId: input.actorId,
    type: input.type,
    entityType: input.entityType,
    entityId: input.entityId,
    message,
  });

  // That's it. The PostgreSQL trigger fires pg_notify,
  // which the SSE route handler picks up and streams to the client.
}

// Usage in a Server Action:
//
// "use server"
// export async function addComment(postId: string, content: string) {
//   const session = await getServerSession();
//   const comment = await db.insert(comments).values({ ... }).returning();
//   const post = await db.query.posts.findFirst({ where: ... });
//
//   await createNotification({
//     recipientId: post.authorId,
//     actorId: session.user.id,
//     type: "comment",
//     entityType: "post",
//     entityId: postId,
//   });
//
//   return comment;
// }
