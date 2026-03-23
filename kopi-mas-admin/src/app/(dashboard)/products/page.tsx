"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash, 
  Package, 
  Settings2, 
  MoreHorizontal, 
  FileText,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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

import { useProductsQuery, useDeleteProductMutation } from "@/hooks/use-products";
import { ProductForm } from "@/components/features/products/ProductForm";
import { useI18n } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth-store";

/**
 * Currency Formatter for Indonesian Rupiah
 */
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductsPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const userRole = user?.role;
  const isSystemAdmin = userRole === "system_admin";

  const { data, isLoading } = useProductsQuery({ page, limit, search: searchTerm });
  const products = data?.data || [];
  const meta = data?.meta;
  const deleteMutation = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!deleteProductId) return;
    try {
      await deleteMutation.mutateAsync(deleteProductId);
      toast.success("Loan product deleted successfully");
      setDeleteProductId(null);
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. CONSISTENT PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("loanProducts")}</h1>
          <p className="text-sm text-muted-foreground">Configure interest rates and lending terms for cooperative members.</p>
        </div>
        <Dialog 
          open={isCreateOpen} 
          onOpenChange={(open) => { 
            setIsCreateOpen(open); 
            if (!open) setEditingProduct(null); 
          }}
        >
          {isSystemAdmin && (
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
              <DialogDescription>
                Configure the parameters for this loan product. Changes will only apply to new applications.
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              initialData={editingProduct} 
              onSuccess={() => { 
                setIsCreateOpen(false); 
                setEditingProduct(null); 
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        {/* 2. CONSISTENT SEARCH SECTION */}
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className={isLoading || products.length === 0 ? "p-6" : "p-0"}>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Package className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">Try creating a new loan product to get started.</p>
            </div>
          ) : (
            /* 3. CONSISTENT RESPONSIVE TABLE CONTAINER */
            <div className="rounded-md border border-border/50 overflow-x-auto custom-scrollbar mx-6 mb-6">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="min-w-[180px]">Product Name</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Lending Range</TableHead>
                    <TableHead className="hidden xl:table-cell">Tenure</TableHead>
                    <TableHead className="hidden sm:table-cell">Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.product_id} className="group transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{product.productName}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{product.productType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="font-normal capitalize">
                          {product.productType.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        <div className="flex flex-col">
                          <span>{formatIDR(product.minAmount)}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">Up to {formatIDR(product.maxAmount)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                        {product.minTenureMonths} - {product.maxTenureMonths} mo
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm font-medium text-primary">
                        {product.interestRateMin}% - {product.interestRateMax}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuLabel>Product Options</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> View History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" /> Clone Settings
                            </DropdownMenuItem>
                            {isSystemAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => setDeleteProductId(product.product_id)}
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
        {meta && (
          <CardFooter className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Showing {products.length} of {meta.total} products
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

      {/* CONSISTENT DELETE DIALOG */}
      <AlertDialog 
        open={!!deleteProductId} 
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this loan product? This action will disable new applications for this type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}