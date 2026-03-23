"use client";

import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "./UserProfile";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { LanguageSwitcher } from "./LanguageSwitcher";

// This prop is required for mobile responsiveness
interface HeaderProps {
  toggleMobileMenu: () => void;
}

export function Header({ toggleMobileMenu }: HeaderProps) {
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Mobile Menu Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden shrink-0"
          onClick={toggleMobileMenu}
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Search */}
        <div className="flex-1 hidden md:flex items-center max-w-md">
           <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members, applications..."
              className="w-full bg-muted/50 border-none pl-9 focus-visible:ring-1 shadow-none rounded-full"
            />
          </div>
        </div>
        
        {/* Right-side Actions */}
        <div className="flex flex-1 items-center justify-end space-x-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications Dropdown (Decoupled) */}
          <NotificationsDropdown />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Divider */}
          <div className="h-6 w-px bg-border mx-1 hidden md:block" />

          {/* User Profile (Decoupled) */}
          <UserProfile />
        </div>
      </div>
    </header>
  );
}