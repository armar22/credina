"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProductMutation, useUpdateProductMutation } from "@/hooks/use-products";
import { toast } from "sonner";

const productSchema = z.object({
  productName: z.string().min(2, "Name must be at least 2 characters"),
  productType: z.string().min(1, "Type is required"),
  minAmount: z.number().min(100000, "Minimum amount must be at least 100,000"),
  maxAmount: z.number().min(100000, "Maximum amount must be at least 100,000"),
  minTenureMonths: z.number().min(1, "Minimum tenure is required"),
  maxTenureMonths: z.number().min(1, "Maximum tenure is required"),
  interestRateMin: z.number().min(0, "Min rate must be positive").max(100),
  interestRateMax: z.number().min(0, "Max rate must be positive").max(100),
  interestRateType: z.string().min(1, "Rate type is required"),
  isActive: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { product_id?: string };
  onSuccess: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();

  const getDefaultValues = () => {
    if (!initialData) {
      return {
        productName: "",
        productType: "personal",
        minAmount: 1000000,
        maxAmount: 10000000,
        minTenureMonths: 1,
        maxTenureMonths: 12,
        interestRateMin: 12,
        interestRateMax: 18,
        interestRateType: "fixed",
        isActive: true,
      };
    }
    
    return {
      productName: initialData.productName || "",
      productType: initialData.productType || "personal",
      minAmount: typeof initialData.minAmount === 'number' ? initialData.minAmount : Number(initialData.minAmount) || 1000000,
      maxAmount: typeof initialData.maxAmount === 'number' ? initialData.maxAmount : Number(initialData.maxAmount) || 10000000,
      minTenureMonths: typeof initialData.minTenureMonths === 'number' ? initialData.minTenureMonths : Number(initialData.minTenureMonths) || 1,
      maxTenureMonths: typeof initialData.maxTenureMonths === 'number' ? initialData.maxTenureMonths : Number(initialData.maxTenureMonths) || 12,
      interestRateMin: typeof initialData.interestRateMin === 'number' ? initialData.interestRateMin : Number(initialData.interestRateMin) || 12,
      interestRateMax: typeof initialData.interestRateMax === 'number' ? initialData.interestRateMax : Number(initialData.interestRateMax) || 18,
      interestRateType: initialData.interestRateType || "fixed",
      isActive: initialData.isActive ?? true,
    } as ProductFormData;
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(),
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (initialData?.product_id) {
        await updateMutation.mutateAsync({ id: initialData.product_id, data });
        toast.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Product created successfully");
      }
      form.reset();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : `Failed to ${initialData?.product_id ? "update" : "create"} product`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="productType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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
            name="minAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Amount</FormLabel>
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
            name="maxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Amount</FormLabel>
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
            name="minTenureMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Tenure (months)</FormLabel>
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
            name="maxTenureMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Tenure (months)</FormLabel>
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
            name="interestRateMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Interest Rate (%)</FormLabel>
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
            name="interestRateMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Interest Rate (%)</FormLabel>
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
        </div>
        <FormField
          control={form.control}
          name="interestRateType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interest Rate Type</FormLabel>
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
        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : initialData?.product_id ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
