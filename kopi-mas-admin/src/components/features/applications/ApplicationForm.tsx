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
import { useCreateLoanApplicationMutation, useUpdateLoanApplicationMutation } from "@/hooks/use-applications";
import { useAgentsQuery } from "@/hooks/use-agents";
import { toast } from "sonner";

const applicationSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  agentId: z.string().optional(),
  loanProductId: z.string().optional(),
  loanProductType: z.enum(["personal", "business", "emergency"]),
  loanAmount: z.number().min(100000, "Minimum loan amount is Rp 100,000"),
  loanTenureMonths: z.number().min(1, "Tenure is required"),
  interestRate: z.number().min(0, "Interest rate must be positive"),
  interestRateType: z.enum(["fixed", "reducing"]),
  purposeDescription: z.string().optional(),
  incomeSource: z.enum(["employed", "self_employed", "business"]),
  monthlyIncome: z.number().min(0, "Monthly income is required"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  initialData?: Partial<ApplicationFormData> & { application_id?: string };
  onSuccess: () => void;
}

export function ApplicationForm({ initialData, onSuccess }: ApplicationFormProps) {
  const createMutation = useCreateLoanApplicationMutation();
  const updateMutation = useUpdateLoanApplicationMutation();
  
  const { data: agentsResponse } = useAgentsQuery({ limit: 100, status: "active" });
  const agents = agentsResponse?.data || [];

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialData || {
      memberId: "",
      agentId: "",
      loanProductId: "",
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
      if (initialData?.application_id) {
        await updateMutation.mutateAsync({ id: initialData.application_id, data });
        toast.success("Application updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Application created successfully");
      }
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${initialData?.application_id ? "update" : "create"} application`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <SelectItem value="member-1">John Doe</SelectItem>
                  <SelectItem value="member-2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {agents.map((agent: any) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.fullName} ({agent.agentCode})
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
                <Input placeholder="Describe the purpose of the loan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : initialData?.application_id ? "Update Application" : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
}
