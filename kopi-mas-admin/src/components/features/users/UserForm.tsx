"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUserMutation } from "@/hooks/use-users";
import { toast } from "sonner";

const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name must not exceed 255 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number must not exceed 20 characters"),
  role: z
    .string()
    .min(1, "Please select a role"),
  branchId: z
    .string()
    .optional()
    .or(z.literal("")),
  officerId: z
    .string()
    .optional()
    .or(z.literal("")),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  onSuccess: () => void;
}

export function UserForm({ onSuccess }: UserFormProps) {
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const createMutation = useCreateUserMutation();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      role: "officer",
      branchId: "",
      officerId: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: UserFormData) => {
    setUsernameError(null);
    setEmailError(null);

    try {
      const payload = {
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        role: data.role,
        branchId: data.branchId || undefined,
        officerId: data.officerId || undefined,
      };
      
      await createMutation.mutateAsync(payload);
      toast.success("User created successfully");
      form.reset();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      
      if (Array.isArray(message)) {
        message.forEach((msg: string) => {
          if (msg.toLowerCase().includes("username")) {
            setUsernameError(msg);
          } else if (msg.toLowerCase().includes("email")) {
            setEmailError(msg);
          }
        });
      }
      
      if (!usernameError && !emailError) {
        toast.error(message || "Failed to create user");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter username" 
                  {...field} 
                  onChange={(e) => {
                    setUsernameError(null);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              {usernameError ? (
                <FormMessage>{usernameError}</FormMessage>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Button 
          type="submit" 
          className="w-full" 
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
