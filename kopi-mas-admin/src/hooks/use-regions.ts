import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_ENDPOINT = "/regions";

export interface Region {
  region_id: string;
  regionCode: string;
  regionName: string;
  headUserId?: string;
  branchCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface UseRegionsParams {
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

async function getRegions(params?: UseRegionsParams): Promise<PaginatedResponse<Region[]>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  
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

async function getRegion(id: string): Promise<Region> {
  return api.get(`${API_ENDPOINT}/${id}`);
}

async function createRegion(data: Partial<Region>): Promise<Region> {
  return api.post(API_ENDPOINT, data);
}

async function updateRegion(id: string, data: Partial<Region>): Promise<Region> {
  return api.patch(`${API_ENDPOINT}/${id}`, data);
}

async function deleteRegion(id: string): Promise<void> {
  return api.delete(`${API_ENDPOINT}/${id}`);
}

export function useRegionsQuery(params?: UseRegionsParams) {
  return useQuery({
    queryKey: ["regions", params],
    queryFn: () => getRegions(params),
    placeholderData: keepPreviousData,
  });
}

export function useRegionQuery(id: string) {
  return useQuery({
    queryKey: ["region", id],
    queryFn: () => getRegion(id),
    enabled: !!id,
  });
}

export function useCreateRegionMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}

export function useUpdateRegionMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Region> }) => 
      updateRegion(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      queryClient.invalidateQueries({ queryKey: ["region", id] });
    },
  });
}

export function useDeleteRegionMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
    },
  });
}
