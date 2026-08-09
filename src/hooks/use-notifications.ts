"use client";

import { useState, useEffect, useCallback } from "react";
import {
  clientGetNotifications,
  clientAddNotification,
  clientMarkAsRead,
  clientMarkAllAsRead,
  clientDeleteNotification,
  type NotificationItem,
} from "@/lib/notification-helpers";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const all = clientGetNotifications();
    setNotifications(all);
    setUnreadCount(all.filter((n) => !n.read).length);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, "id" | "createdAt">) => {
      clientAddNotification(notification);
      refresh();
    },
    [refresh],
  );

  const markAsRead = useCallback(
    (id: string) => {
      clientMarkAsRead(id);
      refresh();
    },
    [refresh],
  );

  const markAllAsRead = useCallback(() => {
    clientMarkAllAsRead();
    refresh();
  }, [refresh]);

  const deleteNotification = useCallback(
    (id: string) => {
      clientDeleteNotification(id);
      refresh();
    },
    [refresh],
  );

  return {
    notifications,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}

export type { NotificationItem };
