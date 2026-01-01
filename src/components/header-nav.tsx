"use client";
import React from "react";
import { NAV_LIST } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export default function HeaderNav() {
  const segment = useSelectedLayoutSegment();
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const playButton = document.getElementById('play-game-button');
    if (playButton) {
      playButton.click();
    }
  };
  
  return (
    <nav className="hidden items-center gap-6 md:flex">
      {NAV_LIST.map((item) => {
        const isPlayButton = item.path === "/#play";
        
        if (isPlayButton) {
          return (
            <button
              key={item.label + item.path}
              onClick={handlePlayClick}
              className={cn(
                "font-normal hover:text-primary transition-colors flex items-center text-muted-foreground"
              )}
            >
              <span>{item.label}</span>
            </button>
          );
        }
        
        return (
          <Link
            key={item.label + item.path}
            href={item.path}
            className={cn(
              " font-normal hover:text-primary transition-colors flex items-center",
              `/${segment}` === item.path
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
