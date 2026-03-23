"use client";

import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // 1. State to manage the visibility of the mobile sidebar drawer.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 2. Function to toggle the mobile menu state.
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/30 dark:bg-background/95">
      {/* 
        3. The Sidebar is now passed the state and the function to control it. 
           It will render differently on mobile vs. desktop based on these props.
      */}
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        toggleMobileMenu={toggleMobileMenu} 
      />
      
      <div className="flex flex-1 flex-col md:pl-64 transition-transform duration-300 ease-in-out">
        {/* 4. The Header receives the toggle function to trigger the mobile menu. */}
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}