import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import s from "@/styles/site.module.css";
export interface ArticleSummary {
  title: string;
  slug: string;
  date: string;
  description: string;
}
export default function ArticleCard({
  article,
  index = 0,
}: {
  article: ArticleSummary;
  index?: number;
}) {
  return (
    <Link
      className={s.articleCard}
      href={`/${article.slug.replace(/^\//, "")}`}
    >
      <div className={s.cardMeta}>
        <span>FIELD NOTES / {String(index + 1).padStart(2, "0")}</span>
        <ArrowUpRight size={19} />
      </div>
      <h2>{article.title}</h2>
      <p>{article.description}</p>
      <div className={s.cardBottom}>
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <span>
          Read article <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
