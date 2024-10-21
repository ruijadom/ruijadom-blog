import React, { PropsWithChildren } from "react";
import SiteHeader from "@/components/site-header";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Particles from "@/components/particles";

export default function App({ children }: PropsWithChildren) {
  return (
    <SidebarProvider className="grid w-full">
      <div className="flex min-h-screen flex-col space-y-6">
        <SiteHeader />
        <div className="absolute">
          <AppSidebar />
        </div>

        <main className="container flex-1">
          <Particles
            className="animate-fade-in absolute inset-0 -z-10"
            quantity={100}
          />
          {children}
        </main>

        <footer className=" container border-t border-t-secondary/60 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2024 Created by{" "}
            <Link
              target="_blank"
              rel="noreferrer"
              href={siteConfig.social.github}
              className="text-primary"
            >
              {siteConfig.author}
            </Link>{" "}
          </p>
        </footer>
      </div>
    </SidebarProvider>
  );
}
