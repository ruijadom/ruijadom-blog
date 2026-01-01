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
  useSidebar,
} from "@/components/ui/sidebar";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const segment = useSelectedLayoutSegment();
  const { setOpenMobile } = useSidebar();

  const handlePlayClick = () => {
    // Close sidebar
    setOpenMobile(false);
    // Trigger play button
    setTimeout(() => {
      const playButton = document.getElementById('play-game-button');
      if (playButton) {
        playButton.click();
      }
    }, 100);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>@ruijadom</SidebarGroupLabel>
          <SidebarGroupContent className="mt-14">
            <SidebarMenu className="space-y-2">
              {NAV_LIST.map(({ label, path, icon: Icon }) => {
                const isPlayButton = path === "/#play";
                
                return (
                  <SidebarMenuItem
                    key={label + path}
                    className={cn(
                      "font-norma hover:text-primary transition-colors flex items-center",
                      `/${segment}` === path
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {isPlayButton ? (
                      <SidebarMenuButton onClick={handlePlayClick}>
                        <span className="text-3xl">{label}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild>
                        <a href={path}>
                          <span className="text-3xl">{label}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
