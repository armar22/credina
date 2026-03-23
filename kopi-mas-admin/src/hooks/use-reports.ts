import { useQuery, useMutation } from "@tanstack/react-query";
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

export interface PortfolioSummary {
  totalLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalCollections: number;
  approvedLoans: number;
  pendingLoans: number;
  rejectedLoans: number;
  branchId?: string;
  byStatus?: Record<string, number>;
  byProduct?: Record<string, number>;
}

export interface OfficerPerformance {
  officerId: string;
  officerName: string;
  applicationsProcessed: number;
  applicationsApproved: number;
  disbursementsProcessed: number;
  disbursementsAmount: number;
  collectionsCollected: number;
  successRate: number;
}

export interface CollectionReport {
  totalDue: number;
  totalCollected: number;
  collectionRate: number;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface ReconciliationData {
  date: string;
  expected: number;
  actual: number;
  diff: number;
  status: string;
  transactions: number;
}

export interface RegionalData {
  regionId: string;
  regionName: string;
  applications: number;
  disbursed: number;
  collected: number;
  rate: number;
  branches: number;
}

export interface ExportReportResponse {
  url: string;
}

export function usePortfolioSummaryQuery(branchId?: string) {
  return useQuery({
    queryKey: ["reports", "portfolio", branchId],
    queryFn: async () => {
      const res = await api.get<any>(
        `/reports/portfolio${branchId ? `?branch_id=${branchId}` : ''}`
      );
      return toCamelCase(res?.data || res);
    },
  });
}

export function useOfficerPerformanceQuery(branchId?: string) {
  return useQuery({
    queryKey: ["reports", "officer-performance", branchId],
    queryFn: async () => {
      const res = await api.get<any>(
        `/reports/officer-performance${branchId ? `?branch_id=${branchId}` : ''}`
      );
      const data = res?.data || res;
      return {
        officers: toCamelCase(data?.officers || data || []),
      };
    },
  });
}

export function useCollectionReportQuery(branchId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["reports", "collection", branchId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (branchId) params.append("branch_id", branchId);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      
      const res = await api.get<any>(`/reports/collections?${params.toString()}`);
      return toCamelCase(res?.data || res);
    },
  });
}

export function useReconciliationQuery(branchId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["reports", "reconciliation", branchId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (branchId) params.append("branch_id", branchId);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      
      const res = await api.get<any>(`/reports/reconciliation?${params.toString()}`);
      const data = res?.data || res;
      return toCamelCase(Array.isArray(data) ? data : []);
    },
  });
}

export function useRegionalReportQuery() {
  return useQuery({
    queryKey: ["reports", "regional"],
    queryFn: async () => {
      const res = await api.get<any>("/reports/regional");
      const data = res?.data || res;
      return toCamelCase(data || []);
    },
  });
}

export function useExportReportMutation() {
  return useMutation({
    mutationFn: (data: { reportType: string; format: string; branch_id?: string; start_date?: string; end_date?: string }) =>
      api.post<ExportReportResponse>("/reports/export", data),
  });
}
