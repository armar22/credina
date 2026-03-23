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

interface MemberSummary {
  id: string;
  name: string;
  nik: string;
  phone: string;
}

interface LoanApplicationSummary {
  id: string;
  loanAmount: number;
  loanTenureMonths: number;
}

export type CollectionStatus = "pending" | "paid" | "overdue" | "partial";

interface LoanCollection {
  id: string;
  member: MemberSummary;
  application: LoanApplicationSummary;
  installmentNumber: number;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  collectionStatus: CollectionStatus;
  paidDate: string | null;
  collectedByOfficerId: string | null;
  notes: string | null;
  createdAt: string;
}

interface CollectionStats {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  totalAmount: number;
  collectedAmount: number;
}

interface CollectionsQueryParams {
  status?: string;
  memberId?: string;
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

export function useCollectionsQuery(params: CollectionsQueryParams = {}) {
  const { status = "all", memberId, page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: ["collections", status, memberId, page, limit],
    queryFn: async (): Promise<PaginatedResponse<LoanCollection[]>> => {
      const queryParams = new URLSearchParams();
      queryParams.set("status", status);
      if (memberId) queryParams.set("member_id", memberId);
      queryParams.set("page", String(page));
      queryParams.set("limit", String(limit));
      const response = await api.get<any>(`/collections?${queryParams.toString()}`);
      const data = response?.data || response;
      const transformed = toCamelCase(data);
      return {
        data: transformed || [],
        meta: {
          page,
          limit,
          total: response?.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCollectionStatsQuery() {
  return useQuery({
    queryKey: ["collections", "stats"],
    queryFn: async () => {
      const response = await api.get<any>("/collections/stats");
      return toCamelCase(response?.data || response);
    },
  });
}

export function useOverdueCollectionsQuery() {
  return useQuery({
    queryKey: ["collections", "overdue"],
    queryFn: async () => {
      const response = await api.get<any>("/collections/overdue");
      const data = response?.data || response;
      return toCamelCase(data) || [];
    },
  });
}

export function useRecordPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, paidAmount }: { collectionId: string; paidAmount: number }) =>
      api.patch<any>(`/collections/${collectionId}/pay`, { paidAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (collectionId: string): Promise<string> => {
      await api.delete(`/collections/${collectionId}`);
      return collectionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}
