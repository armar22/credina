import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface LoanProduct {
  product_id: string;
  productName: string;
  productType: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  interestRateType: string;
  interestRateMin: number;
  interestRateMax: number;
  isActive: boolean;
}

interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

function cleanParams(params: ProductsQueryParams) {
  const cleaned: Record<string, string> = {};
  if (params.page !== undefined) cleaned.page = String(params.page);
  if (params.limit !== undefined) cleaned.limit = String(params.limit);
  if (params.search) cleaned.search = params.search;
  return cleaned;
}

export function useProductsQuery(params: ProductsQueryParams = {}) {
  return useQuery({
    queryKey: ["products", params.page, params.limit, params.search],
    queryFn: async () => {
      const response: any = await api.get("/loan-products", { params: cleanParams(params) });
      const rawData = response.data?.data || response.data || response;
      const isArray = Array.isArray(rawData);
      return {
        data: isArray ? rawData : [],
        meta: {
          page: isArray ? 1 : (params.page || 1),
          limit: isArray ? rawData.length : (params.limit || 10),
          total: isArray ? rawData.length : (response.data?.total || response.total || 0),
        },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useProductQuery(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get<LoanProduct>(`/loan-products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LoanProduct>) => {
      const payload = {
        productName: data.productName,
        productType: data.productType,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        minTenureMonths: data.minTenureMonths || 1,
        maxTenureMonths: data.maxTenureMonths || 12,
        interestRateType: data.interestRateType || 'fixed',
        interestRateMin: data.interestRateMin || data.interestRateMax || 12,
        interestRateMax: data.interestRateMax || data.interestRateMin || 12,
        isActive: data.isActive ?? true,
      };
      return api.post<LoanProduct>("/loan-products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LoanProduct> }) => {
      const payload = {
        ...data,
        minTenureMonths: data.minTenureMonths || 1,
        maxTenureMonths: data.maxTenureMonths || 12,
      };
      return api.patch<LoanProduct>(`/loan-products/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<any>(`/loan-products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
