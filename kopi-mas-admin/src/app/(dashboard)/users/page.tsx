"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash, MoreHorizontal, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUsersQuery, useDeleteUserMutation, useUpdateUserMutation } from "@/hooks/use-users";
import { toast } from "sonner";
import { UserForm } from "@/components/features/users/UserForm";
import { UserEditForm } from "@/components/features/users/UserEditForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data, isLoading } = useUsersQuery({ page, limit, search: searchTerm });
  const users = data?.data || [];
  const meta = data?.meta;
  const deleteMutation = useDeleteUserMutation();
  const updateMutation = useUpdateUserMutation();

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await deleteMutation.mutateAsync(deleteUserId);
      toast.success("User deleted successfully");
      setDeleteUserId(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      const userId = user.id || user.user_id;
      await updateMutation.mutateAsync({
        id: userId,
        data: { isActive: !user.isActive }
      });
      toast.success(`User ${user.isActive ? "deactivated" : "activated"} successfully`);
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. RESPONSIVE HEADER: Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage system access and roles for cooperative officers.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Assign a new officer to the system.</DialogDescription>
            </DialogHeader>
            <UserForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <UserCog className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or add a new user.</p>
            </div>
          ) : (
            /* 2. RESPONSIVE TABLE CONTAINER: Prevents stretching the page */
            <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {/* Keep essential columns visible, hide others on small screens */}
                    <TableHead className="min-w-[150px]">Full Name</TableHead>
                    <TableHead className="hidden md:table-cell">Username</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Role</TableHead>
                    <TableHead className="hidden xl:table-cell">Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => {
                    const userId = user.user_id || user.id;
                    return (
                      <TableRow key={userId} className="group transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.fullName || user.full_name}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{user.username}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-muted-foreground">{user.phone || "-"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ?? user.is_active ? "default" : "secondary"}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.isActive ?? user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* 3. ROW ACTIONS: Using Dropdown for cleaner mobile UI */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => setDeleteUserId(userId)}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {meta && (
          <CardFooter className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Showing {users.length} of {meta.total} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= meta.total}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account and remove their access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Modify the officer's information and system role.</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserEditForm 
              user={editingUser} 
              onSuccess={() => setEditingUser(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}