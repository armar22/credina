"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/features/products/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductQuery } from "@/hooks/use-products";

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, isLoading } = useProductQuery(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Link href="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            initialData={{
              productName: product.productName,
              productType: product.productType,
              minAmount: product.minAmount,
              maxAmount: product.maxAmount,
              minTenureMonths: product.minTenureMonths,
              maxTenureMonths: product.maxTenureMonths,
              interestRateMin: product.interestRateMin,
              interestRateMax: product.interestRateMax,
              interestRateType: product.interestRateType,
              isActive: product.isActive,
            }}
            onSuccess={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
