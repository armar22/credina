import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Notification {
  notification_id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: string;
  priority: string;
  entityType: string;
  entityId: string;
  isRead: boolean;
  readAt: string;
  actionUrl: string;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export function useNotificationsQuery(limit: number = 10, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ["notifications", limit, unreadOnly],
    queryFn: () =>
      api.get<Notification[]>(`/notifications?limit=${limit}&unread=${unreadOnly}`),
  });
}

export function useNotificationStatsQuery() {
  return useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: () => api.get<NotificationStats>("/notifications/stats"),
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get<{ count: number }>("/notifications/unread-count"),
    refetchInterval: 30000,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      api.patch<Notification>(`/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch<{ message: string }>("/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => api.delete(`/notifications/${notificationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
