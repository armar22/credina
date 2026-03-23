"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  DollarSign, 
  Calendar,
  Receipt,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { usePaymentHistoryQuery, usePaymentStatsQuery } from "@/hooks/use-payments";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusColors: Record<string, string> = {
  completed: "bg-green-500",
  pending: "bg-yellow-500",
  failed: "bg-red-500",
  processing: "bg-blue-500",
};

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: response, isLoading } = usePaymentHistoryQuery({ page, limit: 10, searchTerm });
  const { data: stats, isLoading: statsLoading } = usePaymentStatsQuery();

  const payments = response?.data || [];
  const filteredPayments = searchTerm
    ? payments.filter((p: any) => 
        p.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.application?.id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : payments;
  const meta = response?.meta;
  const total = meta?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payments</h1>
          <p className="text-sm text-muted-foreground">Track and manage member loan payments.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : (
          <>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalCollected || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.todayCollected || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.monthCollected || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <Receipt className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalTransactions || 0}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member..."
                className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No payments found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search criteria." 
                  : "No payment history to display."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="min-w-[100px]">Receipt No.</TableHead>
                      <TableHead className="hidden md:table-cell">Member</TableHead>
                      <TableHead className="hidden lg:table-cell">Loan Amount</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead className="hidden md:table-cell">Paid Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment: any) => (
                      <TableRow key={payment.id} className="group transition-colors">
                        <TableCell className="font-mono text-xs">
                          {payment.id?.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <span className="font-medium">{payment.member?.name || "N/A"}</span>
                            <span className="text-xs text-muted-foreground">{payment.member?.nik?.slice(0, 8) || ""}...</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-medium">
                          {formatCurrency(payment.application?.loanAmount || 0)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.paymentAmount || 0)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {payment.paidAt ? formatDate(payment.paidAt) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[payment.paymentStatus] || "bg-gray-500"}>
                            {payment.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
