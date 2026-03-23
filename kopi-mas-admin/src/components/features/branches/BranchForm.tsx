"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useRegionsQuery } from "@/hooks/use-regions";
import { useCreateBranchMutation, useUpdateBranchMutation } from "@/hooks/use-branches";
import { toast } from "sonner";

const branchSchema = z.object({
  branchCode: z.string().min(2, "Branch code must be at least 2 characters"),
  branchName: z.string().min(2, "Branch name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  regionId: z.string().optional(),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  initialData?: Partial<BranchFormData> & { branch_id?: string };
  onSuccess: () => void;
}

export function BranchForm({ initialData, onSuccess }: BranchFormProps) {
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation();
  const { data: regionsData } = useRegionsQuery({ limit: 100 });
  
  const regions = Array.isArray(regionsData) ? regionsData : (regionsData?.data || []);

  const form = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: initialData ? {
      ...initialData,
      regionId: initialData.regionId || "__null__",
    } : {
      branchCode: "",
      branchName: "",
      address: "",
      city: "",
      province: "",
      phone: "",
      regionId: "__null__",
    },
  });

  const onSubmit = async (data: BranchFormData) => {
    try {
      const payload = {
        ...data,
        regionId: data.regionId === "__null__" ? undefined : data.regionId,
      };
      
      if (initialData?.branch_id) {
        await updateMutation.mutateAsync({ id: initialData.branch_id, data: payload });
        toast.success("Branch updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Branch created successfully");
      }
      form.reset();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : `Failed to ${initialData?.branch_id ? "update" : "create"} branch`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="branchCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., JKT-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="branchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jakarta Pusat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jakarta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., DKI Jakarta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 0211234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="regionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region (Optional)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value || null)} 
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__null__">No Region</SelectItem>
                    {regions.map((region: any) => (
                      <SelectItem key={region.region_id} value={region.region_id}>
                        {region.regionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : initialData?.branch_id ? "Update Branch" : "Create Branch"}
        </Button>
      </form>
    </Form>
  );
}
