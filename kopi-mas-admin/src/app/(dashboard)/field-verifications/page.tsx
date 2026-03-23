"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash, 
  MoreHorizontal, 
  Shield, 
  ClipboardCheck,
  Eye,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw
} from "lucide-react";
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
  TableRow,
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
import { 
  useFieldVerificationsQuery, 
  useDeleteVerificationMutation,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useVerificationStatsQuery
} from "@/hooks/use-field-verifications";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  passed: "bg-green-500",
  failed: "bg-red-500",
  verified: "bg-blue-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  passed: "Passed",
  failed: "Failed",
  verified: "Verified",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FieldVerificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteVerificationId, setDeleteVerificationId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useFieldVerificationsQuery({
    page,
    limit: 10,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: statsData } = useVerificationStatsQuery();
  const deleteMutation = useDeleteVerificationMutation();
  const approveMutation = useApproveVerificationMutation();
  const rejectMutation = useRejectVerificationMutation();

  const verifications = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const stats = statsData || { total: 0, pending: 0, passed: 0, failed: 0 };

  const filteredVerifications = searchTerm
    ? verifications.filter((v: any) =>
        v.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.officerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.officerId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : verifications;

  const handleDelete = async () => {
    if (!deleteVerificationId) return;
    try {
      await deleteMutation.mutateAsync(deleteVerificationId);
      toast.success("Verification deleted successfully");
      setDeleteVerificationId(null);
    } catch (error) {
      toast.error("Failed to delete verification");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Verification approved");
    } catch (error) {
      toast.error("Failed to approve verification");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success("Verification rejected");
    } catch (error) {
      toast.error("Failed to reject verification");
    }
  };

  const statCards = [
    { 
      title: "Total Verifications", 
      icon: ClipboardCheck, 
      value: stats.total || meta?.total || 0, 
      color: "text-blue-600"
    },
    { 
      title: "Pending", 
      icon: Clock, 
      value: stats.pending, 
      color: "text-yellow-600"
    },
    { 
      title: "Passed", 
      icon: CheckCircle2, 
      value: stats.passed, 
      color: "text-green-600"
    },
    { 
      title: "Failed", 
      icon: XCircle, 
      value: stats.failed, 
      color: "text-red-600"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Field Verifications</h1>
          <p className="text-sm text-muted-foreground">Manage field verification records and checklists.</p>
        </div>
        <Link href="/field-verifications/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Verification
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)
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
                placeholder="Search by application ID or officer..."
                className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
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
          ) : filteredVerifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Shield className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No verifications found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Add your first verification to get started."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/field-verifications/create">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Verification
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="min-w-[120px]">Application</TableHead>
                      <TableHead className="hidden md:table-cell">Officer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Location</TableHead>
                      <TableHead className="hidden lg:table-cell">Address</TableHead>
                      <TableHead className="hidden lg:table-cell">Checklist</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVerifications.map((verification: any) => (
                      <TableRow key={verification.verificationId} className="group transition-colors">
                        <TableCell>
                          <span className="font-mono text-xs">
                            {verification.applicationId?.slice(0, 8)}...
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {verification.officerName || verification.officerId || "-"}
                        </TableCell>
                        <TableCell>
                          {verification.verificationDate 
                            ? formatDate(verification.verificationDate)
                            : "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {Number(verification.gpsLatitude).toFixed(2)}, {Number(verification.gpsLongitude).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {verification.addressVerified ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {verification.checklistCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[verification.verificationStatus] || "bg-gray-500"}>
                            {statusLabels[verification.verificationStatus] || verification.verificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Link href={`/field-verifications/${verification.verificationId}`}>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                              </Link>
                              
                              {verification.verificationStatus === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                    onClick={() => handleApprove(verification.verificationId)}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => handleReject(verification.verificationId)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => setDeleteVerificationId(verification.verificationId)}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <AlertDialog open={!!deleteVerificationId} onOpenChange={(open) => !open && setDeleteVerificationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Verification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the verification record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}