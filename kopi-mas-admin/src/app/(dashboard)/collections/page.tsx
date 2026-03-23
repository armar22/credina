"use client";

import { useState } from "react"; 
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Search,
  Loader2,
  Wallet,
  MoreHorizontal,
  Receipt,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SelectValue 
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
import { useCollectionsQuery, useCollectionStatsQuery, useRecordPaymentMutation, useDeleteCollectionMutation } from "@/hooks/use-collections";
import { useAuthStore } from "@/store/auth-store";
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
  pending: "bg-yellow-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  partial: "bg-blue-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
  partial: "Partial",
};

export default function CollectionsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isSystemAdmin = user?.role === "system_admin";

  const { data: response, isLoading, isFetching } = useCollectionsQuery({ status: statusFilter, page, limit: 20 });
  const { data: stats, isLoading: statsLoading } = useCollectionStatsQuery();
  const recordPaymentMutation = useRecordPaymentMutation();
  const deleteMutation = useDeleteCollectionMutation();

  const collections = response?.data || [];
  const meta = response?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  const filteredCollections = searchTerm
    ? collections.filter((c: any) => 
        c.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.member?.nik?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : collections;

  const handleRecordPayment = async (collectionId: string, dueAmount: number) => {
    setActionLoadingId(collectionId);
    try {
      await recordPaymentMutation.mutateAsync({ 
        collectionId, 
        paidAmount: dueAmount 
      });
      toast.success("Payment recorded successfully");
    } catch (error) {
      toast.error("Failed to record payment");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteCollectionId) return;
    try {
      await deleteMutation.mutateAsync(deleteCollectionId);
      toast.success("Collection deleted successfully");
      setDeleteCollectionId(null);
    } catch (error) {
      toast.error("Failed to delete collection");
    }
  };

  const statCards = [
    { 
      title: "Total Collected", 
      icon: DollarSign, 
      value: stats?.collectedAmount || 0, 
      color: "text-green-600",
      format: true
    },
    { 
      title: "Pending", 
      icon: Clock, 
      value: stats?.totalPending || 0, 
      color: "text-yellow-600",
      format: false
    },
    { 
      title: "Overdue", 
      icon: AlertTriangle, 
      value: stats?.totalOverdue || 0, 
      color: "text-red-600",
      format: false
    },
    { 
      title: "Paid", 
      icon: CheckCircle2, 
      value: stats?.totalPaid || 0, 
      color: "text-blue-600",
      format: false
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Collections</h1>
          <p className="text-sm text-muted-foreground">Track and manage loan payment collections.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.format 
                    ? formatCurrency(stat.value)
                    : stat.value.toLocaleString("id-ID")
                  }
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
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
          ) : filteredCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No collections found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "No collections to display."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="min-w-[100px]">Installment</TableHead>
                      <TableHead className="hidden md:table-cell">Member</TableHead>
                      <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Due Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCollections.map((col: any) => (
                      <TableRow key={col.id} className="group transition-colors">
                        <TableCell className="font-medium">#{col.installmentNumber}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <span className="font-medium">{col.member?.name || "Member"}</span>
                            <span className="text-xs text-muted-foreground font-mono">{col.member?.nik?.slice(0, 8) || ""}...</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {col.dueDate ? formatDate(col.dueDate) : "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-medium">
                          {formatCurrency(col.dueAmount || 0)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatCurrency(col.paidAmount || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[col.collectionStatus] || "bg-gray-500"}>
                            {statusLabels[col.collectionStatus] || col.collectionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {col.collectionStatus !== "paid" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={actionLoadingId === col.id}
                                onClick={() => handleRecordPayment(col.id, col.dueAmount)}
                              >
                                {actionLoadingId === col.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <DollarSign className="h-4 w-4 mr-1" />
                                )}
                                Pay
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
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  {isSystemAdmin && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => setDeleteCollectionId(col.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Receipt className="mr-2 h-4 w-4" /> View Receipt
                                </DropdownMenuItem>
                                {isSystemAdmin && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => setDeleteCollectionId(col.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

      <AlertDialog open={!!deleteCollectionId} onOpenChange={(open) => !open && setDeleteCollectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the collection record. This action cannot be undone.
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