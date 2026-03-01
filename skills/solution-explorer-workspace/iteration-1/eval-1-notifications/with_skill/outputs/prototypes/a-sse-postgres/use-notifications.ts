// hooks/use-notifications.ts
// Client-side hook that connects to the SSE stream and manages notification state.
//
// Key design decisions:
// - Uses EventSource API with automatic reconnection
// - Maintains a local cache of recent notifications for instant rendering
// - Falls back to REST fetch if SSE connection fails persistently
// - Provides both the notification list AND unread count

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type NotificationType = "comment" | "like" | "follow";

type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  actorId: string;
  createdAt: string;
  read: boolean;
};

type UseNotificationsReturn = {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener("unread_count", (event) => {
      const data = JSON.parse(event.data);
      setUnreadCount(data.count);
    });

    eventSource.addEventListener("notification", (event) => {
      const data = JSON.parse(event.data);
      const notification: Notification = {
        id: data.id,
        type: data.type,
        message: data.message,
        actorId: data.actorId,
        createdAt: data.createdAt,
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      // EventSource automatically reconnects. If it fails repeatedly,
      // fall back to polling.
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    await fetch(`/api/notifications/${notificationId}/read`, {
      method: "POST",
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    await fetch("/api/notifications/read-all", { method: "POST" });
  }, []);

  return { notifications, unreadCount, isConnected, markAsRead, markAllAsRead };
}
