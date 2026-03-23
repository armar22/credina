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
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
}

interface LoanApplicationSummary {
  id: string;
  loanAmount: number;
  loanTenureMonths: number;
}

export type TransferStatus = "pending" | "processing" | "completed" | "failed";

interface LoanDisbursement {
  id: string;
  member: MemberSummary | null;
  application: LoanApplicationSummary | null;
  disbursementAmount: number;
  disbursementDate: string;
  transferStatus: TransferStatus;
  transferReference: string | null;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  receiptUrl: string | null;
  notificationSent: boolean;
  processedByOfficerId: string;
  createdAt: string;
}

interface DisbursementsQueryParams {
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

export function useDisbursementsQuery(params: DisbursementsQueryParams = {}) {
  const { page = 1, limit = 10 } = params;
  return useQuery({
    queryKey: ["disbursements", page, limit],
    queryFn: async (): Promise<PaginatedResponse<LoanDisbursement[]>> => {
      const response = await api.get<any>(
        `/disbursements?page=${page}&limit=${limit}`
      );
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

export function useDisbursementQuery(id: string) {
  return useQuery({
    queryKey: ["disbursements", id],
    queryFn: async () => {
      const response = await api.get<any>(`/disbursements/${id}`);
      const data = response?.data || response;
      return toCamelCase(data);
    },
    enabled: !!id,
  });
}

export function useCreateDisbursementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LoanDisbursement>) => {
      const payload = {
        ...data,
        disbursementAmount: String(data.disbursementAmount),
      };
      return api.post<any>("/disbursements", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
  });
}

export function useUpdateDisbursementStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/disbursements/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
  });
}

export function useNotifyDisbursementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<any>(`/disbursements/${id}/notify`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
  });
}
