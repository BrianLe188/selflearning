"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth-actions";
import { siteConfig } from "@/site.config";

/** Add new sections here as the admin grows (media library, subscribers, …). */
const navItems = [
  { title: "Posts", href: "/admin", icon: FileText },
  { title: "Courses", href: "/admin/courses", icon: GraduationCap },
];

export function AppSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin" />}>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {siteConfig.name.charAt(0)}
              </span>
              <span className="truncate font-semibold">{siteConfig.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex min-w-0 flex-col gap-2 px-1 py-1 group-data-[collapsible=icon]:hidden">
          <span className="truncate text-xs text-sidebar-foreground/70">
            {userEmail}
          </span>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-auto w-full rounded-md border-border px-3 py-1.5 text-sm"
            >
              Sign out
            </Button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
