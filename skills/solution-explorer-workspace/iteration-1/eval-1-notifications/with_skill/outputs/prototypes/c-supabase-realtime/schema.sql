-- Notification schema for Supabase approach
-- Nearly identical to the SSE/Postgres schema, but:
-- 1. Uses Supabase's auth.uid() for RLS policies
-- 2. No pg_notify trigger needed (Supabase Realtime handles it)
-- 3. The table must be added to the supabase_realtime publication

CREATE TYPE notification_type AS ENUM ('comment', 'like', 'follow');

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  message     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_created
  ON notifications (recipient_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_unread
  ON notifications (recipient_id)
  WHERE read_at IS NULL;

-- Row Level Security: users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Service role can insert notifications (from server-side actions)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Restrict to service role in practice

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
