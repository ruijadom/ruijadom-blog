import React from "react";
import { Metadata } from "next";
import { blogs as allBlogs } from "#site/content";
import { cn, formatDate } from "@/lib/utils";
import "@/styles/mdx.css";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Mdx } from "@/components/mdx-component";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface BlogPageItemProps {
  params: {
    slug: string[];
  };
}

async function getBlogFromParams(params: BlogPageItemProps["params"]) {
  const slug = params?.slug.join("/");
  const blog = allBlogs.find((blog) => blog.slugAsParams === slug);

  if (!blog) {
    return null;
  }

  return blog;
}

export async function generateMetadata({
  params,
}: BlogPageItemProps): Promise<Metadata> {
  const blog = await getBlogFromParams(params);

  if (!blog) {
    return {};
  }

  return {
    title: blog.title,
    description: blog.description,
    authors: {
      name: blog.author,
    },
  };
}

export async function generateStaticParams(): Promise<
  BlogPageItemProps["params"][]
> {
  return allBlogs.map((blog) => ({
    slug: blog.slugAsParams.split("/"),
  }));
}

export default async function BlogPageItem({ params }: BlogPageItemProps) {
  const blog = await getBlogFromParams(params);

  if (!blog) {
    return {};
  }

  return (
    <article className="container relative max-w-3xl py-6 lg:py-10">
      <div>
        {blog.date && (
          <time
            dateTime={blog.date}
            className="block text-sm text-muted-foreground"
          >
            Published on {formatDate(blog.date)}
          </time>
        )}

        <h1 className="mt-2 inline-block text-4xl font-bold capitalize leading-tight text-white lg:text-4xl">
          {blog.title}
        </h1>

        {blog.author && (
          <div className="mt-4 flex space-x-4">
            <Image
              src={siteConfig.authorImage}
              alt={blog.author}
              className="size-9 rounded-full bg-white object-cover "
            />

            <div className="flex-1 text-left leading-tight">
              <p className="font-medium">{blog.author}</p>
              <p className="text-[12px] text-muted-foreground">
                @{blog.author}
              </p>
            </div>
          </div>
        )}

        <div className="mt-14" />
        <Mdx code={blog.body} />
        <hr className="mt-12" />

        <div className="flex justify-center py-6 lg:py-10">
          <Link
            href="/blog"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            <ChevronLeft className="mr-2 size-4" />
            See all Articles
          </Link>
        </div>
      </div>
    </article>
  );
}
