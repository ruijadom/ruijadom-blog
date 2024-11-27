"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlignLeft } from "lucide-react";
import { siteConfig } from "@/config/site";
import HeaderNav from "@/components/header-nav";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname, useParams } from "next/navigation";
import { blogs as allBlogs } from "#site/content";
import { motion, AnimatePresence } from "framer-motion";

export default function SiteHeader() {
  const [showTitle, setShowTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [isBlogPage, setIsBlogPage] = useState(false);
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { slug } = useParams();

  useEffect(() => {
    console.log(pathname);
    setIsBlogPage(pathname?.startsWith("/blog/"));
  }, [pathname]);

  useEffect(() => {
    if (isBlogPage && slug) {
      const currentBlog = allBlogs
        .filter((blog) => blog.published)
        .find((blog) => blog.slugAsParams === slug[0]);
      setCurrentTitle(currentBlog?.title || "");
    }
  }, [isBlogPage, slug]);

  useEffect(() => {
    if (!isBlogPage) {
      setShowTitle(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowTitle(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    const blogTitle = document.querySelector("[data-blog-time]");
    if (blogTitle) {
      observer.observe(blogTitle);
    }

    return () => {
      if (blogTitle) {
        observer.unobserve(blogTitle);
      }
    };
  }, [isBlogPage]);

  return (
    <header className="sticky top-0 z-40 bg-background px-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 text-primary">
            <span className="font-bold">{siteConfig.name}</span>
          </Link>
        </div>
        <AnimatePresence>
          {currentTitle && showTitle && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="container relative hidden w-full truncate  font-bold sm:block lg:max-w-3xl lg:px-6"
            >
              {currentTitle}
            </motion.div>
          )}
        </AnimatePresence>

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
