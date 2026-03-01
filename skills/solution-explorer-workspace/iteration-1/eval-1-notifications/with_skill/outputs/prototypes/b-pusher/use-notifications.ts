// hooks/use-notifications.ts
// Client-side hook using Pusher for real-time delivery.
//
// Key difference from SSE approach:
// - Uses Pusher's client SDK instead of EventSource
// - Subscribes to a private channel (authenticated)
// - Fetches initial state via REST, then receives real-time updates via Pusher
// - Pusher handles reconnection, connection state, and fallbacks automatically

"use client";

import { useCallback, useEffect, useState } from "react";
import Pusher from "pusher-js";

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

// Singleton Pusher instance (shared across hooks/components)
let pusherInstance: Pusher | null = null;

function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return pusherInstance;
}

export function useNotifications(userId: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fetch initial notification state
    async function fetchInitial() {
      const [notifRes, countRes] = await Promise.all([
        fetch("/api/notifications?limit=20"),
        fetch("/api/notifications/unread-count"),
      ]);
      const notifData = await notifRes.json();
      const countData = await countRes.json();
      setNotifications(notifData.notifications);
      setUnreadCount(countData.count);
    }
    fetchInitial();

    // Subscribe to real-time updates
    const pusher = getPusher();
    const channel = pusher.subscribe(`private-notifications-${userId}`);

    channel.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    channel.bind("new-notification", (data: Omit<Notification, "read">) => {
      const notification: Notification = { ...data, read: false };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    pusher.connection.bind("state_change", (states: { current: string }) => {
      setIsConnected(states.current === "connected");
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-notifications-${userId}`);
    };
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "POST" });
  }, []);

  return { notifications, unreadCount, isConnected, markAsRead, markAllAsRead };
}
