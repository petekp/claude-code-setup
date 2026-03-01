// lib/notifications/create-notification.ts
// Server-side utility using Supabase service role client.
//
// Key simplification: No dual-write, no pub/sub trigger.
// Inserting into the notifications table IS the notification.
// Supabase Realtime automatically detects the INSERT via WAL
// and pushes it to any client subscribed with a matching filter.

import { createClient } from "@supabase/supabase-js";

type NotificationType = "comment" | "like" | "follow";

type CreateNotificationInput = {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityType?: string;
  entityId?: string;
};

// Service role client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MESSAGE_TEMPLATES: Record<NotificationType, (actorName: string) => string> = {
  comment: (name) => `${name} commented on your post`,
  like: (name) => `${name} liked your post`,
  follow: (name) => `${name} started following you`,
};

export async function createNotification(input: CreateNotificationInput) {
  if (input.recipientId === input.actorId) return;

  // Look up actor name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", input.actorId)
    .single();

  const actorName = profile?.display_name ?? "Someone";
  const message = MESSAGE_TEMPLATES[input.type](actorName);

  // Single write. Supabase Realtime handles the rest.
  const { error } = await supabase.from("notifications").insert({
    recipient_id: input.recipientId,
    actor_id: input.actorId,
    type: input.type,
    entity_type: input.entityType,
    entity_id: input.entityId,
    message,
  });

  if (error) {
    console.error("Failed to create notification:", error);
  }
}
