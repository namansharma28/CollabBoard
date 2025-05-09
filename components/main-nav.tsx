"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  ListTodo, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings
} from "lucide-react";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Boards",
    href: "/boards",
    icon: ListTodo,
  },
  {
    title: "Notes",
    href: "/notes",
    icon: FileText,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {mainNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span className="hidden md:inline-block">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}