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
import { useCreateRegionMutation, useUpdateRegionMutation } from "@/hooks/use-regions";
import { toast } from "sonner";

const regionSchema = z.object({
  regionCode: z.string().min(2, "Region code must be at least 2 characters"),
  regionName: z.string().min(2, "Region name must be at least 2 characters"),
});

type RegionFormData = z.infer<typeof regionSchema>;

interface RegionFormProps {
  initialData?: Partial<RegionFormData> & { region_id?: string };
  onSuccess: () => void;
}

export function RegionForm({ initialData, onSuccess }: RegionFormProps) {
  const createMutation = useCreateRegionMutation();
  const updateMutation = useUpdateRegionMutation();

  const form = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema),
    defaultValues: initialData || {
      regionCode: "",
      regionName: "",
    },
  });

  const onSubmit = async (data: RegionFormData) => {
    try {
      if (initialData?.region_id) {
        await updateMutation.mutateAsync({ id: initialData.region_id, data });
        toast.success("Region updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Region created successfully");
      }
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${initialData?.region_id ? "update" : "create"} region`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="regionCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., JABAR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Jawa Barat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : initialData?.region_id ? "Update Region" : "Create Region"}
        </Button>
      </form>
    </Form>
  );
}
