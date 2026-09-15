"use client";
import { useState } from "react";
import { Search, X } from "lucide-react";
import ArticleCard, { ArticleSummary } from "@/components/article-card";
import s from "@/styles/site.module.css";
export default function ArticleList({
  articles,
}: {
  articles: ArticleSummary[];
}) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase();
  const visible = articles.filter((article) =>
    `${article.title} ${article.description}`
      .toLocaleLowerCase()
      .includes(search),
  );
  return (
    <>
      <div className={s.listTools}>
        <p role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? "article" : "articles"}
          {search ? " found" : " · Latest first"}
        </p>
        <div className={s.search}>
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search articles"
            placeholder="Search the field notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {visible.length ? (
        <div className={s.articleGrid}>
          {visible.map((article, index) => (
            <ArticleCard key={article.slug} article={article} index={index} />
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <Search size={28} />
          <h2>
            {articles.length
              ? "No matching articles."
              : "The next chapter is on its way."}
          </h2>
          <p>
            {articles.length
              ? "Try a different keyword or clear your search."
              : "Check back for new notes on frontend engineering."}
          </p>
          {query && (
            <button className={s.secondary} onClick={() => setQuery("")}>
              Clear search
            </button>
          )}
        </div>
      )}
    </>
  );
}
