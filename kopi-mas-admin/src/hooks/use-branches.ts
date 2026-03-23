import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_ENDPOINT = "/branches";

export interface Branch {
  branch_id: string;
  branchCode: string;
  branchName: string;
  regionId?: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseBranchesParams {
  page?: number;
  limit?: number;
  regionId?: string;
  isActive?: boolean;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

async function getBranches(params?: UseBranchesParams): Promise<PaginatedResponse<Branch[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.regionId) searchParams.set("region_id", params.regionId);
  if (params?.isActive !== undefined) searchParams.set("is_active", params.isActive.toString());
  
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const response: any = await api.get(`${API_ENDPOINT}${query}`);
  const rawData = response.data?.data || response.data || response;
  const isArray = Array.isArray(rawData);
  return {
    data: isArray ? rawData : [],
    meta: {
      page: isArray ? 1 : (params?.page || 1),
      limit: isArray ? rawData.length : (params?.limit || 10),
      total: isArray ? rawData.length : (response.data?.total || response.total || 0),
    },
  };
}

async function getBranch(id: string): Promise<Branch> {
  return api.get(`${API_ENDPOINT}/${id}`);
}

async function createBranch(data: Partial<Branch>): Promise<Branch> {
  return api.post(API_ENDPOINT, data);
}

async function updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
  return api.patch(`${API_ENDPOINT}/${id}`, data);
}

async function deleteBranch(id: string): Promise<void> {
  return api.delete(`${API_ENDPOINT}/${id}`);
}

export function useBranchesQuery(params?: UseBranchesParams) {
  return useQuery({
    queryKey: ["branches", params],
    queryFn: () => getBranches(params),
    placeholderData: keepPreviousData,
  });
}

export function useBranchQuery(id: string) {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: () => getBranch(id),
    enabled: !!id,
  });
}

export function useCreateBranchMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Branch> }) => 
      updateBranch(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", id] });
    },
  });
}

export function useDeleteBranchMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}
