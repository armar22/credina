"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard, Users, FileText, CheckSquare, Wallet, BarChart3, Package,
  UserCog, Settings, Wallet as WalletIcon, Banknote, CreditCard, FolderOpen, CalendarClock,
  Shield, X, Cog, UserRound
} from "lucide-react";

// Props for managing mobile state, passed from MainLayout
interface SidebarProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

// Reusable content component to avoid duplicating nav links
const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const pathname = usePathname() ?? "";
  const { t } = useI18n();

  const navGroups = [
    {
      label: t("overview"),
      items: [
        { title: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { title: t("reports"), href: "/reports", icon: BarChart3 },
      ],
    },
    {
      label: t("operations"),
      items: [
        { title: t("members"), href: "/members", icon: Users },
        { title: t("applications"), href: "/applications", icon: FileText },
        { title: t("fieldVerifications"), href: "/field-verifications", icon: Shield },
        { title: t("approvals"), href: "/approvals", icon: CheckSquare },
        { title: t("disbursements"), href: "/disbursements", icon: Banknote },
        { title: t("installments"), href: "/installments", icon: CalendarClock },
        { title: t("collections"), href: "/collections", icon: Wallet },
        { title: t("payments"), href: "/payments", icon: CreditCard },
        { title: t("documents"), href: "/documents", icon: FolderOpen },
      ],
    },
    {
      label: t("management"),
      items: [
        { title: t("agents"), href: "/management/agents", icon: UserRound },
        { title: t("configurations"), href: "/configurations", icon: Package },
        { title: t("settings"), href: "/settings", icon: Settings },
        { title: t("system"), href: "/system", icon: Cog },
      ],
    },
  ];

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 group" onClick={onLinkClick}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <WalletIcon className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight text-lg">Credina</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className="space-y-8 px-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-4 w-4 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {item.title}
                      {isActive && (
                        <span className="absolute left-0 h-6 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};


export function Sidebar({ isMobileMenuOpen, toggleMobileMenu }: SidebarProps) {
  // Effect to handle body scroll lock and Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleMobileMenu();
    };

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen, toggleMobileMenu]);

  return (
    <>
      {/* DESKTOP SIDEBAR (Static, always visible on medium screens and up) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/50 bg-background md:flex">
        <SidebarContent />
      </aside>

      {/* OVERLAY (Dimming effect for mobile) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* MOBILE SIDEBAR (The drawer that slides in and out) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onLinkClick={toggleMobileMenu} />
        <button
          onClick={toggleMobileMenu}
          className="absolute top-4 right-[-44px] z-50 rounded-r-full bg-background p-2 text-muted-foreground shadow-lg md:hidden"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}