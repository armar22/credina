"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar,
  Wallet,
  RefreshCw,
  Ban,
  PercentCircle
} from "lucide-react";
import { useDashboardStatsQuery, useDashboardDailyQuery, useDashboardTrendQuery } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useI18n } from "@/lib/i18n";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

const mockDailyTrend = [
  { name: "Mon", disbursement: 45000000, collection: 12000000 },
  { name: "Tue", disbursement: 52000000, collection: 15000000 },
  { name: "Wed", disbursement: 48000000, collection: 18000000 },
  { name: "Thu", disbursement: 61000000, collection: 22000000 },
  { name: "Fri", disbursement: 55000000, collection: 19000000 },
  { name: "Sat", disbursement: 28000000, collection: 8000000 },
  { name: "Sun", disbursement: 12000000, collection: 3500000 },
];

const mockStatusDistribution = [
  { name: "Active", value: 145, color: "#10b981" },
  { name: "Completed", value: 89, color: "#3b82f6" },
  { name: "Overdue", value: 23, color: "#ef4444" },
  { name: "Pending", value: 34, color: "#f59e0b" },
];

export default function DashboardPage() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useDashboardStatsQuery();
  const { data: dailyStats, isLoading: dailyLoading } = useDashboardDailyQuery();
  const { data: trendData, isLoading: trendLoading } = useDashboardTrendQuery("week");

  const chartData = trendData && trendData.length > 0 ? trendData : mockDailyTrend;
  const statusData = stats?.collectionStats ? [
    { name: "Active", value: stats.disbursementStats?.completed || 0, color: "#10b981" },
    { name: "Completed", value: stats.loanApplicationStats?.disbursed || 0, color: "#3b82f6" },
    { name: "Overdue", value: stats.collectionStats?.overdue || 0, color: "#ef4444" },
    { name: "Pending", value: stats.loanApplicationStats?.submitted || 0, color: "#f59e0b" },
  ] : mockStatusDistribution;

  if (isLoading || dailyLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-80 col-span-2 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Daily monitoring and quick overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Badge>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications Today</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats?.newApplications || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {(dailyStats?.disbursementChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(dailyStats?.disbursementChange || 0).toFixed(1)}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disbursed Today</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dailyStats?.disbursedAmount)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {(dailyStats?.disbursementChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(dailyStats?.disbursementChange || 0).toFixed(1)}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections Today</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dailyStats?.collectedAmount)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {(dailyStats?.collectionChange || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(dailyStats?.collectionChange || 0).toFixed(1)}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <PercentCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.collectionStats?.collectionRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              {stats?.collectionStats?.paid || 0} paid installments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.memberStats?.total || 0).toLocaleString("id-ID")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.memberStats?.newThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.loanApplicationStats?.submitted || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.loanApplicationStats?.underReview || 0} under review
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.disbursementStats?.disbursedAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.disbursementStats?.total || 0} loans
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Loans</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.collectionStats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(12500000)} outstanding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Disbursement & Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDisbursement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="disbursement" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDisbursement)"
                    name="Disbursement"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collection" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCollection)"
                    name="Collection"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Loan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {statusData.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Actions */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Actions</CardTitle>
            <Link href="/approvals">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">Pending Approvals</p>
                    <p className="text-xs text-muted-foreground">{stats?.loanApplicationStats?.submitted || 0} applications waiting</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  {stats?.loanApplicationStats?.submitted || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Under Review</p>
                    <p className="text-xs text-muted-foreground">{stats?.loanApplicationStats?.underReview || 0} applications</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {stats?.loanApplicationStats?.underReview || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <Ban className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm">Overdue Payments</p>
                    <p className="text-xs text-muted-foreground">{stats?.collectionStats?.overdue || 0} installments</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {stats?.collectionStats?.overdue || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <Link href="/applications">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentApplications?.slice(0, 4).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{app.memberName}</p>
                      <p className="text-xs text-muted-foreground">ID: {app.id?.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(app.loanAmount)}</p>
                    <Badge 
                      variant="secondary" 
                      className={app.status === 'approved' ? 'bg-green-100 text-green-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {app.status}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>No recent applications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold text-green-600">{stats?.disbursementStats?.completed || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.loanApplicationStats?.disbursed || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats?.loanApplicationStats?.rejected || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats?.loanApplicationStats?.total 
                    ? ((stats.loanApplicationStats.approved / stats.loanApplicationStats.total) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
