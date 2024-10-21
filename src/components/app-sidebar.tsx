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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>@ruijadom</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_LIST.map((item) => (
                <SidebarMenuItem key={item.label + item.path}>
                  <SidebarMenuButton asChild>
                    <a href={item.path}>
                      <item.icon />
                      <span>{item.label}</span>
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
