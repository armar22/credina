"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useLoanApplicationQuery, useUpdateLoanApplicationMutation } from "@/hooks/use-applications";
import { useProductsQuery } from "@/hooks/use-products";
import { useBranchesQuery } from "@/hooks/use-branches";
import { Skeleton } from "@/components/ui/skeleton";

const applicationSchema = z.object({
  loanAmount: z.number().min(1, "Loan amount is required"),
  loanTenureMonths: z.number().min(1, "Tenure is required"),
  interestRate: z.number().min(0, "Interest rate is required"),
  interestRateType: z.string().min(1, "Interest rate type is required"),
  purposeDescription: z.string().optional(),
  incomeSource: z.string().min(1, "Income source is required"),
  monthlyIncome: z.number().min(0, "Monthly income is required"),
  debtToIncomeRatio: z.number().min(0).max(100).optional(),
  loanProductId: z.string().min(1, "Loan product is required"),
  branchId: z.string().min(1, "Branch is required"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ApplicationEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: application, isLoading } = useLoanApplicationQuery(id);
  const { data: productsData } = useProductsQuery({ page: 1, limit: 100 });
  const { data: branchesData } = useBranchesQuery({ page: 1, limit: 100 });

  const updateMutation = useUpdateLoanApplicationMutation();

  const products = productsData?.data || [];
  const branches = branchesData?.data || [];

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      loanAmount: 0,
      loanTenureMonths: 0,
      interestRate: 0,
      interestRateType: "annual",
      purposeDescription: "",
      incomeSource: "",
      monthlyIncome: 0,
      debtToIncomeRatio: undefined,
      loanProductId: "",
      branchId: "",
    },
  });

  // Populate form when application data loads
  useState(() => {
    if (application) {
      form.reset({
        loanAmount: application.loanAmount,
        loanTenureMonths: application.loanTenureMonths,
        interestRate: application.interestRate,
        interestRateType: application.interestRateType || "annual",
        purposeDescription: application.purposeDescription || "",
        incomeSource: application.incomeSource || "",
        monthlyIncome: application.monthlyIncome,
        debtToIncomeRatio: application.debtToIncomeRatio || undefined,
        loanProductId: application.loanProduct?.id || "",
        branchId: application.branch?.id || "",
      });
    }
  });

  const onSubmit = (data: ApplicationFormValues) => {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push(`/applications/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/applications/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Application</h1>
            <p className="text-sm text-muted-foreground">ID: {id}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="loanProductId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Product</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product: any) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.productName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (IDR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={formatCurrency(10000000)}
                          {...field}
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
                      <FormLabel>Tenure (Months)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            placeholder="12"
                            {...field}
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
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purposeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Business capital, home improvement, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Financial Info */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="incomeSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                      <FormLabel>Monthly Income (IDR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={formatCurrency(5000000)}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="debtToIncomeRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt to Income Ratio (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="30"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Branch Assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Branch Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch: any) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.branchName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/applications/${id}`}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}