"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_LIST } from "@/constants";
import s from "@/styles/site.module.css";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState("");
  useEffect(() => {
    setOpen(false);
    setReading("");
    if (!pathname.startsWith("/blog/")) return;
    const title = document.querySelector("article h1");
    if (!title) return;
    const observer = new IntersectionObserver(([entry]) =>
      setReading(entry.isIntersecting ? "" : title.textContent || ""),
    );
    observer.observe(title);
    return () => observer.disconnect();
  }, [pathname]);
  return (
    <header
      className={s.header}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          document.getElementById("mobile-menu-toggle")?.focus();
        }
      }}
    >
      <div className={s.headerInner}>
        <Link href="/" className={s.wordmark} aria-label="Ruijadom home">
          <Image
            src="/icon.ico"
            alt=""
            width={28}
            height={28}
            unoptimized
            className={s.brandIcon}
          />{" "}
          ruijadom
          <span className={s.markDot}>.</span>
        </Link>
        <span className={s.reading}>
          {reading || "FRONTEND ENGINEERING & EXPLORATION"}
        </span>
        <nav className={s.desktopNav} aria-label="Main navigation">
          {NAV_LIST.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              aria-current={
                pathname === item.path || pathname.startsWith(item.path + "/")
                  ? "page"
                  : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/game" className={s.gameLink}>
          Dev Space <ArrowUpRight size={15} />
        </Link>
        <button
          id="mobile-menu-toggle"
          className={s.menuToggle}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className={s.mobileNav}
          aria-label="Mobile navigation"
        >
          {[
            { label: "Home", path: "/" },
            ...NAV_LIST,
            { label: "Play Dev Space", path: "/game" },
          ].map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.path ? "page" : undefined}
            >
              {item.label}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
