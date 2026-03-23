"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash, MoreHorizontal, Building2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useBranchesQuery, useDeleteBranchMutation } from "@/hooks/use-branches";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { BranchForm } from "@/components/features/branches/BranchForm";
import { useAuthStore } from "@/store/auth-store";

export default function BranchesPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [deleteBranchId, setDeleteBranchId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isSystemAdmin = user?.role === "system_admin";

  const { data: response, isLoading } = useBranchesQuery({ page: 1, limit: 100 });
  const branches = response?.data || [];
  const deleteMutation = useDeleteBranchMutation();

  const filteredBranches = branches.filter(
    (branch) =>
      branch.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branchCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (branch: any) => {
    setEditingBranch(branch);
    setIsCreateOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteBranchId) return;
    try {
      await deleteMutation.mutateAsync(deleteBranchId);
      toast.success(t("deleted"));
      setDeleteBranchId(null);
    } catch (error) {
      toast.error(t("failedToDelete"));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("branches")}</h1>
          <p className="text-sm text-muted-foreground">{t("branchManagement")}</p>
        </div>
        <Dialog 
          open={isCreateOpen} 
          onOpenChange={(open) => { 
            setIsCreateOpen(open); 
            if (!open) setEditingBranch(null); 
          }}
        >
          {isSystemAdmin && (
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                {t("addBranch")}
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingBranch ? t("editBranch") : t("addBranch")}</DialogTitle>
              <DialogDescription>
                {t("branchManagement")}
              </DialogDescription>
            </DialogHeader>
            <BranchForm 
              initialData={editingBranch} 
              onSuccess={() => { 
                setIsCreateOpen(false); 
                setEditingBranch(null); 
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search") + "..."}
              className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className={isLoading || filteredBranches.length === 0 ? "p-6" : "p-0"}>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">{t("noBranchesFound")}</p>
              <p className="text-sm text-muted-foreground">{t("tryCreatingNew")}</p>
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar mx-6 mb-6">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-[120px]">{t("code")}</TableHead>
                    <TableHead className="min-w-[150px]">{t("name")}</TableHead>
                    <TableHead className="hidden md:table-cell">{t("city")}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t("province")}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t("phone")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch: any) => (
                    <TableRow key={branch.branch_id} className="group transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{branch.branchCode}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{branch.city}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {branch.branchName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {branch.city}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {branch.province}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {branch.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.isActive ? "default" : "secondary"}>
                          {branch.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuLabel>Branch Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(branch)}>
                              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Branch
                            </DropdownMenuItem>
                            {isSystemAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => setDeleteBranchId(branch.branch_id)}
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
          )}
        </CardContent>
      </Card>

      <AlertDialog 
        open={!!deleteBranchId} 
        onOpenChange={(open) => !open && setDeleteBranchId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this branch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Branch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
