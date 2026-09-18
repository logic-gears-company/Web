"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, MessageSquare, Settings, CreditCard,
  Key, Users, Bot, FileText, BarChart2, LogOut,
  Sparkles, ChevronRight, Zap, PenLine, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/chat", label: "AI Chat", icon: MessageSquare },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { href: "/agents", label: "AI Agents", icon: Bot },
      { href: "/content", label: "Content Studio", icon: PenLine },
      { href: "/automation", label: "Automation", icon: Zap },
      { href: "/playground", label: "Playground", icon: Sparkles },
      { href: "/files", label: "Knowledge Base", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/api-keys", label: "API Keys", icon: Key },
      { href: "/team", label: "Team", icon: Users },
    ],
  },
];

const ADMIN_ITEMS = [
  { href: "/admin", label: "Overview", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();

  function NavItem({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {active && <ChevronRight className="h-3 w-3 opacity-40" />}
      </Link>
    );
  }

  return (
    <div className="flex h-full w-56 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-sidebar-border flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sidebar-foreground truncate">
          {process.env.NEXT_PUBLIC_APP_NAME ?? "AXIS"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i} className="space-y-0.5">
            {section.label && (
              <p className="px-3 text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-widest mb-1">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        ))}

        {isAdmin && (
          <div className="space-y-0.5">
            <Separator className="bg-sidebar-border mb-3" />
            <p className="px-3 text-[10px] font-semibold text-sidebar-foreground/35 uppercase tracking-widest mb-1">
              Admin
            </p>
            {ADMIN_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        )}
      </nav>

      {/* Sign out */}
      <div className="p-2 border-t border-sidebar-border flex-shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-9"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
