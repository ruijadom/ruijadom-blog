import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import ArticleList from "@/components/article-list";
import { blogs as allBlogs } from "#site/content";
import s from "@/styles/site.module.css";
export const metadata: Metadata = { title: "Blog" };
export default function BlogPage() {
  const articles = allBlogs
    .filter((blog) => blog.published)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .map(({ title, slug, date, description }) => ({
      title,
      slug,
      date,
      description,
    }));
  return (
    <div className={s.page}>
      <PageHeader
        title="Field notes"
        description="Ideas, experiments and lessons from building interfaces that last."
      />
      <ArticleList articles={articles} />
    </div>
  );
}
