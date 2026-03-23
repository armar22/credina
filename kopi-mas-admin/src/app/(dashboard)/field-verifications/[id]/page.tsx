"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Shield,
  ClipboardCheck,
  FileText,
  User,
  Calendar,
  Save,
  Pencil,
  Trash2,
  ExternalLink,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { 
  useFieldVerificationQuery, 
  useUpdateVerificationMutation, 
  useDeleteVerificationMutation,
  useApproveVerificationMutation,
  useRejectVerificationMutation
} from "@/hooks/use-field-verifications";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const verificationSchema = z.object({
  notes: z.string().optional(),
  verificationStatus: z.enum(["pending", "passed", "failed", "verified"]),
  addressVerified: z.boolean().optional(),
  checklistCompleted: z.boolean().optional(),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
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

function ChecklistViewer({ checklistData }: { checklistData?: Record<string, any> }) {
  if (!checklistData || Object.keys(checklistData).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <ClipboardCheck className="h-12 w-12 mb-4" />
        <p>No checklist data available</p>
      </div>
    );
  }

  const checklistItems = Array.isArray(checklistData) ? checklistData : Object.entries(checklistData);

  return (
    <div className="space-y-3">
      {checklistItems.map((item: any, index: number) => (
        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {item.verified || item.value === true || item.value === "yes" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">{item.label || item.name || item.question || `Item ${index + 1}`}</span>
          </div>
          <Badge variant={item.verified || item.value === true || item.value === "yes" ? "default" : "destructive"}>
            {item.value === true || item.value === "yes" || item.verified ? "Verified" : "Not Verified"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export default function FieldVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const verificationId = params.id as string;
  
  const isValidUuid = verificationId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(verificationId);
  
  if (!isValidUuid) {
    router.replace("/field-verifications");
    return null;
  }
  
  const { data: verification, isLoading, refetch } = useFieldVerificationQuery(verificationId);
  const updateMutation = useUpdateVerificationMutation();
  const deleteMutation = useDeleteVerificationMutation();
  const approveMutation = useApproveVerificationMutation();
  const rejectMutation = useRejectVerificationMutation();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      notes: "",
      verificationStatus: "pending",
      addressVerified: false,
      checklistCompleted: false,
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    try {
      await updateMutation.mutateAsync({
        verificationId,
        data,
      });
      toast.success("Verification updated successfully");
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      toast.error("Failed to update verification");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(verificationId);
      toast.success("Verification deleted successfully");
      router.push("/field-verifications");
    } catch (error) {
      toast.error("Failed to delete verification");
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(verificationId);
      toast.success("Verification approved successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to approve verification");
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync(verificationId);
      toast.success("Verification rejected successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to reject verification");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!verification || !verification.verificationId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Verification not found</h2>
        <p className="text-muted-foreground mb-4">The verification you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Field Verification</h1>
            <p className="text-sm text-muted-foreground">Verification Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[verification.verificationStatus] || "bg-gray-500"}>
            {statusLabels[verification.verificationStatus] || verification.verificationStatus}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {verification.verificationStatus === "pending" && (
                <>
                  <DropdownMenuItem 
                    className="text-green-600"
                    onClick={handleApprove}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleReject}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="info" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Info</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Verification Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Application ID</p>
                    <p className="font-mono text-sm font-medium">{verification.applicationId?.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Officer</p>
                    <p className="font-medium">{verification.officerName || verification.officerId || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Date</p>
                    <p className="font-medium">{verification.verificationDate ? formatDate(verification.verificationDate) : "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="font-medium">{verification.createdAt ? formatDateTime(verification.createdAt) : "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {verification.addressVerified ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Address Verified</span>
                  </div>
                  <Badge variant={verification.addressVerified ? "default" : "destructive"}>
                    {verification.addressVerified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {verification.checklistCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Checklist Completed</span>
                  </div>
                  <Badge variant={verification.checklistCompleted ? "default" : "destructive"}>
                    {verification.checklistCompleted ? "Yes" : "No"}
                  </Badge>
                </div>
                {verification.signatureUrl && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <Image className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Signature</p>
                      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
                        <DialogTrigger asChild>
                          <Button variant="link" className="h-auto p-0 text-blue-600">
                            View Signature
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-auto p-0">
                          <div className="p-4">
                            <DialogTitle>Signature</DialogTitle>
                            <img 
                              src={verification.signatureUrl} 
                              alt="Signature" 
                              className="max-w-full max-h-[50vh] object-contain rounded-lg mt-4"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
                {verification.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">{verification.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Verification Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ChecklistViewer checklistData={verification.checklistData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle>GPS Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Latitude</p>
                  <p className="font-mono font-medium">{Number(verification.gpsLatitude).toFixed(6) || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longitude</p>
                  <p className="font-mono font-medium">{Number(verification.gpsLongitude).toFixed(6) || "-"}</p>
                </div>
              </div>
              {(verification.gpsLatitude && verification.gpsLongitude) && (
                <Button variant="outline" className="mt-4">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <a 
                    href={`https://www.google.com/maps?q=${verification.gpsLatitude},${verification.gpsLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit Verification</DialogTitle>
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="verificationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressVerified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Address Verified</FormLabel>
                      </div>
                      <FormControl>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "true")} 
                          defaultValue={String(field.value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="checklistCompleted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Checklist Completed</FormLabel>
                      </div>
                      <FormControl>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "true")} 
                          defaultValue={String(field.value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
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
                        <Textarea 
                          placeholder="Enter verification notes..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Verification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the verification. This action cannot be undone.
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