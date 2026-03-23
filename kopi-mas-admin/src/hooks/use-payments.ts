import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * =========================
 * Helpers - Convert snake_case to camelCase
 * =========================
 */

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((result, key) => {
      let camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

/**
 * =========================
 * Types
 * =========================
 */

export interface Payment {
  id: string;
  member: {
    id: string;
    name: string;
    nik: string;
    phone: string;
  } | null;
  application: {
    id: string;
    loanAmount: number;
  } | null;
  collectionId: string | null;
  installmentId: string | null;
  paymentAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference: string | null;
  externalReference: string | null;
  paidAt: string | null;
  processedByOfficerId: string | null;
  senderAccountNumber: string | null;
  senderBankName: string | null;
  senderName: string | null;
  notes: string | null;
  proofUrl: string | null;
  createdAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  totalAmount: number;
  collectedAmount: number;
  totalCollected: number;
  todayCollected: number;
  monthCollected: number;
  totalTransactions: number;
}

export interface CreatePaymentData {
  memberId: string;
  applicationId?: string;
  collectionId?: string;
  installmentId?: string;
  paymentAmount: number;
  paymentMethod: string;
  transactionReference?: string;
  externalReference?: string;
  senderAccountNumber?: string;
  senderBankName?: string;
  senderName?: string;
  notes?: string;
}

export interface PaymentsQueryParams {
  page: number;
  limit: number;
  status?: string;
  memberId?: string;
  applicationId?: string;
}

/**
 * =========================
 * Helpers
 * =========================
 */

function cleanParams(params: PaymentsQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  if (params.status) cleaned.status = params.status;
  if (params.memberId) cleaned.member_id = params.memberId;
  if (params.applicationId) cleaned.application_id = params.applicationId;
  return cleaned;
}

/**
 * =========================
 * Queries
 * =========================
 */

export function usePaymentsQuery(params: PaymentsQueryParams) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(cleanParams(params) as any).toString();
      const res = await api.get<any>(`/payments?${queryString}`);
      const transformedData = toCamelCase(res.data);
      return {
        data: transformedData,
        meta: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: res.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function usePaymentQuery(id: string) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      const res = await api.get<any>(`/payments/${id}`);
      return toCamelCase(res);
    },
    enabled: !!id,
  });
}

export function usePaymentStatsQuery() {
  return useQuery({
    queryKey: ["payments", "stats"],
    queryFn: async () => {
      const res = await api.get<any>("/payments/stats");
      return toCamelCase(res?.data || res);
    },
  });
}

export function usePaymentHistoryQuery(params: { page?: number; limit?: number; searchTerm?: string } = {}) {
  const { page = 1, limit = 10, searchTerm = "" } = params;
  return useQuery({
    queryKey: ["payments", "history", page, limit, searchTerm],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (searchTerm) {
        searchParams.append("search", searchTerm);
      }
      const res = await api.get<any>(`/payments?${searchParams.toString()}`);
      const transformedData = toCamelCase(res.data);
      return {
        data: transformedData || [],
        meta: {
          page,
          limit,
          total: res.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function usePaymentsByMemberQuery(memberId: string) {
  return useQuery({
    queryKey: ["payments", "member", memberId],
    queryFn: async () => {
      const res = await api.get<any>(`/payments/member/${memberId}`);
      return toCamelCase(res.data);
    },
    enabled: !!memberId,
  });
}

export function usePaymentsByApplicationQuery(applicationId: string) {
  return useQuery({
    queryKey: ["payments", "application", applicationId],
    queryFn: async () => {
      const res = await api.get<any>(`/payments/application/${applicationId}`);
      return toCamelCase(res.data);
    },
    enabled: !!applicationId,
  });
}

/**
 * =========================
 * Mutations
 * =========================
 */

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePaymentData): Promise<Payment> => {
      const res = await api.post<any>("/payments", data);
      return toCamelCase(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useUpdatePaymentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: string;
    }): Promise<Payment> => {
      const res = await api.patch<any>(`/payments/${id}/status`, {
        paymentStatus,
      });
      return toCamelCase(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
