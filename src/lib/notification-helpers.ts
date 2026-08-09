"use client";

export interface NotificationItem {
  id: string;
  type: "conference_update" | "submission_status" | "achievement" | "reminder" | "system";
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATIONS_KEY = "munos_notifications";

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getLocalNotifications(): NotificationItem[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalNotifications(notifications: NotificationItem[]): void {
  if (!isClient()) return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

function generateId(): string {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function clientGetNotifications(): NotificationItem[] {
  return getLocalNotifications();
}

export function clientAddNotification(
  notification: Omit<NotificationItem, "id" | "createdAt">,
): NotificationItem {
  const notifications = getLocalNotifications();
  const newNotification: NotificationItem = {
    ...notification,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotification);
  setLocalNotifications(notifications);
  return newNotification;
}

export function clientMarkAsRead(notificationId: string): void {
  const notifications = getLocalNotifications();
  const updated = notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n,
  );
  setLocalNotifications(updated);
}

export function clientMarkAllAsRead(): void {
  const notifications = getLocalNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  setLocalNotifications(updated);
}

export function clientGetUnreadCount(): number {
  return getLocalNotifications().filter((n) => !n.read).length;
}

export function clientDeleteNotification(notificationId: string): void {
  const notifications = getLocalNotifications().filter(
    (n) => n.id !== notificationId,
  );
  setLocalNotifications(notifications);
}
