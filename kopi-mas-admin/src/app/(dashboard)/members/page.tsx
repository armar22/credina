"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash, MoreHorizontal, Users, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useMembersQuery,
  useDeleteMemberMutation,
  useActivateMemberMutation,
  useDeactivateMemberMutation,
  useSuspendMemberMutation,
  useApproveMemberMutation,
  useRejectMemberMutation,
} from "@/hooks/use-members";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [activateMemberId, setActivateMemberId] = useState<string | null>(null);
  const [deactivateMemberId, setDeactivateMemberId] = useState<string | null>(null);
  const [suspendMemberId, setSuspendMemberId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const userRole = user?.role;

  const isSystemAdmin = userRole === "system_admin";
  const isAdmin = userRole === "admin" || userRole === "system_admin";

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const { data, isLoading, isFetching } = useMembersQuery({
    page,
    limit: 10,
    status: "",
    city: "",
  });

  const deleteMutation = useDeleteMemberMutation();
  const activateMutation = useActivateMemberMutation();
  const approveMutation = useApproveMemberMutation();
  const rejectMutation = useRejectMemberMutation();
  const deactivateMutation = useDeactivateMemberMutation();
  const suspendMutation = useSuspendMemberMutation();

  const members = data?.data ?? [];
  const meta = data?.meta;

  const totalPages = meta
    ? Math.ceil(meta.total / meta.limit)
    : 1;

  const filteredMembers = searchTerm
    ? members.filter((m: any) =>
        m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : members;

  const handleDelete = async () => {
    if (!deleteMemberId) return;
    try {
      await deleteMutation.mutateAsync(deleteMemberId);
      toast.success("Member deleted successfully");
      setDeleteMemberId(null);
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. RESPONSIVE HEADER: Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Member Management</h1>
          <p className="text-sm text-muted-foreground">Manage cooperative members and their information.</p>
        </div>
        <Link href="/members/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, NIK, or phone..."
                className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
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
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No members found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria." : "Add your first member to get started."}
              </p>
              {!searchTerm && (
                <Link href="/members/create">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* 2. RESPONSIVE TABLE CONTAINER */}
              <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="min-w-[150px]">Name</TableHead>
                      <TableHead className="hidden md:table-cell">NIK</TableHead>
                      <TableHead className="hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="hidden lg:table-cell">City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member: any) => (
                      <TableRow key={member.id} className="group transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden">{member.nik}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{member.nik}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{member.phone}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{member.city || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.status === "active" ? "default" :
                              member.status === "suspended" ? "destructive" :
                              member.status === "under_review" ? "outline" :
                              "secondary"
                            }
                            className={member.status === "under_review" ? "border-blue-500 text-blue-600" : ""}
                          >
                            {member.status === "under_review" ? "Under Review" : (member.status || "inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Link href={`/members/${member.id}`}>
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                              </Link>
                              
                              {isAdmin && member.status === "under_review" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                    onClick={() => setActivateMemberId(member.id)}
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" /> Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => setSuspendMemberId(member.id)}
                                  >
                                    <UserX className="mr-2 h-4 w-4" /> Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {isAdmin && member.status === "active" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                                    onClick={() => setDeactivateMemberId(member.id)}
                                  >
                                    <UserX className="mr-2 h-4 w-4" /> Deactivate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => setSuspendMemberId(member.id)}
                                  >
                                    <UserX className="mr-2 h-4 w-4" /> Suspend
                                  </DropdownMenuItem>
                                </>
                              )}

                              {isAdmin && member.status === "inactive" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                    onClick={() => setActivateMemberId(member.id)}
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" /> Activate
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {isSystemAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => setDeleteMemberId(member.id)}
                                  >
                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    disabled={page === 1 || isFetching}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Page {meta?.page ?? page} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    disabled={page === totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approve/Activate Confirmation Alert */}
      <AlertDialog open={!!activateMemberId} onOpenChange={(open) => !open && setActivateMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve the member registration, allowing them to apply for loans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { approveMutation.mutate(activateMemberId!); setActivateMemberId(null); }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate Confirmation Alert */}
      <AlertDialog open={!!deactivateMemberId} onOpenChange={(open) => !open && setDeactivateMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the member. They will not be able to apply for new loans until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { deactivateMutation.mutate(deactivateMemberId!); setDeactivateMemberId(null); }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend/Reject Confirmation Alert */}
      <AlertDialog open={!!suspendMemberId} onOpenChange={(open) => !open && setSuspendMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reject the member registration. The member will not be able to apply for loans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { rejectMutation.mutate(suspendMemberId!); setSuspendMemberId(null); }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteMemberId} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the member and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}