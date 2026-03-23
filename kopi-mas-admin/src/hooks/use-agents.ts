import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export interface Agent {
  agentId: string;
  id?: string;
  agentCode: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  idCardNumber?: string;
  pettyCashBalance: number;
  collectionBalance: number;
  totalBalance: number;
  status: "active" | "inactive" | "suspended";
  selfApprovalLimit: number;
  branchId?: string;
  regionId?: string;
  createdAt: string;
}

export interface AgentWallet {
  id: string;
  agentCode: string;
  fullName: string;
  phoneNumber: string;
  pettyCashBalance: number;
  collectionBalance: number;
  totalBalance: number;
  status: string;
  selfApprovalLimit: number;
}

export interface AgentTransaction {
  id: string;
  agentId: string;
  agentName: string;
  transactionType: string;
  amount: number;
  status: string;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  balanceBefore: number;
  balanceAfter: number;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface CreateAgentData {
  fullName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  idCardNumber?: string;
  branchId?: string;
  regionId?: string;
  selfApprovalLimit?: number;
}

export interface UpdateAgentData {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  idCardNumber?: string;
  status?: string;
  selfApprovalLimit?: number;
  branchId?: string;
  regionId?: string;
}

export interface AgentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  branch_id?: string;
  region_id?: string;
}

function cleanParams(params: AgentQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  if (params.search) cleaned.search = params.search;
  if (params.status) cleaned.status = params.status;
  if (params.branch_id) cleaned.branch_id = params.branch_id;
  if (params.region_id) cleaned.region_id = params.region_id;
  return cleaned;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useAgentsQuery(params: AgentQueryParams) {
  const { page = 1, limit = 10, search, status, branch_id, region_id } = params;
  return useQuery({
    queryKey: ["agents", params],
    queryFn: async (): Promise<PaginatedResponse<Agent[]>> => {
      const url = `/agents?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}${branch_id ? `&branch_id=${encodeURIComponent(branch_id)}` : ''}${region_id ? `&region_id=${encodeURIComponent(region_id)}` : ''}`;
      const res = await api.get<any>(url);
      return {
        data: toCamelCase(res?.data?.data || res?.data || []),
        meta: {
          page,
          limit,
          total: res?.data?.total || res?.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useAgentQuery(id: string) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: async () => {
      const res = await api.get<any>(`/agents/${id}`);
      return toCamelCase(res?.data || res);
    },
    enabled: !!id,
  });
}

export function useAgentWalletQuery(id: string) {
  return useQuery({
    queryKey: ["agent", "wallet", id],
    queryFn: async () => {
      const res = await api.get<any>(`/agents/${id}/wallet`);
      return toCamelCase(res?.data || res);
    },
    enabled: !!id,
  });
}

export function useAllAgentWalletsQuery(branchId?: string, regionId?: string) {
  return useQuery({
    queryKey: ["agents", "wallets", branchId, regionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (branchId) params.append("branch_id", branchId);
      if (regionId) params.append("region_id", regionId);
      const res = await api.get<any>(`/agents/wallets?${params.toString()}`);
      return toCamelCase(res?.data || res) || [];
    },
  });
}

export function useAgentTransactionsQuery(agentId: string, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["agent", "transactions", agentId, page, limit],
    queryFn: async (): Promise<PaginatedResponse<AgentTransaction[]>> => {
      const res = await api.get<any>(`/agents/${agentId}/transactions`, { params: { page, limit } });
      return {
        data: toCamelCase(res?.data?.data || res?.data || []),
        meta: {
          page,
          limit,
          total: res?.data?.total || res?.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
    enabled: !!agentId,
  });
}

export function useCreateAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAgentData): Promise<Agent> => {
      const res = await api.post<any>("/agents", data);
      return toCamelCase(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateAgentData & { id: string }): Promise<Agent> => {
      const res = await api.patch<any>(`/agents/${id}`, data);
      return toCamelCase(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", variables.id] });
    },
  });
}

export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useReleasePettyCashMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, amount, description }: { agentId: string; amount: number; description?: string }) => {
      const res = await api.post<any>(`/agents/${agentId}/petty-cash`, {
        amount,
        description,
      });
      return toCamelCase(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", "wallet", variables.agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents", "wallets"] });
    },
  });
}

export function useDisburseToMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, applicationId, amount, notes }: { agentId: string; applicationId: string; amount: number; notes?: string }) => {
      const res = await api.post<any>(`/agents/${agentId}/disburse`, {
        agentId,
        applicationId,
        amount,
        notes,
      });
      return toCamelCase(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", "wallet", variables.agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents", "wallets"] });
    },
  });
}

export function useDepositToAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, amount, notes }: { agentId: string; amount: number; notes?: string }) => {
      const res = await api.post<any>(`/agents/${agentId}/deposit`, {
        agentId,
        amount,
        notes,
      });
      return toCamelCase(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", "wallet", variables.agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents", "wallets"] });
    },
  });
}

export function useReceiveFromCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, amount, collectionId, description }: { agentId: string; amount: number; collectionId: string; description?: string }) => {
      const res = await api.post<any>(`/agents/${agentId}/collection`, {
        amount,
        collectionId,
        description,
      });
      return toCamelCase(res);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", "wallet", variables.agentId] });
      queryClient.invalidateQueries({ queryKey: ["agents", "wallets"] });
    },
  });
}
