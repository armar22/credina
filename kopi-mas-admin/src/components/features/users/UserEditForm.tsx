"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateUserMutation } from "@/hooks/use-users";
import { toast } from "sonner";

const userEditSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must not exceed 255 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number must not exceed 20 characters"),
  role: z
    .string()
    .min(1, "Please select a role"),
  isActive: z.boolean(),
  branchId: z
    .string()
    .optional()
    .or(z.literal("")),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

interface UserEditFormProps {
  user: any;
  onSuccess: () => void;
}

export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
  const [emailError, setEmailError] = useState<string | null>(null);
  const updateMutation = useUpdateUserMutation();
  const userId = user.user_id || user.id;

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: user.fullName || user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "officer",
      isActive: user.isActive ?? user.is_active ?? true,
      branchId: user.branchId || user.branch_id || "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: UserEditFormData) => {
    setEmailError(null);
    
    try {
      const payload = {
        ...data,
        email: data.email.trim().toLowerCase(),
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        branchId: data.branchId || undefined,
      };
      
      await updateMutation.mutateAsync({ id: userId, data: payload });
      toast.success("User updated successfully");
      form.reset(data);
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      
      if (Array.isArray(message)) {
        message.forEach((msg: string) => {
          if (msg.toLowerCase().includes("email")) {
            setEmailError(msg);
          }
        });
      }
      
      if (!emailError) {
        toast.error(message || "Failed to update user");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter email" 
                  {...field}
                  onChange={(e) => {
                    setEmailError(null);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              {emailError ? (
                <FormMessage>{emailError}</FormMessage>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value === "true")} 
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? "Saving..." : "Update User"}
        </Button>
      </form>
    </Form>
  );
}
