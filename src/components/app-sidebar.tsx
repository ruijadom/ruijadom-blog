"use client";
import { NAV_LIST } from "@/constants";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const segment = useSelectedLayoutSegment();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>@ruijadom</SidebarGroupLabel>
          <SidebarGroupContent className="mt-14">
            <SidebarMenu className="space-y-2">
              {NAV_LIST.map(({ label, path, icon: Icon }) => (
                <SidebarMenuItem
                  key={label + path}
                  className={cn(
                    "font-normal hover:text-primary transition-colors flex items-center",
                    `/${segment}` === path
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <SidebarMenuButton asChild>
                    <a href={path}>
                      <span className="text-3xl">{label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
