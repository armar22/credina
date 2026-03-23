import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface LoanDocument {
  document_id: string;
  applicationId: string;
  memberId?: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  captureTimestamp: string;
  uploadedByOfficerId: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export function useLoanDocumentsQuery(applicationId: string) {
  return useQuery({
    queryKey: ["loan-documents", applicationId],
    queryFn: () => api.get<LoanDocument[]>(`/loan-applications/${applicationId}/documents`),
    enabled: !!applicationId,
  });
}

export function useMemberDocumentsQuery(params: { memberId: string; page?: number; limit?: number } = { memberId: "" }) {
  const { memberId, page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: ["loan-documents", "member", memberId, page, limit],
    queryFn: async (): Promise<PaginatedResponse<LoanDocument[]>> => {
      const res = await api.get<any>(
        `/loan-documents?page=${page}&limit=${limit}&member_id=${memberId}`
      );
      return {
        data: res.data?.data || res.data || [],
        meta: {
          page,
          limit,
          total: res.data?.total || res.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
    enabled: !!memberId,
  });
}

export function useCreateLoanDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: Partial<LoanDocument> }) =>
      api.post<LoanDocument>(`/loan-applications/${applicationId}/documents`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["loan-documents", variables.applicationId] });
    },
  });
}

export function useAllDocumentsQuery(params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: ["loan-documents", "all", page, limit],
    queryFn: async (): Promise<PaginatedResponse<LoanDocument[]>> => {
      const res = await api.get<any>(
        `/loan-documents?page=${page}&limit=${limit}`
      );
      return {
        data: res.data?.data || res.data || [],
        meta: {
          page,
          limit,
          total: res.data?.total || res.total || 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}
