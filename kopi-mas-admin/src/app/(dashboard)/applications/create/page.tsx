"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useCreateLoanApplicationMutation } from "@/hooks/use-applications";
import { useProductsQuery } from "@/hooks/use-products";
import { useBranchesQuery } from "@/hooks/use-branches";
import { useMembersQuery } from "@/hooks/use-members";

const applicationSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  loanProductId: z.string().min(1, "Loan product is required"),
  branchId: z.string().min(1, "Branch is required"),
  loanAmount: z.number().min(1, "Loan amount is required"),
  loanTenureMonths: z.number().min(1, "Tenure is required"),
  interestRate: z.number().min(0, "Interest rate is required"),
  interestRateType: z.string().min(1, "Interest rate type is required"),
  purposeDescription: z.string().optional(),
  incomeSource: z.string().min(1, "Income source is required"),
  monthlyIncome: z.number().min(0, "Monthly income is required"),
  debtToIncomeRatio: z.number().min(0).max(100).optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function CreateApplicationPage() {
  const router = useRouter();

  const { data: membersData } = useMembersQuery({ page: 1, limit: 100, status: "active" });
  const { data: productsData } = useProductsQuery({ page: 1, limit: 100 });
  const { data: branchesData } = useBranchesQuery({ page: 1, limit: 100 });

  const createMutation = useCreateLoanApplicationMutation();

  const members = membersData?.data || [];
  const products = productsData?.data || [];
  const branches = branchesData?.data || [];

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      memberId: "",
      loanProductId: "",
      branchId: "",
      loanAmount: 0,
      loanTenureMonths: 12,
      interestRate: 12,
      interestRateType: "annual",
      purposeDescription: "",
      incomeSource: "",
      monthlyIncome: 0,
      debtToIncomeRatio: undefined,
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push("/applications");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/applications")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Loan Application</h1>
            <p className="text-sm text-muted-foreground">Create a new loan application</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Member & Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map((member: any) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.nik})
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
                              {product.productName} ({product.productType})
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

            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
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

            {/* Financial Information */}
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
                      <FormLabel>Debt to Income Ratio (%) - Optional</FormLabel>
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.push("/applications")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Create Application
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}