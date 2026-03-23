"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Loader2,
  Eye,
  MoreHorizontal,
  Clock,
  FileText,
  User,
  CreditCard,
  Trash2
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; 
import { Skeleton } from "@/components/ui/skeleton";
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
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLoanApplicationsQuery, useApproveApplicationMutation, useRejectApplicationMutation, useDeleteLoanApplicationMutation } from "@/hooks/use-applications";
import { toast } from "sonner";

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
  submitted: "bg-yellow-500",
  under_review: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  disbursed: "bg-purple-500",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
};

export default function ApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("submitted,under_review");
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const userRole = user?.role;
  const isSystemAdmin = userRole === "system_admin";
  const isAdmin = userRole === "admin" || userRole === "system_admin";

  const { data, isLoading, isFetching } = useLoanApplicationsQuery({ 
    page,
    limit: 10, 
    searchTerm, 
    statusFilter 
  });
  
  const applications = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const approveMutation = useApproveApplicationMutation();
  const rejectMutation = useRejectApplicationMutation();
  const deleteMutation = useDeleteLoanApplicationMutation();

  const filteredApplications = searchTerm
    ? applications.filter((app: any) =>
        app.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.member?.nik?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : applications;

  const stats = {
    submitted: applications.filter((a: any) => a.applicationStatus === "submitted").length,
    underReview: applications.filter((a: any) => a.applicationStatus === "under_review").length,
    total: meta?.total || 0,
  };

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Application approved successfully");
    } catch (error) {
      toast.error("Failed to approve application");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success("Application rejected");
    } catch (error) {
      toast.error("Failed to reject application");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteApplicationId) return;
    try {
      await deleteMutation.mutateAsync(deleteApplicationId);
      toast.success("Application deleted successfully");
      setDeleteApplicationId(null);
    } catch (error) {
      toast.error("Failed to delete application");
    }
  };

  const statCards = [
    { 
      title: "Total Pending", 
      icon: Clock, 
      value: stats.total, 
      color: "text-yellow-600"
    },
    { 
      title: "Submitted", 
      icon: FileText, 
      value: stats.submitted, 
      color: "text-orange-600"
    },
    { 
      title: "Under Review", 
      icon: CreditCard, 
      value: stats.underReview, 
      color: "text-blue-600"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Approvals</h1>
          <p className="text-sm text-muted-foreground">Review and approve loan applications.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name or NIK..."
                className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted,under_review">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-lg font-medium">No applications found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "All applications have been reviewed."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="min-w-[150px]">Member</TableHead>
                      <TableHead className="hidden md:table-cell">Product</TableHead>
                      <TableHead className="hidden lg:table-cell">Amount</TableHead>
                      <TableHead className="hidden lg:table-cell">Tenure</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app: any) => (
                      <TableRow key={app.id} className="group transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{app.member?.name || "Member"}</span>
                            <span className="text-xs text-muted-foreground font-mono">{app.member?.nik?.slice(0, 8) || ""}...</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {app.loanProduct?.productName || app.loanProductType || "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-medium">
                          {formatCurrency(app.loanAmount || 0)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {app.loanTenureMonths} months
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {app.submittedAt ? formatDate(app.submittedAt) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[app.applicationStatus] || "bg-gray-500"}>
                            {statusLabels[app.applicationStatus] || app.applicationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={actionLoadingId === app.id}
                              onClick={() => handleApprove(app.id)}
                            >
                              {actionLoadingId === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={actionLoadingId === app.id}
                              onClick={() => handleReject(app.id)}
                            >
                              {actionLoadingId === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              Reject
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Link href={`/applications/${app.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                </Link>
                                {isSystemAdmin && app.applicationStatus === "rejected" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => setDeleteApplicationId(app.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {meta?.page ?? page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1 || isFetching}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages || isFetching}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteApplicationId} onOpenChange={(open) => !open && setDeleteApplicationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the application. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}