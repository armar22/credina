"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CreditCard, 
  Building,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useLoanApplicationQuery, useApproveApplicationMutation, useRejectApplicationMutation, useDeleteLoanApplicationMutation } from "@/hooks/use-applications";
import { useMembersQuery } from "@/hooks/use-members";
import { useProductsQuery } from "@/hooks/use-products";
import { useBranchesQuery } from "@/hooks/use-branches";
import { toast } from "sonner";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  submitted: "bg-yellow-500",
  under_review: "bg-blue-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  disbursed: "bg-purple-500",
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: application, isLoading, isError } = useLoanApplicationQuery(id);
  const { data: membersData } = useMembersQuery({ page: 1, limit: 100 });
  const { data: productsData } = useProductsQuery({ page: 1, limit: 100 });
  const { data: branchesData } = useBranchesQuery({ page: 1, limit: 100 });

  const approveMutation = useApproveApplicationMutation();
  const rejectMutation = useRejectApplicationMutation();
  const deleteMutation = useDeleteLoanApplicationMutation();

  const handleApprove = () => {
    approveMutation.mutate({ id: approveId! });
    setApproveId(null);
  };

  const handleReject = () => {
    rejectMutation.mutate({ id: rejectId!, reason: rejectionReason });
    setRejectId(null);
    setRejectionReason("");
  };

  const handleDelete = () => {
    deleteMutation.mutate(deleteId!);
    setDeleteId(null);
    router.push("/applications");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold">Application Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested application could not be found.</p>
        <Link href="/applications">
          <Button className="mt-4">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applications">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Application Details</h1>
            <p className="text-sm text-muted-foreground">ID: {application.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[application.applicationStatus] || "bg-gray-500"}>
            {application.applicationStatus}
          </Badge>
          {application.applicationStatus === "pending" && (
            <>
              <Button 
                variant="outline" 
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => setApproveId(application.id)}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button 
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => setRejectId(application.id)}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}
          <Link href={`/applications/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => setDeleteId(application.id)}
          >
            <FileText className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Member Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{application.member?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIK</p>
                  <p className="font-medium">{application.member?.nik || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{application.member?.phone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product</p>
                  <p className="font-medium">{application.loanProduct?.productName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Type</p>
                  <p className="font-medium">{application.loanProduct?.productType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="font-medium">{formatCurrency(application.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tenure</p>
                  <p className="font-medium">{application.loanTenureMonths} months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-medium">{application.interestRate}% {application.interestRateType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{application.purposeDescription || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Income Source</p>
                  <p className="font-medium">{application.incomeSource || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="font-medium">{formatCurrency(application.monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Debt to Income Ratio</p>
                  <p className="font-medium">{application.debtToIncomeRatio ? `${application.debtToIncomeRatio}%` : "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="text-sm font-medium">{formatDate(application.submittedAt)}</span>
              </div>
              {application.reviewedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reviewed</span>
                  <span className="text-sm font-medium">{formatDate(application.reviewedAt)}</span>
                </div>
              )}
              {application.approvedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Approved</span>
                  <span className="text-sm font-medium">{formatDate(application.approvedAt)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm font-medium">{formatDate(application.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Branch & Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{application.branch?.branchName || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agent</p>
                <p className="font-medium">{application.agentName || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {application.aiRecommendation && (
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.aiRecommendation}</p>
                {application.creditScore && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Credit Score</p>
                    <p className="text-2xl font-bold">{application.creditScore}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {application.rejectionReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={!!approveId} onOpenChange={(open) => !open && setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Application?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the loan application. The applicant will be notified and the loan process will continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              className="w-full p-3 border rounded-md"
              rows={3}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
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
              onClick={handleDelete}
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