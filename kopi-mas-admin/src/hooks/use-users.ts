import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface User {
  id: string;
  user_id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  branchId?: string;
  branchName?: string;
  isActive: boolean;
  avatar?: string;
  phone?: string;
}

interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

function cleanParams(params: UsersQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  if (params.search) cleaned.search = params.search;
  return cleaned;
}

export function useUsersQuery(params: UsersQueryParams = {}) {
  return useQuery({
    queryKey: ["users", params.page, params.limit, params.search],
    queryFn: async () => {
      const response = await api.get<any>("/users", { params: cleanParams(params) });
      if (response.data && Array.isArray(response.data) && response.total !== undefined) {
        return {
          data: response.data,
          meta: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: response.total,
          },
        };
      }
      const rawData = response.data?.data || response.data || response;
      const isArray = Array.isArray(rawData);
      return {
        data: isArray ? rawData : [],
        meta: {
          page: isArray ? 1 : (params.page || 1),
          limit: isArray ? rawData.length : (params.limit || 10),
          total: isArray ? rawData.length : (response.data?.total || response.total || 0),
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useUserQuery(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api.get<User>(`/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<User>) => api.post<User>("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      api.patch<User>(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<any>(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
