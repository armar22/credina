import { useQuery } from "@tanstack/react-query";
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

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface LoanApplicationStats {
  total: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
  disbursed: number;
}

export interface DisbursementStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalAmount: number;
  disbursedAmount: number;
}

export interface CollectionStats {
  totalDue: number;
  totalCollected: number;
  collectionRate: number;
  pending: number;
  paid: number;
  overdue: number;
}

export interface RecentApplication {
  id: string;
  memberName: string;
  loanAmount: number;
  status: string;
  submittedAt: string;
  productName?: string;
}

export interface RecentDisbursement {
  id: string;
  memberName: string;
  amount: number;
  status: string;
  disbursedAt: string;
}

export interface DashboardStats {
  memberStats: MemberStats;
  loanApplicationStats: LoanApplicationStats;
  disbursementStats: DisbursementStats;
  collectionStats: CollectionStats;
  recentApplications: RecentApplication[];
  recentDisbursements: RecentDisbursement[];
}

export interface DailyStats {
  date: string;
  newApplications: number;
  disbursedAmount: number;
  collectedAmount: number;
  approvedApplications: number;
  disbursementChange?: number;
  collectionChange?: number;
}

export interface TrendData {
  period: string;
  disbursement: number;
  collection: number;
}

export function useDashboardStatsQuery(branchId?: string) {
  return useQuery({
    queryKey: ["dashboard", "stats", branchId],
    queryFn: async () => {
      const res = await api.get<any>(
        `/dashboard/stats${branchId ? `?branch_id=${branchId}` : ''}`
      );
      const data = res?.data || res;
      return toCamelCase(data);
    },
  });
}

export function useDashboardDailyQuery(date?: string) {
  return useQuery({
    queryKey: ["dashboard", "daily", date],
    queryFn: async () => {
      const res = await api.get<any>(
        `/dashboard/daily${date ? `?date=${date}` : ''}`
      );
      const data = res?.data || res;
      return toCamelCase(data);
    },
  });
}

export function useDashboardTrendQuery(period: string = "week") {
  return useQuery({
    queryKey: ["dashboard", "trend", period],
    queryFn: async () => {
      const res = await api.get<any>(`/dashboard/trend?period=${period}`);
      const data = res?.data || res;
      return toCamelCase(data) || [];
    },
  });
}
