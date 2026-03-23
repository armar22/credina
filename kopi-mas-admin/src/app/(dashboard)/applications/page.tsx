"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, FileText, MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoanApplicationsQuery, useDeleteLoanApplicationMutation } from "@/hooks/use-applications";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  submitted: "bg-yellow-500",
  under_review: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  disbursed: "bg-blue-500",
};

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  
  const { data: response, isLoading, isFetching } = useLoanApplicationsQuery({
    page,
    limit,
    searchTerm,
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
  });
  
  const applications = response?.data || [];
  const meta = response?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;
  
  const deleteMutation = useDeleteLoanApplicationMutation();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeleteAppId(null);
  };

  const filteredApplications = applications?.filter(
    (app: any) => statusFilter === "all" || app.applicationStatus === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Loan Applications</h1>
          <p className="text-sm text-muted-foreground">Manage and review loan applications from members.</p>
        </div>
        <Link href="/applications/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Application
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member or product..."
                className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
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
          ) : filteredApplications?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No applications found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "No loan applications have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-[150px]">Member</TableHead>
                    <TableHead className="hidden md:table-cell">Product</TableHead>
                    <TableHead className="hidden lg:table-cell">Amount</TableHead>
                    <TableHead className="hidden lg:table-cell">Tenure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications?.map((app: any) => (
                    <TableRow key={app.id} className="group transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{app.member?.name || "N/A"}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{app.loanProduct?.productName || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{app.loanProduct?.productName || "N/A"}</TableCell>
                      <TableCell className="hidden lg:table-cell font-medium">{formatCurrency(app.loanAmount)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{app.loanTenureMonths} months</TableCell>
                      <TableCell>
                        <Badge className={statusColors[app.applicationStatus] || "bg-gray-500"}>{app.applicationStatus}</Badge>
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
                            <Link href={`/applications/${app.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/applications/${app.id}/edit`}>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setDeleteAppId(app.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 pb-4">
            <Button
              variant="outline"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Page {meta?.page ?? page} of {totalPages} ({meta?.total ?? 0} total)
            </div>

            <Button
              variant="outline"
              disabled={page === totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAppId} onOpenChange={(open) => !open && setDeleteAppId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The loan application will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteAppId && handleDelete(deleteAppId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
