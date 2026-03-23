"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CreditCard, 
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  IdCard,
  Image,
  ScanLine,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useMemberQuery, useProcessKtpOcrMutation, useVerifyKtpMutation, useUpdateMemberMutation } from "@/hooks/use-members";
import { MemberForm } from "@/components/features/members/MemberForm";
import { usePaymentsByMemberQuery, useCreatePaymentMutation, useUpdatePaymentStatusMutation } from "@/hooks/use-payments";
import { useLoanApplicationQuery, useCreateLoanApplicationMutation, useUpdateLoanApplicationMutation, useApproveApplicationMutation, useRejectApplicationMutation } from "@/hooks/use-applications";
import { useProductsQuery } from "@/hooks/use-products";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
    month: "long",
    year: "numeric",
  });
}

const paymentSchema = z.object({
  paymentAmount: z.number().min(1000, "Minimum payment is Rp 1,000"),
  paymentMethod: z.enum(["cash", "transfer", "virtual_account", "e_wallet", "other"]),
  transactionReference: z.string().optional(),
  senderAccountNumber: z.string().optional(),
  senderBankName: z.string().optional(),
  senderName: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const applicationSchema = z.object({
  memberId: z.string().optional(),
  loanProductType: z.enum(["personal", "business", "emergency"]),
  loanAmount: z.number().min(100000, "Minimum loan is Rp 100,000"),
  loanTenureMonths: z.number().min(1, "Tenure is required"),
  interestRate: z.number().min(0, "Interest rate must be positive"),
  interestRateType: z.enum(["fixed", "reducing"]),
  purposeDescription: z.string().optional(),
  incomeSource: z.enum(["employed", "self_employed", "business"]),
  monthlyIncome: z.number().min(0, "Monthly income is required"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

function PaymentForm({ memberId, applicationId, initialData, onSuccess }: { memberId: string; applicationId?: string; initialData?: any; onSuccess: () => void }) {
  const createMutation = useCreatePaymentMutation();
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData || {
      paymentAmount: initialData?.paymentAmount || 0,
      paymentMethod: "cash",
      transactionReference: "",
      senderAccountNumber: "",
      senderBankName: "",
      senderName: "",
      notes: "",
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await createMutation.mutateAsync({
        memberId,
        applicationId,
        ...data,
      });
      toast.success("Payment created successfully");
      queryClient.invalidateQueries({ queryKey: ["payments", "member", memberId] });
      onSuccess();
    } catch (error) {
      toast.error("Failed to create payment");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="paymentAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Rp)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="virtual_account">Virtual Account</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="transactionReference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Reference</FormLabel>
              <FormControl>
                <Input placeholder="Optional reference number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sender Name</FormLabel>
              <FormControl>
                <Input placeholder="Optional sender name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input placeholder="Optional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Payment"}
        </Button>
      </form>
    </Form>
  );
}

function ApplicationForm({ memberId, initialData, onSuccess }: { memberId: string; initialData?: any; onSuccess: () => void }) {
  const createMutation = useCreateLoanApplicationMutation();
  const updateMutation = useUpdateLoanApplicationMutation();
  const queryClient = useQueryClient();
  const { data: productsResponse } = useProductsQuery();
  const products = productsResponse || [];

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialData || {
      loanProductType: "personal",
      loanAmount: 1000000,
      loanTenureMonths: 12,
      interestRate: 12,
      interestRateType: "fixed",
      purposeDescription: "",
      incomeSource: "employed",
      monthlyIncome: 0,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, data });
        toast.success("Application updated successfully");
      } else {
        await createMutation.mutateAsync({
          ...data,
          memberId,
        } as any);
        toast.success("Application created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["applications", memberId] });
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${initialData?.id ? "update" : "create"} application`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="loanProductType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="personal">Personal Loan</SelectItem>
                  <SelectItem value="business">Business Loan</SelectItem>
                  <SelectItem value="emergency">Emergency Loan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="loanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Amount (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loanTenureMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenure (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="interestRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interestRateType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="reducing">Reducing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="incomeSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Income Source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self_employed">Self Employed</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthlyIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Income (Rp)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="purposeDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose Description</FormLabel>
              <FormControl>
                <Input placeholder="Describe the purpose" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : initialData?.id ? "Update Application" : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}

function ApplicationsList({ memberId }: { memberId: string }) {
  const queryClient = useQueryClient();
  const isValidUuid = memberId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editApplication, setEditApplication] = useState<any>(null);
  const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
  const [viewApplication, setViewApplication] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["applications", memberId],
    queryFn: async () => {
      if (!isValidUuid) return { data: [] };
      const response: any = await api.get("/loan-applications", { 
        params: { member_id: memberId } 
      });
      return response.data || response;
    },
    enabled: !!memberId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/loan-applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", memberId] });
      toast.success("Application deleted");
    },
    onError: () => {
      toast.error("Failed to delete application");
    },
  });

  const approveMutation = useApproveApplicationMutation();
  const rejectMutation = useRejectApplicationMutation();

  const applications = data?.data || data || [];

  const handleDelete = async () => {
    if (!deleteApplicationId) return;
    await deleteMutation.mutateAsync(deleteApplicationId);
    setDeleteApplicationId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create Loan Application</DialogTitle>
            <div className="mt-4">
              <ApplicationForm memberId={memberId} onSuccess={() => setShowCreateDialog(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No loan applications</p>
          <p className="text-sm text-muted-foreground">This member hasn't applied for any loans yet.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tenure</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app: any, index: number) => (
                <TableRow key={app.id || `app-${index}`}>
                  <TableCell className="font-medium">{app.loanProduct?.productName || app.loanProductType || "-"}</TableCell>
                  <TableCell>{formatCurrency(app.loanAmount)}</TableCell>
                  <TableCell>{app.loanTenureMonths} months</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        app.applicationStatus === "approved" || app.applicationStatus === "disbursed" ? "default" :
                        app.applicationStatus === "rejected" ? "destructive" :
                        "secondary"
                      }
                    >
                      {app.applicationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{app.createdAt ? formatDate(app.createdAt) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setViewApplication(app)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditApplication(app)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {app.applicationStatus === "under_review" && (
                          <>
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => approveMutation.mutate({ id: app.id })}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => rejectMutation.mutate({ id: app.id, reason: "Rejected by admin" })}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setDeleteApplicationId(app.id)}
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

      {/* Edit Dialog */}
      <Dialog open={!!editApplication} onOpenChange={(open) => !open && setEditApplication(null)}>
        <DialogContent>
          <DialogTitle>Edit Application</DialogTitle>
          <div className="mt-4">
            <ApplicationForm 
              memberId={memberId} 
              initialData={editApplication} 
              onSuccess={() => setEditApplication(null)} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewApplication} onOpenChange={(open) => !open && setViewApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Application Details</DialogTitle>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{viewApplication?.loanProduct?.productName || viewApplication?.loanProductType || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={viewApplication?.applicationStatus === "approved" ? "default" : "secondary"}>
                  {viewApplication?.applicationStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <p className="font-medium">{formatCurrency(viewApplication?.loanAmount || 0)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenure</p>
                <p className="font-medium">{viewApplication?.loanTenureMonths} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <p className="font-medium">{viewApplication?.interestRate}% ({viewApplication?.interestRateType})</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="font-medium">{formatCurrency(viewApplication?.monthlyIncome || 0)}</p>
              </div>
              {viewApplication?.purposeDescription && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Purpose</p>
                  <p className="font-medium">{viewApplication.purposeDescription}</p>
                </div>
              )}
              {viewApplication?.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Rejection Reason</p>
                  <p className="font-medium text-red-600">{viewApplication.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  
  // Check if memberId is a valid UUID (not "create" or other string)
  const isValidUuid = memberId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(memberId);
  
  // Redirect if not a valid UUID (e.g., when navigating to /members/create)
  if (!isValidUuid) {
    router.replace("/members");
    return null;
  }
  
  const { data: member, isLoading: isLoadingMember, refetch } = useMemberQuery(memberId);
  const { data: paymentsData, isLoading: isLoadingPayments } = usePaymentsByMemberQuery(memberId);
  const ocrMutation = useProcessKtpOcrMutation();
  const verifyMutation = useVerifyKtpMutation();
  const updatePaymentStatusMutation = useUpdatePaymentStatusMutation();

  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [showKtpDialog, setShowKtpDialog] = useState(false);
  const [showOcrDialog, setShowOcrDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const updateMemberMutation = useUpdateMemberMutation();

  const handleProcessOcr = async () => {
    if (!member?.ktpImageUrl) {
      toast.error("No KTP image available");
      return;
    }
    
    setIsProcessingOcr(true);
    try {
      await ocrMutation.mutateAsync({
        memberId,
        ktpImageUrl: member.ktpImageUrl,
        submittedNik: member.nik,
        submittedName: member.name,
        submittedDob: member.dob,
        submittedGender: member.gender,
      });
      refetch();
      toast.success("OCR processed successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to process OCR");
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const handleVerify = async (status: 'match' | 'manual_verification' | 'low_result', notes?: string) => {
    try {
      await verifyMutation.mutateAsync({ memberId, status, notes });
      refetch();
      toast.success("Verification updated");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update verification");
    }
  };

  const payments = paymentsData || [];
  const isOverdue = (payment: any) => {
    return payment.paymentStatus === "failed" || 
           (payment.paidAt === null && new Date() > new Date(payment.createdAt));
  };

  if (isLoadingMember) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Member not found</h2>
        <p className="text-muted-foreground mb-4">The member you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
            <p className="text-sm text-muted-foreground">Member Details</p>
          </div>
        </div>
        <Badge variant={member.status === "active" ? "default" : "secondary"} className="self-start sm:self-auto">
          {member.status || "active"}
        </Badge>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="info" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Info</span>
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Applications</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Overdue</span>
          </TabsTrigger>
        </TabsList>

        {/* Member Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <IdCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">NIK</p>
                      <p className="font-medium">{member.nik}</p>
                    </div>
                  </div>
                  {member.ktpImageUrl && (
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-lg">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">KTP</p>
                        <Dialog open={showKtpDialog} onOpenChange={setShowKtpDialog}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="h-auto p-0 text-blue-600">
                              View KTP
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-auto p-0">
                            <div className="flex flex-col items-center p-4">
                              <DialogTitle>
                              KTP
                              </DialogTitle>
                              <img 
                                src={member.ktpImageUrl} 
                                alt="KTP" 
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                              />
                              {member?.ktpImageUrl && !member?.ocrNik && (
                                <Button
                                  className="mt-4"
                                  onClick={handleProcessOcr}
                                  disabled={isProcessingOcr}
                                >
                                  {isProcessingOcr ? "Processing..." : "Process OCR"}
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                  {member?.ocrNik && (
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-lg">
                        <ScanLine className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">KTP Verification</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              member?.ktpVerificationStatus === "match" ? "default" :
                              member?.ktpVerificationStatus === "low_result" ? "destructive" :
                              member?.ktpVerificationStatus === "manual_verification" ? "outline" :
                              "secondary"
                            }
                            className={
                              member?.ktpVerificationStatus === "match" ? "bg-green-500" :
                              member?.ktpVerificationStatus === "manual_verification" ? "border-orange-500 text-orange-600" : ""
                            }
                          >
                            {member?.ktpVerificationStatus === "match" ? "Match" :
                             member?.ktpVerificationStatus === "low_result" ? "Low Result" :
                             member?.ktpVerificationStatus === "manual_verification" ? "Manual Verification" :
                             "Pending"}
                          </Badge>
                          {member?.ktpVerificationStatus !== "match" && (
                            <Button variant="link" className="h-auto p-0 text-blue-600 text-xs" onClick={() => setShowOcrDialog(true)}>
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{member.phone}</p>
                    </div>
                  </div>
                  {member.email && (
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{member.email}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{member.dob ? formatDate(member.dob) : "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{member.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{member.city}, {member.province} {member.postalCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Loan Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationsList memberId={memberId} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* OCR Dialog */}
        <Dialog open={showOcrDialog} onOpenChange={setShowOcrDialog}>
          <DialogContent className="max-w-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">KTP Verification Details</h3>
                <Badge
                  variant={
                    member?.ktpVerificationStatus === "match" ? "default" :
                    member?.ktpVerificationStatus === "low_result" ? "destructive" :
                    member?.ktpVerificationStatus === "manual_verification" ? "outline" :
                    "secondary"
                  }
                  className={
                    member?.ktpVerificationStatus === "match" ? "bg-green-500" :
                    member?.ktpVerificationStatus === "manual_verification" ? "border-orange-500 text-orange-600" : ""
                  }
                >
                  {member?.ktpVerificationStatus === "match" ? "Match" :
                   member?.ktpVerificationStatus === "low_result" ? "Low Result" :
                   member?.ktpVerificationStatus === "manual_verification" ? "Manual Verification" :
                   "Pending"}
                </Badge>
              </div>

              {member?.ocrNik && member?.ktpVerificationStatus !== "match" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => { handleVerify('match'); setShowOcrDialog(false); }}
                  >
                    Verify as Match
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-500 text-orange-600"
                    onClick={() => { handleVerify('manual_verification'); setShowOcrDialog(false); }}
                  >
                    Manual Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { handleVerify('low_result'); setShowOcrDialog(false); }}
                  >
                    Low Result
                  </Button>
                </div>
              )}

              {member?.ocrNik && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Form Data</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NIK:</span>
                        <span className="font-medium">{member.nik}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DOB:</span>
                        <span className="font-medium">{member.dob ? formatDate(member.dob) : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium capitalize">{member.gender}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">OCR Data</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NIK:</span>
                        <span className="font-medium">{member.ocrNik}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{member.ocrName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DOB:</span>
                        <span className="font-medium">{member.ocrDob ? formatDate(member.ocrDob) : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="font-medium capitalize">{member.ocrGender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-medium">{member.ocrConfidence ? `${member.ocrConfidence}%` : '-'}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Member Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>Edit Member</DialogTitle>
              <div className="mt-4">
                <MemberForm
                  memberId={memberId}
                  initialData={{
                    name: member.name,
                    nik: member.nik,
                    dob: member.dob || "",
                    gender: member.gender || "male",
                    phone: member.phone,
                    email: member.email || "",
                    address: member.address,
                    city: member.city,
                    province: member.province || "",
                    postalCode: member.postalCode || "",
                    ktpImageUrl: member.ktpImageUrl || "",
                    photoUrl: member.photoUrl || "",
                  }}
                  onSuccess={() => {
                    setShowEditDialog(false);
                    refetch();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment History</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Create Payment</DialogTitle>
                  <div className="mt-4">
                    <PaymentForm memberId={memberId} onSuccess={() => {}} />
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingPayments ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No payment history</p>
                  <p className="text-sm text-muted-foreground">This member hasn't made any payments yet.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Receipt No.</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment: any, index: number) => (
                        <TableRow key={payment.id || `payment-${index}`}>
                          <TableCell className="font-mono text-xs">#{payment.id?.slice(0, 8)}</TableCell>
                          <TableCell>{payment.paidAt ? formatDate(payment.paidAt) : "-"}</TableCell>
                          <TableCell>{formatCurrency(payment.paymentAmount)}</TableCell>
                          <TableCell className="capitalize">{payment.paymentMethod?.replace("_", " ") || "-"}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                payment.paymentStatus === "completed" ? "default" : 
                                payment.paymentStatus === "failed" ? "destructive" : 
                                "secondary"
                              }
                            >
                              {payment.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {payment.paymentStatus !== "completed" && (
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={async () => {
                                      await updatePaymentStatusMutation.mutateAsync({ id: payment.id, paymentStatus: "completed" });
                                      toast.success("Payment marked as completed");
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                {payment.paymentStatus !== "failed" && payment.paymentStatus !== "completed" && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={async () => {
                                      await updatePaymentStatusMutation.mutateAsync({ id: payment.id, paymentStatus: "failed" });
                                      toast.success("Payment marked as failed");
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" /> Mark as Failed
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
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
          </Card>
        </TabsContent>

        {/* Overdue Tab */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPayments ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                (() => {
                  const overduePayments = payments.filter(isOverdue);
                  return overduePayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-green-100 p-4 rounded-full mb-4">
                        <AlertTriangle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-lg font-medium">No overdue payments</p>
                      <p className="text-sm text-muted-foreground">This member is up to date with all payments.</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>Receipt No.</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overduePayments.map((payment: any, index: number) => {
                            const daysOverdue = Math.floor(
                              (new Date().getTime() - new Date(payment.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                            );
                            return (
                              <TableRow key={payment.id || `overdue-${index}`}>
                                <TableCell className="font-mono text-xs">#{payment.id?.slice(0, 8)}</TableCell>
                                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                                <TableCell>{formatCurrency(payment.paymentAmount)}</TableCell>
                                <TableCell>
                                  <Badge variant="destructive">{daysOverdue} days</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="destructive">{payment.paymentStatus}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={async () => {
                                      await updatePaymentStatusMutation.mutateAsync({ id: payment.id, paymentStatus: "completed" });
                                      toast.success("Payment marked as completed");
                                    }}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark as Paid
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
