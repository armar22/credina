import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AuditLog {
  log_id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  description: string;
  isSuccess: boolean;
  errorMessage: string;
  createdAt: string;
}

export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useAuditLogsQuery(filters: {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams();
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  
  if (filters.userId) params.append("user_id", filters.userId);
  if (filters.action) params.append("action", filters.action);
  if (filters.entityType) params.append("entity_type", filters.entityType);
  if (filters.entityId) params.append("entity_id", filters.entityId);
  if (filters.startDate) params.append("start_date", filters.startDate);
  if (filters.endDate) params.append("end_date", filters.endDate);
  params.append("page", String(page));
  params.append("limit", String(limit));

  return useQuery({
    queryKey: ["audit-logs", filters.action, filters.entityType, filters.page, filters.limit],
    queryFn: async () => {
      const response: any = await api.get(`/audit-logs?${params.toString()}`);
      if (response.data && Array.isArray(response.data)) {
        return {
          data: response.data,
          meta: {
            page,
            limit,
            total: response.total || 0,
          },
        };
      }
      return {
        data: response.data?.data || response.data || [],
        meta: {
          page,
          limit,
          total: response.data?.total || response.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useAuditStatsQuery() {
  return useQuery({
    queryKey: ["audit-logs", "stats"],
    queryFn: () => api.get<AuditStats>("/audit-logs/stats"),
  });
}

export function useAuditLogsByUserQuery(userId: string, limit: number = 50) {
  return useQuery({
    queryKey: ["audit-logs", "user", userId, limit],
    queryFn: () => api.get<AuditLog[]>(`/audit-logs/user/${userId}?limit=${limit}`),
    enabled: !!userId,
  });
}

export function useAuditLogsByEntityQuery(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["audit-logs", "entity", entityType, entityId],
    queryFn: () => api.get<AuditLog[]>(`/audit-logs/entity/${entityType}/${entityId}`),
    enabled: !!entityType && !!entityId,
  });
}
