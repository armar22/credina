"use client";

import { useState, useRef } from "react";
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
import { useCreateMemberMutation, useUpdateMemberMutation } from "@/hooks/use-members";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Upload, Image, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nik: z.string().length(16, "NIK must be 16 digits"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"], { message: "Gender must be male or female" }),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  ktpImageUrl: z.string().min(1, "KTP image is required"),
  photoUrl: z.string().optional().or(z.literal("")),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: MemberFormData;
  memberId?: string;
  onSuccess: () => void;
}

export function MemberForm({ initialData, memberId, onSuccess }: MemberFormProps) {
  const createMutation = useCreateMemberMutation();
  const updateMutation = useUpdateMemberMutation();
  const mutation = memberId ? updateMutation : createMutation;
  
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string>(initialData?.ktpImageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData || {
      name: "",
      nik: "",
      dob: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      ktpImageUrl: "",
      photoUrl: "",
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useAuthStore.getState().token}`,
      },
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await res.json();
    return data.url;
  };

  const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKtpFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setKtpPreview(previewUrl);
      form.setValue("ktpImageUrl", previewUrl);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    const user = useAuthStore.getState().user;
    
    try {
      let finalKtpUrl = data.ktpImageUrl;
      
      // Upload KTP file if it's a new file (blob URL or File)
      if (ktpFile && (ktpPreview.startsWith('blob:') || ktpPreview.startsWith('data:'))) {
        setIsUploading(true);
        try {
          finalKtpUrl = await uploadFile(ktpFile);
        } catch (uploadError) {
          toast.error("Failed to upload KTP image");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }
      
      const memberData = {
        ...data,
        ktpImageUrl: finalKtpUrl,
        createdByOfficerId: user?.id,
      };

      if (memberId) {
        await updateMutation.mutateAsync({ id: memberId, ...memberData });
        toast.success("Member updated successfully");
      } else {
        await createMutation.mutateAsync(memberData);
        toast.success("Member created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${memberId ? "update" : "create"} member`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIK</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="081234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city" {...field} />
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
                  <Input placeholder="Enter province" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ktpImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KTP Image</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleKtpChange}
                    />
                    {ktpPreview ? (
                      <div className="relative w-full h-40 border-2 border-dashed rounded-lg overflow-hidden">
                        <img 
                          src={ktpPreview} 
                          alt="KTP Preview" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 right-2"
                          onClick={() => {
                            setKtpFile(null);
                            setKtpPreview("");
                            field.onChange("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-20 border-dashed"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload KTP Image
                      </Button>
                    )}
                    <Input type="hidden" {...field} value={ktpPreview} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={mutation.isPending || isUploading}
        >
          {(mutation.isPending || isUploading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isUploading ? "Uploading..." : mutation.isPending ? "Saving..." : memberId ? "Update Member" : "Create Member"}
        </Button>
      </form>
    </Form>
  );
}
