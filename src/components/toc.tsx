"use client";

import React, { useEffect } from "react";
import tocbot from "tocbot";

export const Toc = () => {
  useEffect(() => {
    tocbot.init({
      tocSelector: ".js-toc",
      contentSelector: ".js-toc-content",
      headingSelector: "h1, h2, h3, h4",
      hasInnerContainers: true,
      collapseDepth: 0,
      scrollSmooth: true,
      scrollSmoothOffset: -20,
      scrollSmoothDuration: 420,
      orderedList: true,
      headingsOffset: 30,
    });
    return () => tocbot.destroy();
  }, []);

  return (
    <div className="js-toc sticky top-1/2 ml-8 hidden w-64 -translate-y-1/2 break-words xl:block"></div>
  );
};
