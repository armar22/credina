"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, MapPin, CheckSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateVerificationMutation, CreateVerificationData } from "@/hooks/use-field-verifications";
import { useLoanApplicationsQuery } from "@/hooks/use-applications";
import { api } from "@/lib/api";
import { toast } from "sonner";

const verificationFormSchema = z.object({
  applicationId: z.string().min(1, "Application is required"),
  verificationDate: z.string().optional(),
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
  addressVerified: z.boolean().optional(),
  checklistCompleted: z.boolean().optional(),
  notes: z.string().optional(),
  verificationStatus: z.enum(["pending", "passed", "failed"]).optional(),
});

type VerificationFormData = z.infer<typeof verificationFormSchema>;

const defaultChecklistItems = [
  { id: "residence_type", label: "Residence Type Verified", value: false },
  { id: "address_match", label: "Address Matches Documents", value: false },
  { id: "business_location", label: "Business Location Visited (if applicable)", value: false },
  { id: "neighbor_verification", label: "Neighbor Verification", value: false },
  { id: "living_condition", label: "Living Conditions Acceptable", value: false },
  { id: "documentation", label: "Documentation Complete", value: false },
];

export default function CreateVerificationPage() {
  const router = useRouter();
  const createMutation = useCreateVerificationMutation();
  
  const [checklist, setChecklist] = useState(defaultChecklistItems);

  const { data: applicationsData, isLoading: isLoadingApplications } = useLoanApplicationsQuery({
    page: 1,
    limit: 50,
    statusFilter: "under_review",
  });

  const applications = applicationsData?.data || [];

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      applicationId: "",
      verificationDate: new Date().toISOString().split("T")[0],
      gpsLatitude: undefined,
      gpsLongitude: undefined,
      addressVerified: false,
      checklistCompleted: false,
      notes: "",
      verificationStatus: "pending",
    },
  });

  const onSubmit = async (data: VerificationFormData) => {
    try {
      const checklistData = checklist.reduce((acc, item) => {
        acc[item.id] = item.value;
        return acc;
      }, {} as Record<string, boolean>);

      const verificationData: CreateVerificationData = {
        applicationId: data.applicationId,
        verificationDate: data.verificationDate,
        gpsLatitude: data.gpsLatitude,
        gpsLongitude: data.gpsLongitude,
        addressVerified: data.addressVerified,
        checklistCompleted: checklist.some(c => c.value),
        checklistData,
        notes: data.notes,
        verificationStatus: data.verificationStatus,
      };

      await createMutation.mutateAsync(verificationData);
      toast.success("Verification created successfully");
      router.push("/field-verifications");
    } catch (error) {
      toast.error("Failed to create verification");
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("gpsLatitude", position.coords.latitude);
          form.setValue("gpsLongitude", position.coords.longitude);
          toast.success("Location captured successfully");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, value: !item.value } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Field Verification</h1>
            <p className="text-sm text-muted-foreground">Add a new field verification record.</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Verification Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select application" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingApplications ? (
                            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                          ) : applications.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">No applications available</div>
                          ) : (
                            applications.map((app: any) => (
                              <SelectItem key={app.id} value={app.id}>
                                {app.member?.name || app.id.slice(0, 8)} - {app.loanAmount?.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verificationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        </SelectContent>
                      </Select>
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
                        <Textarea 
                          placeholder="Enter verification notes..." 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  GPS Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="gpsLatitude"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="e.g., -6.2088"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gpsLongitude"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="e.g., 106.8456"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleGetLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Current Location
                </Button>

                <div className="pt-4">
                  <FormField
                    control={form.control}
                    name="addressVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Address Verified
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {checklist.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => toggleChecklistItem(item.id)}
                  >
                    <Checkbox
                      checked={item.value}
                      onCheckedChange={() => toggleChecklistItem(item.id)}
                    />
                    <Label className="cursor-pointer">{item.label}</Label>
                  </div>
                ))}
              </div>
              <FormField
                control={form.control}
                name="checklistCompleted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-4 pt-4 border-t">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Checklist Completed
                    </FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Creating..." : "Create Verification"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}