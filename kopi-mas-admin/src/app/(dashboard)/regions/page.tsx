"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash, MoreHorizontal, MapPin, AlertCircle } from "lucide-react";
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
import { useRegionsQuery, useDeleteRegionMutation } from "@/hooks/use-regions";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { RegionForm } from "@/components/features/regions/RegionForm";
import { useAuthStore } from "@/store/auth-store";

export default function RegionsPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [deleteRegionId, setDeleteRegionId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const isSystemAdmin = user?.role === "system_admin";

  const { data: response, isLoading } = useRegionsQuery({ page: 1, limit: 100 });
  const regions = response?.data || [];
  const deleteMutation = useDeleteRegionMutation();

  const filteredRegions = regions.filter(
    (region) =>
      region.regionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.regionCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (region: any) => {
    setEditingRegion(region);
    setIsCreateOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteRegionId) return;
    try {
      await deleteMutation.mutateAsync(deleteRegionId);
      toast.success(t("deleted"));
      setDeleteRegionId(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || t("failedToDelete");
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("regions")}</h1>
          <p className="text-sm text-muted-foreground">{t("regionManagement")}</p>
        </div>
        <Dialog 
          open={isCreateOpen} 
          onOpenChange={(open) => { 
            setIsCreateOpen(open); 
            if (!open) setEditingRegion(null); 
          }}
        >
          {isSystemAdmin && (
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Region
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingRegion ? "Edit Region" : "Create New Region"}</DialogTitle>
              <DialogDescription>
                Define a new region for organizing branches and managing territories.
              </DialogDescription>
            </DialogHeader>
            <RegionForm 
              initialData={editingRegion} 
              onSuccess={() => { 
                setIsCreateOpen(false); 
                setEditingRegion(null); 
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
              placeholder="Search regions..."
              className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className={isLoading || filteredRegions.length === 0 ? "p-6" : "p-0"}>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredRegions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No regions found</p>
              <p className="text-sm text-muted-foreground">Try creating a new region to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar mx-6 mb-6">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-[120px]">Code</TableHead>
                    <TableHead className="min-w-[180px]">Name</TableHead>
                    <TableHead className="hidden md:table-cell">Branches</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegions.map((region: any) => (
                    <TableRow key={region.region_id} className="group transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{region.regionCode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {region.regionName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{region.branchCount || 0} Branches</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Region Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(region)}>
                              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Region
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {isSystemAdmin && (
                              region.branchCount > 0 ? (
                                <DropdownMenuItem className="text-muted-foreground cursor-not-allowed" disabled>
                                  <Trash className="mr-2 h-4 w-4" /> Has {region.branchCount} Branch(es)
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => setDeleteRegionId(region.region_id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              )
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
        open={!!deleteRegionId} 
        onOpenChange={(open) => !open && setDeleteRegionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this region? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Region
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
