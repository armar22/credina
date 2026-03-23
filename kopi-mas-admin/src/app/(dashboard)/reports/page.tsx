"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Download,
  RefreshCw,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  usePortfolioSummaryQuery, 
  useOfficerPerformanceQuery, 
  useCollectionReportQuery, 
  useReconciliationQuery,
  useRegionalReportQuery,
  useExportReportMutation 
} from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [dateRange, setDateRange] = useState("this-month");
  
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioSummaryQuery();
  const { data: officerData, isLoading: officerLoading } = useOfficerPerformanceQuery();
  const { data: collectionData, isLoading: collectionLoading } = useCollectionReportQuery();
  const { data: reconciliationData, isLoading: reconciliationLoading } = useReconciliationQuery();
  const { data: regionalData, isLoading: regionalLoading } = useRegionalReportQuery();
  const exportMutation = useExportReportMutation();

  const portfolioByStatus = portfolio?.byStatus ? Object.entries(portfolio.byStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
  })) : [];

  const portfolioByProduct = portfolio?.byProduct ? Object.entries(portfolio.byProduct).map(([name, value]) => ({
    name,
    count: value as number,
    amount: (value as number) * 50000000,
  })) : [];

  const collectionByStatus = collectionData?.byStatus ? Object.entries(collectionData.byStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
  })) : [];

  const handleExport = async (format: string) => {
    try {
      await exportMutation.mutateAsync({
        reportType: activeTab,
        format,
        start_date: dateRange,
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
          <p className="text-sm text-muted-foreground">Business performance and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport('pdf')} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="portfolio" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Reconciliation</span>
          </TabsTrigger>
          <TabsTrigger value="regional" className="gap-1">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Regional</span>
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4 mt-6">
          {/* Portfolio Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{portfolio?.totalLoans?.toLocaleString("id-ID") || "0"}</div>
                <p className="text-xs text-muted-foreground mt-1">Applications</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                <ArrowDownToLine className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolio?.totalDisbursed)}</div>
                <p className="text-xs text-muted-foreground mt-1">Loan principal</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolio?.totalOutstanding)}</div>
                <p className="text-xs text-muted-foreground mt-1">Principal remaining</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <ArrowUpFromLine className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolio?.totalCollections)}</div>
                <p className="text-xs text-muted-foreground mt-1">Payments received</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>By Loan Status</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : portfolioByStatus.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={portfolioByStatus} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(value) => value.toLocaleString("id-ID")} className="text-xs" />
                        <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                        <Tooltip formatter={(value: number) => [value.toLocaleString("id-ID"), "Loans"]} />
                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>By Product Type</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioLoading ? (
                  <Skeleton className="h-[300px]" />
                ) : portfolioByProduct.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolioByProduct}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={5}
                          dataKey="count"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {portfolioByProduct.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [value.toLocaleString("id-ID"), "Applications"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4 mt-6">
          {/* Agent Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{officerData?.officers?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active officers</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(officerData?.officers?.reduce((sum: number, o: any) => sum + (o.disbursementsAmount || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">By all agents</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {officerData?.officers?.length 
                    ? (officerData.officers.reduce((sum: number, o: any) => sum + (o.successRate || 0), 0) / officerData.officers.length).toFixed(0)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average across agents</p>
              </CardContent>
            </Card>
          </div>

          {/* Agent Performance Table */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {officerLoading ? (
                <Skeleton className="h-64" />
              ) : officerData?.officers && officerData.officers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Agent</th>
                        <th className="px-4 py-3 text-right font-medium">Applications</th>
                        <th className="px-4 py-3 text-right font-medium">Approved</th>
                        <th className="px-4 py-3 text-right font-medium">Disbursed</th>
                        <th className="px-4 py-3 text-right font-medium">Collections</th>
                        <th className="px-4 py-3 text-right font-medium">Success Rate</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {officerData.officers.map((officer: any) => (
                        <tr key={officer.officerId} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{officer.officerName}</td>
                          <td className="px-4 py-3 text-right">{officer.applicationsProcessed?.toLocaleString("id-ID") || 0}</td>
                          <td className="px-4 py-3 text-right">{officer.applicationsApproved?.toLocaleString("id-ID") || 0}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(officer.disbursementsAmount)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(officer.collectionsCollected)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={officer.successRate >= 80 ? "text-green-600" : officer.successRate >= 60 ? "text-yellow-600" : "text-red-600"}>
                              {(officer.successRate || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className={officer.successRate >= 80 ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
                              {officer.successRate >= 80 ? "Top Performer" : "Average"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mr-2 opacity-50" />
                  <p>No agent performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-4 mt-6">
          {/* Reconciliation Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reconciliationData?.reduce((sum: number, d: any) => sum + (d.transactions || 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(reconciliationData?.reduce((sum: number, d: any) => sum + (d.expected || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total expected</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actual Amount</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(reconciliationData?.reduce((sum: number, d: any) => sum + (d.actual || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total received</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Discrepancy</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(reconciliationData?.reduce((sum: number, d: any) => sum + (d.diff || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Difference</p>
              </CardContent>
            </Card>
          </div>

          {/* Reconciliation Chart */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Daily Reconciliation Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {reconciliationLoading ? (
                <Skeleton className="h-[350px]" />
              ) : reconciliationData && reconciliationData.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reconciliationData}>
                      <defs>
                        <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} className="text-xs" />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
                      <Area 
                        type="monotone" 
                        dataKey="expected" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorExpected)"
                        name="Expected"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorActual)"
                        name="Actual"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No reconciliation data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Discrepancy Table */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {reconciliationLoading ? (
                <Skeleton className="h-64" />
              ) : reconciliationData && reconciliationData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-right font-medium">Expected</th>
                        <th className="px-4 py-3 text-right font-medium">Actual</th>
                        <th className="px-4 py-3 text-right font-medium">Difference</th>
                        <th className="px-4 py-3 text-center font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliationData.slice(0, 10).map((item: any, index: number) => (
                        <tr key={index} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3">{item.date}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.expected)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.actual)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={(item.diff || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                              {(item.diff || 0) >= 0 ? "+" : ""}{formatCurrency(item.diff)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className={(item.status || '') === 'matched' ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}>
                              {item.status || 'review'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional" className="space-y-4 mt-6">
          {/* Regional Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{regionalData?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active regions</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disbursed</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(regionalData?.reduce((sum: number, r: any) => sum + (r.disbursed || 0), 0) || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all regions</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {regionalData?.length 
                    ? regionalData.reduce((best: any, r: any) => (r.rate || 0) > (best.rate || 0) ? r : best, regionalData[0])?.regionName || 'N/A'
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {regionalData?.length 
                    ? `${(regionalData.reduce((best: any, r: any) => (r.rate || 0) > (best.rate || 0) ? r : best, regionalData[0])?.rate || 0).toFixed(0)}% collection rate`
                    : '-'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Collection</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {regionalData?.length 
                    ? (regionalData.reduce((sum: number, r: any) => sum + (r.rate || 0), 0) / regionalData.length).toFixed(0)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all regions</p>
              </CardContent>
            </Card>
          </div>

          {/* Regional Table */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {regionalLoading ? (
                <Skeleton className="h-64" />
              ) : regionalData && regionalData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Region</th>
                        <th className="px-4 py-3 text-right font-medium">Applications</th>
                        <th className="px-4 py-3 text-right font-medium">Disbursed</th>
                        <th className="px-4 py-3 text-right font-medium">Collected</th>
                        <th className="px-4 py-3 text-right font-medium">Rate</th>
                        <th className="px-4 py-3 text-center font-medium">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionalData.map((region: any) => (
                        <tr key={region.regionId} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{region.regionName}</td>
                          <td className="px-4 py-3 text-right">{region.applications?.toLocaleString("id-ID") || 0}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(region.disbursed)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(region.collected)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={(region.rate || 0) >= 90 ? "text-green-600" : (region.rate || 0) >= 80 ? "text-blue-600" : "text-yellow-600"}>
                              {(region.rate || 0).toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="w-full bg-muted rounded-full h-2 max-w-[100px] mx-auto">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(region.rate || 0, 100)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  No regional data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regional Chart */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Regional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {regionalLoading ? (
                <Skeleton className="h-[350px]" />
              ) : regionalData && regionalData.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="regionName" className="text-xs" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000000).toFixed(1)}B`} className="text-xs" />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
                      <Bar dataKey="disbursed" fill="#3b82f6" name="Disbursed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
