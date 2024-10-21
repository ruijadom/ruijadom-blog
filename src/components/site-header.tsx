"use client";
import React from "react";
import Link from "next/link";
import { AlignLeft } from "lucide-react";
import { siteConfig } from "@/config/site";
import HeaderNav from "@/components/header-nav";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export default function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 bg-background px-2">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 text-primary">
            <span className="font-bold">{siteConfig.name}</span>
          </Link>
        </div>
        <div className="flex items-center space-x-5 md:space-x-6">
          <HeaderNav />
          <Button
            variant="ghost"
            className="p-0 text-primary hover:bg-transparent hover:text-primary md:hidden"
            onClick={toggleSidebar}
          >
            <>
              <AlignLeft className="size-6" />
              <span className="sr-only">Menu</span>
            </>
          </Button>
        </div>
      </div>
    </header>
  );
}
