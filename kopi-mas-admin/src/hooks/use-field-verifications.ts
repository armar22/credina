import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

export interface FieldVerification {
  verificationId: string;
  applicationId: string;
  officerId: string;
  officerName?: string;
  verificationDate: string;
  gpsLatitude: number;
  gpsLongitude: number;
  addressVerified: boolean;
  checklistCompleted: boolean;
  checklistData: Record<string, any>;
  signatureUrl: string;
  verificationStatus: "pending" | "passed" | "failed" | "verified";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVerificationData {
  applicationId: string;
  verificationDate?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  addressVerified?: boolean;
  checklistCompleted?: boolean;
  checklistData?: Record<string, any>;
  signatureUrl?: string;
  verificationStatus?: string;
  notes?: string;
}

export interface VerificationStats {
  total: number;
  pending: number;
  passed: number;
  failed: number;
}

export interface VerificationsQueryParams {
  page: number;
  limit: number;
  status?: string;
  applicationId?: string;
  officerId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

function cleanParams(params: VerificationsQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  if (params.status) cleaned.status = params.status;
  if (params.applicationId) cleaned.application_id = params.applicationId;
  if (params.officerId) cleaned.officer_id = params.officerId;
  if (params.fromDate) cleaned.from_date = params.fromDate;
  if (params.toDate) cleaned.to_date = params.toDate;
  return cleaned;
}

export function useVerificationStatsQuery() {
  return useQuery({
    queryKey: ["field-verifications", "stats"],
    queryFn: () => api.get<VerificationStats>("/field-verifications/stats/summary"),
  });
}

export function useFieldVerificationsQuery(params: VerificationsQueryParams) {
  return useQuery({
    queryKey: ["field-verifications", params.page, params.limit, params.status, params.applicationId],
    queryFn: async (): Promise<PaginatedResponse<FieldVerification[]>> => {
      const res = await api.get<any>("/field-verifications", { params: cleanParams(params) });
      const responseData = res.data || res;
      const transformedData = toCamelCase(responseData);
      return {
        data: transformedData,
        meta: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: res.total ?? responseData.total ?? 0,
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useFieldVerificationQuery(verificationId: string) {
  return useQuery({
    queryKey: ["field-verification", verificationId],
    queryFn: async (): Promise<FieldVerification> => {
      try {
        const res: any = await api.get<any>(`/field-verifications/${verificationId}`);
        const data = res?.data || res;
        if (!data) return {} as FieldVerification;
        return toCamelCase(data);
      } catch (error) {
        console.error("Error fetching verification:", error);
        return {} as FieldVerification;
      }
    },
    enabled: !!verificationId,
  });
}

export function useCreateVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVerificationData): Promise<FieldVerification> => {
      const res = await api.post<any>("/field-verifications", data);
      return toCamelCase(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-verifications"] });
      toast.success("Verification created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create verification");
    },
  });
}

export function useUpdateVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      verificationId,
      data,
    }: {
      verificationId: string;
      data: Partial<FieldVerification>;
    }): Promise<FieldVerification> => {
      const res: any = await api.patch(`/field-verifications/${verificationId}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["field-verifications"] });
      queryClient.setQueryData<FieldVerification>(
        ["field-verification", variables.verificationId],
        (old) => (old ? { ...old, ...variables.data } : old)
      );
      toast.success("Verification updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update verification");
    },
  });
}

export function useDeleteVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationId: string): Promise<string> => {
      await api.delete(`/field-verifications/${verificationId}`);
      return verificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-verifications"] });
      toast.success("Verification deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete verification");
    },
  });
}

export function useApproveVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationId: string): Promise<FieldVerification> => {
      const res: any = await api.patch(`/field-verifications/${verificationId}/approve`, {});
      return res;
    },
    onSuccess: () => {
      toast.success("Verification approved successfully");
      queryClient.invalidateQueries({ queryKey: ["field-verifications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve verification");
    },
  });
}

export function useRejectVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (verificationId: string): Promise<FieldVerification> => {
      const res: any = await api.patch(`/field-verifications/${verificationId}/reject`, {});
      return res;
    },
    onSuccess: () => {
      toast.success("Verification rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["field-verifications"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject verification");
    },
  });
}
