"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import { useUpdateProfileMutation } from "@/hooks/use-profile";

// Custom hook for form state and logic
const useProfileForm = (user: any, onUpdateSuccess: () => void) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const updateProfileMutation = useUpdateProfileMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    const payload: any = { name: formData.name, email: formData.email };
    if (formData.currentPassword && formData.newPassword) {
      payload.currentPassword = formData.currentPassword;
      payload.newPassword = formData.newPassword;
    }

    const promise = updateProfileMutation.mutateAsync(payload);
    
    toast.promise(promise, {
      loading: "Updating profile...",
      success: () => {
        onUpdateSuccess();
        return "Profile updated successfully!";
      },
      error: (err: any) => err?.message || "Failed to update profile.",
    });
  };

  return { formData, handleInputChange, handleUpdateProfile, mutation: updateProfileMutation };
};


export function UserProfile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { formData, handleInputChange, handleUpdateProfile, mutation } = useProfileForm(user, () => setIsProfileOpen(false));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "AD";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage src={(user as any)?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || "Administrator"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || "admin@kopimas.id"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsProfileOpen(true)}>
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your profile and password here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-3">Change Password</p>
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateProfile} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}