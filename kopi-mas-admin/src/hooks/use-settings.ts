import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Branch {
  branch_id: string;
  branchCode: string;
  branchName: string;
  regionId: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Region {
  region_id: string;
  regionCode: string;
  regionName: string;
  headUserId: string;
  createdAt: string;
  updatedAt: string;
}

export function useBranchesQuery(regionId?: string) {
  return useQuery({
    queryKey: ["branches", regionId],
    queryFn: () => api.get<Branch[]>(`/branches${regionId ? `?region_id=${regionId}` : ''}`),
  });
}

export function useBranchQuery(id: string) {
  return useQuery({
    queryKey: ["branches", id],
    queryFn: () => api.get<Branch>(`/branches/${id}`),
    enabled: !!id,
  });
}

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Branch>) => api.post<Branch>("/branches", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) =>
      api.patch<Branch>(`/branches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useDeleteBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<any>(`/branches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useRegionsQuery() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: () => api.get<Region[]>("/regions"),
  });
}

export function useRegionQuery(id: string) {
  return useQuery({
    queryKey: ["regions", id],
    queryFn: () => api.get<Region>(`/regions/${id}`),
    enabled: !!id,
  });
}

export function useCreateRegionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Region>) => api.post<Region>("/regions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

export function useUpdateRegionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Region> }) =>
      api.patch<Region>(`/regions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

export function useDeleteRegionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<any>(`/regions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}
