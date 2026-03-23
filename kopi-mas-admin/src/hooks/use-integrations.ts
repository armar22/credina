import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Integration {
  integration_id: string;
  integrationName: string;
  integrationType: string;
  provider: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  callbackUrl: string;
  isActive: boolean;
  integrationStatus: string;
  environment: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  lastSyncAt: string;
  lastError: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<string, number>;
}

interface IntegrationsQueryParams {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useIntegrationsQuery(params: IntegrationsQueryParams = {}) {
  const { type, status, page = 1, limit = 10 } = params;
  return useQuery({
    queryKey: ["integrations", type, status, page, limit],
    queryFn: async (): Promise<PaginatedResponse<Integration[]>> => {
      const response: any = await api.get(
        `/integrations?${type ? `type=${type}&` : ''}${status ? `status=${status}&` : ''}page=${page}&limit=${limit}`
      );
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

export function useIntegrationStatsQuery() {
  return useQuery({
    queryKey: ["integrations", "stats"],
    queryFn: () => api.get<IntegrationStats>("/integrations/stats"),
  });
}

export function useIntegrationQuery(integrationId: string) {
  return useQuery({
    queryKey: ["integrations", integrationId],
    queryFn: () => api.get<Integration>(`/integrations/${integrationId}`),
    enabled: !!integrationId,
  });
}

export function useCreateIntegrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Integration>) =>
      api.post<Integration>("/integrations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useUpdateIntegrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      integrationId,
      data,
    }: {
      integrationId: string;
      data: Partial<Integration>;
    }) =>
      api.patch<Integration>(`/integrations/${integrationId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useDeleteIntegrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (integrationId: string) =>
      api.delete(`/integrations/${integrationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useTestConnectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (integrationId: string) =>
      api.post<{ success: boolean; message: string }>(`/integrations/${integrationId}/test`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}

export function useToggleIntegrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ integrationId, isActive }: { integrationId: string; isActive: boolean }) =>
      api.patch<Integration>(`/integrations/${integrationId}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
}
