"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Wallet, Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { MainLayout } from "@/components/layout/MainLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // 1. Handle Hydration (Crucial for Zustand + LocalStorage)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Handle Authentication Protection
  useEffect(() => {
    if (isMounted && !isAuthenticated && pathname !== "/login") {
      router.replace("/login"); 
    }
  }, [isMounted, isAuthenticated, router, pathname]);

  // 3. Refined Loading State
  // This screen shows during hydration or redirecting to prevent "Flicker"
  if (!isMounted || (!isAuthenticated && pathname !== "/login")) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          
          {/* Animated Branded Logo Container */}
          <div className="relative">
            {/* Outer Glow/Pulse Ring */}
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 animate-pulse" />
            
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/20">
              <Wallet className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          
          {/* Brand & Loading Info */}
          <div className="flex flex-col items-center space-y-3 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Credina Admin
            </h2>
            <div className="flex items-center space-x-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              <span>Securing your session...</span>
            </div>
          </div>
        </div>
        
        {/* Subtle Footer for Loading Screen */}
        <div className="absolute bottom-8 text-[10px] uppercase tracking-widest text-muted-foreground/40">
          Powered by Credina Technology
        </div>
      </div>
    );
  }

  // 4. Render Main App
  // MainLayout now handles the Sidebar (Drawer) and Header (Toggle) automatically
  return <MainLayout>{children}</MainLayout>;
}