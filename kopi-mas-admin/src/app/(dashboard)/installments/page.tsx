"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  Calendar,
  Percent
} from "lucide-react";
import { useInstallmentsQuery, useInstallmentStatsQuery, useRecordPaymentMutation } from "@/hooks/use-installments";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  partial: "bg-blue-500",
  waived: "bg-purple-500",
};

export default function InstallmentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useInstallmentsQuery({ status: statusFilter, page, limit: 20 });
  const { data: stats, isLoading: statsLoading } = useInstallmentStatsQuery();
  const recordPaymentMutation = useRecordPaymentMutation();

  const installments = response?.data || [];
  const meta = response?.meta;
  const total = meta?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleRecordPayment = async (installmentId: string, totalAmount: number, paidAmount: number) => {
    const amountDue = totalAmount - paidAmount;
    try {
      await recordPaymentMutation.mutateAsync({ 
        installmentId, 
        paidAmount: amountDue 
      });
      toast.success("Payment recorded successfully");
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const statCards = [
    { 
      title: "Total Due", 
      icon: DollarSign, 
      value: stats?.totalDueAmount || 0, 
      color: "text-blue-600",
      format: true
    },
    { 
      title: "Total Paid", 
      icon: CheckCircle2, 
      value: stats?.totalPaidAmount || 0, 
      color: "text-green-600",
      format: true
    },
    { 
      title: "Pending", 
      icon: Clock, 
      value: stats?.pendingCount || 0, 
      color: "text-yellow-600",
      format: false
    },
    { 
      title: "Overdue", 
      icon: AlertTriangle, 
      value: stats?.overdueCount || 0, 
      color: "text-red-600",
      format: false
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Installments</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.format 
                    ? `Rp ${stat.value.toLocaleString("id-ID")}`
                    : stat.value.toLocaleString("id-ID")
                  }
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : installments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4" />
              <p>No installments found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((inst: any) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">#{inst.installmentNumber}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {inst.application?.id?.slice(0, 8) || inst.applicationId?.slice(0, 8) || ""}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {inst.member?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString("id-ID") : "-"}
                      </TableCell>
                      <TableCell>Rp {Number(inst.principalAmount || 0).toLocaleString("id-ID")}</TableCell>
                      <TableCell>Rp {Number(inst.interestAmount || 0).toLocaleString("id-ID")}</TableCell>
                      <TableCell className="font-medium">Rp {Number(inst.totalAmount || 0).toLocaleString("id-ID")}</TableCell>
                      <TableCell>Rp {Number(inst.paidAmount || 0).toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[inst.installmentStatus] || "bg-gray-500"}>
                          {inst.installmentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {inst.installmentStatus !== "paid" && inst.installmentStatus !== "waived" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={recordPaymentMutation.isPending}
                            onClick={() => handleRecordPayment(inst.id, inst.totalAmount, inst.paidAmount)}
                          >
                            {recordPaymentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <DollarSign className="h-4 w-4 mr-1" />
                            )}
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
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
