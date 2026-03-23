import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

interface PaginatedLoanApplications {
  data: LoanApplication[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}


interface MemberSummary {
  id: string;
  name: string;
  nik: string;
  phone: string;
}

interface LoanProductSummary {
  id: string;
  productName: string;
  productType: string;
}

interface BranchSummary {
  id: string;
  branchCode: string;
  branchName: string;
}

interface LoanApplication {
  id: string;
  member: MemberSummary;
  agentId: string | null;
  agentName: string | null;
  loanProduct: LoanProductSummary | null;
  branch: BranchSummary | null;
  loanProductType: string;
  loanAmount: number;
  loanTenureMonths: number;
  interestRate: number;
  interestRateType: string;
  purposeDescription: string | null;
  incomeSource: string;
  monthlyIncome: number;
  debtToIncomeRatio: number | null;
  applicationStatus: string;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  creditScore: number | null;
  aiRecommendation: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  disbursedByAgent: boolean;
  agentDisbursementDate: string | null;
  createdAt: string;
}

interface UseLoanApplicationsQueryParams {
  page: number;
  limit: number;
  searchTerm?: string;
  statusFilter?: string;
}

interface UseLoanApplicationsQueryResult {
  data: LoanApplication[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

function cleanParams(params: UseLoanApplicationsQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  if (params.searchTerm) cleaned.search = params.searchTerm;
  if (params.statusFilter) cleaned.status = params.statusFilter;
  return cleaned;
}

export function useLoanApplicationsQuery(params: UseLoanApplicationsQueryParams) {
  return useQuery({
    queryKey: ["applications", params.page, params.limit, params.searchTerm, params.statusFilter],
    queryFn: async (): Promise<PaginatedLoanApplications> => {
      const response = await api.get<any>(
        `/loan-applications`,
        { params: cleanParams(params) }
      );
      const data = response?.data || response;
      const transformed = toCamelCase(data);
      return {
        data: transformed || [],
        meta: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: response?.total ?? 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useLoanApplicationQuery(id: string) {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: async () => {
      const response = await api.get<any>(`/loan-applications/${id}`);
      const data = response?.data || response;
      return toCamelCase(data);
    },
    enabled: !!id,
  });
}

export function useApproveApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewedBy }: { id: string; reviewedBy?: string }) =>
      api.patch<LoanApplication>(`/loan-applications/${id}/status`, { 
        status: 'approved',
        reviewedBy 
      }),
    onSuccess: () => {
      toast.success("Application approved successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve application");
    },
  });
}

export function useRejectApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch<LoanApplication>(`/loan-applications/${id}/status`, { 
        status: 'rejected',
        rejectionReason: reason 
      }),
    onSuccess: () => {
      toast.success("Application rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject application");
    },
  });
}

export function useCreateLoanApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LoanApplication>) =>
      api.post<LoanApplication>("/loan-applications", data),
    onSuccess: () => {
      toast.success("Application created successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create application");
    },
  });
}

export function useUpdateLoanApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LoanApplication> }) =>
      api.patch<LoanApplication>(`/loan-applications/${id}`, data),
    onSuccess: () => {
      toast.success("Application updated successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update application");
    },
  });
}

export function useDeleteLoanApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await api.delete(`/loan-applications/${id}`);
      return id;
    },
    onSuccess: () => {
      toast.success("Application deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete application");
    },
  });
}
