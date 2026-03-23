"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Building2, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import ProductsPage from "../products/page";
import BranchesPage from "../branches/page";
import RegionsPage from "../regions/page";

export default function ConfigurationsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("configurations")}</h1>
        <p className="text-muted-foreground">Manage products, branches, and regions</p>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t("products")}
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t("branches")}
          </TabsTrigger>
          <TabsTrigger value="regions" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t("regions")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <ProductsPage />
        </TabsContent>

        <TabsContent value="branches" className="mt-6">
          <BranchesPage />
        </TabsContent>

        <TabsContent value="regions" className="mt-6">
          <RegionsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
