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

export type InstallmentStatus = "pending" | "paid" | "overdue" | "partial";

export interface LoanInstallment {
  id: string;
  member: MemberSummary | null;
  application: LoanApplicationSummary | null;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  paidAmount: number;
  paidDate: string | null;
  installmentStatus: InstallmentStatus;
  penaltyAmount: number;
  paymentMethod: string | null;
  transactionReference: string | null;
  notes: string | null;
  createdAt: string;
}

export interface InstallmentStats {
  totalInstallments: number;
  pendingCount: number;
  paidCount: number;
  overdueCount: number;
  totalDueAmount: number;
  totalPaidAmount: number;
}

interface InstallmentsQueryParams {
  status?: string;
  memberId?: string;
  applicationId?: string;
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

function cleanParams(params: InstallmentsQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.status) cleaned.status = params.status;
  if (params.memberId) cleaned.member_id = params.memberId;
  if (params.applicationId) cleaned.application_id = params.applicationId;
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  return cleaned;
}

export function useInstallmentsQuery(params: InstallmentsQueryParams = {}) {
  const { status = "all", memberId, applicationId, page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: ["installments", status, memberId, applicationId, page, limit],
    queryFn: async (): Promise<PaginatedResponse<LoanInstallment[]>> => {
      const queryParams = cleanParams({ status, memberId, applicationId, page, limit });
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await api.get<any>(`/installments?${queryString}`);
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

export function useInstallmentStatsQuery() {
  return useQuery({
    queryKey: ["installments", "stats"],
    queryFn: async () => {
      const response = await api.get<any>("/installments/stats");
      return toCamelCase(response?.data || response);
    },
  });
}

export function useOverdueInstallmentsQuery() {
  return useQuery({
    queryKey: ["installments", "overdue"],
    queryFn: async () => {
      const response = await api.get<any>("/installments/overdue");
      const data = response?.data || response;
      return toCamelCase(data) || [];
    },
  });
}

export function useInstallmentsByApplicationQuery(applicationId: string) {
  return useQuery({
    queryKey: ["installments", "application", applicationId],
    queryFn: async () => {
      const response = await api.get<any>(`/installments/application/${applicationId}`);
      const data = response?.data || response;
      return toCamelCase(data) || [];
    },
    enabled: !!applicationId,
  });
}

export function useInstallmentsByMemberQuery(memberId: string) {
  return useQuery({
    queryKey: ["installments", "member", memberId],
    queryFn: async () => {
      const response = await api.get<any>(`/installments/member/${memberId}`);
      const data = response?.data || response;
      return toCamelCase(data) || [];
    },
    enabled: !!memberId,
  });
}

export function useRecordPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      installmentId,
      paidAmount,
      paymentMethod,
      transactionReference,
    }: {
      installmentId: string;
      paidAmount: number;
      paymentMethod?: string;
      transactionReference?: string;
    }) =>
      api.patch<any>(`/installments/${installmentId}/pay`, {
        paidAmount,
        paymentMethod,
        transactionReference,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
}
