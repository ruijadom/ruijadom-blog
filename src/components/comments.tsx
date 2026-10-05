"use client";

import Giscus from "@giscus/react";
import { siteConfig } from "@/config/site";

export function Comments() {
  const { repo, repoId, category, categoryId } = siteConfig.comments;

  if (!categoryId) {
    return null;
  }

  return (
    <section className="mt-12">
      <Giscus
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark"
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
