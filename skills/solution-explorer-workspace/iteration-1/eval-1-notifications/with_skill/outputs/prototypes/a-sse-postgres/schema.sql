-- Notification data model for SSE + PostgreSQL approach
-- This schema is shared across all custom-built approaches

CREATE TYPE notification_type AS ENUM ('comment', 'like', 'follow');

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  entity_type TEXT,         -- 'post', 'comment', etc.
  entity_id   UUID,         -- ID of the related entity
  message     TEXT NOT NULL, -- Pre-rendered notification text
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching a user's notifications (most recent first)
CREATE INDEX idx_notifications_recipient_created
  ON notifications (recipient_id, created_at DESC);

-- Index for unread count queries
CREATE INDEX idx_notifications_recipient_unread
  ON notifications (recipient_id)
  WHERE read_at IS NULL;

-- Trigger function to notify listeners via pg_notify
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_notification',
    json_build_object(
      'recipient_id', NEW.recipient_id,
      'notification_id', NEW.id,
      'type', NEW.type,
      'message', NEW.message,
      'actor_id', NEW.actor_id,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_new_notification
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_notification();
