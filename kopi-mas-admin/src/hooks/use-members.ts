import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
      // Map member_id to id
      let camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (camelKey === "memberId") camelKey = "id";
      
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

export interface Member {
  id: string;
  name: string;
  nik: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
  dob?: string;
  gender?: "male" | "female";
  ktpImageUrl?: string;
  photoUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ocrNik?: string;
  ocrName?: string;
  ocrDob?: string;
  ocrGender?: string
  ocrAddress?: string;
  ktpVerificationStatus?: 'pending' | 'match' | 'manual_verification' | 'low_result';
  ktpVerificationNotes?: string;
  ocrConfidence?: number;
}

export interface CreateMemberData {
  name: string;
  nik: string;
  dob: string;
  gender: "male" | "female";
  phone: string;
  email?: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  ktpImageUrl: string;
  photoUrl?: string;
  createdByOfficerId?: string;
}

export interface MembersQueryParams {
  page: number;
  limit: number;
  status?: string;
  city?: string;
}

export interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * =========================
 * Helpers
 * =========================
 */

function cleanParams(params: MembersQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  if (params.status) cleaned.status = params.status;
  if (params.city) cleaned.city = params.city;
  return cleaned;
}

/**
 * =========================
 * Queries
 * =========================
 */

export function useMembersQuery(params: MembersQueryParams) {
  return useQuery({
    queryKey: ["members", params.page, params.limit, params.status, params.city],

    queryFn: async (): Promise<PaginatedResponse<Member[]>> => {
      const res = await api.get<any>(
        "/members",
        {
          params: cleanParams(params),
        }
      );

      // Transform snake_case to camelCase
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

    // React Query v5 way
    placeholderData: keepPreviousData,
  });
}

export function useMemberQuery(id: string) {
  return useQuery({
    queryKey: ["member", id],

    queryFn: async (): Promise<Member> => {
      try {
        const res: any = await api.get<any>(`/members/${id}`);
        // Handle different response formats
        const data = res?.data || res;
        if (!data) {
          return {} as Member;
        }
        return toCamelCase(data);
      } catch (error) {
        console.error("Error fetching member:", error);
        return {} as Member;
      }
    },

    enabled: !!id,
  });
}

/**
 * =========================
 * Mutations
 * =========================
 */

export function useCreateMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMemberData): Promise<Member> => {
      const res = await api.post<any>("/members", data);
      // Transform snake_case to camelCase
      return toCamelCase(res.data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useUpdateMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Member> & { id: string }): Promise<Member> => {
      const res: any = await api.patch(
        `/members/${id}`,
        data
      );
      return res.data;
    },

    onSuccess: (_, variables) => {
      // ✅ invalidate list
      queryClient.invalidateQueries({ queryKey: ["members"] });

      // ✅ update single cache immediately (better UX)
      queryClient.setQueryData<Member>(
        ["member", variables.id],
        (old) => (old ? { ...old, ...variables } : old)
      );
    },
  });
}

export function useDeleteMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      await api.delete(`/members/${id}`);
      return id;
    },

    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useActivateMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Member> => {
      const res: any = await api.patch(`/members/${id}/activate`, {});
      return res;
    },

    onSuccess: () => {
      toast.success("Member activated successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to activate member");
    },
  });
}

export function useApproveMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Member> => {
      const res: any = await api.patch(`/members/${id}/approve`, {});
      return res;
    },

    onSuccess: () => {
      toast.success("Member approved successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve member");
    },
  });
}

export function useRejectMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Member> => {
      const res: any = await api.patch(`/members/${id}/reject`, {});
      return res;
    },

    onSuccess: () => {
      toast.success("Member rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject member");
    },
  });
}

export function useDeactivateMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Member> => {
      const res: any = await api.patch(`/members/${id}/deactivate`, {});
      return res;
    },

    onSuccess: () => {
      toast.success("Member deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to deactivate member");
    },
  });
}

export function useSuspendMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Member> => {
      const res: any = await api.patch(`/members/${id}/suspend`, {});
      return res;
    },

    onSuccess: () => {
      toast.success("Member suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to suspend member");
    },
  });
}

export function useProcessKtpOcrMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, ktpImageUrl, submittedNik, submittedName, submittedDob, submittedGender }: {
      memberId: string;
      ktpImageUrl: string;
      submittedNik?: string;
      submittedName?: string;
      submittedDob?: string;
      submittedGender?: string;
    }): Promise<any> => {
      const res: any = await api.post(`/members/${memberId}/ocr`, {
        ktpImageUrl,
        submittedNik,
        submittedName,
        submittedDob,
        submittedGender,
      });
      return res;
    },

    onSuccess: () => {
      toast.success("OCR processed successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to process OCR");
    },
  });
}

export function useVerifyKtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, status, notes }: {
      memberId: string;
      status: 'match' | 'manual_verification' | 'low_result';
      notes?: string;
    }): Promise<Member> => {
      const res: any = await api.patch(`/members/${memberId}/verify-ktp`, { status, notes });
      return res;
    },

    onSuccess: () => {
      toast.success("KTP verification updated successfully");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update verification");
    },
  });
}