"use client";

import s from "@/styles/site.module.css";
import { useEffect } from "react";
import tocbot from "tocbot";

export function TableOfContents() {
  useEffect(() => {
    tocbot.init({
      tocSelector: ".toc",
      contentSelector: "article",
      headingSelector: "h2, h3",
      hasInnerContainers: true,
      headingsOffset: 80,
      scrollSmoothOffset: -80,
      collapseDepth: 6,
    });

    return () => tocbot.destroy();
  }, []);

  return (
    <aside className={s.tocRail} aria-label="Article contents">
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="mb-4 text-sm font-semibold text-foreground">
          On This Page
        </h4>
        <nav className="toc text-sm" />
      </div>
    </aside>
  );
}
