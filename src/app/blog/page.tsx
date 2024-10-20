import React from "react";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { blogs as allBlogs } from "#site/content";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import Spotlight, { SpotlightCard } from "@/components/ui/spotlight";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const blogs = allBlogs
    .filter((blog) => blog.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <PageHeader
        title="Blog"
        description="Let`s dive in and explore the exciting world of frontend development"
      />
      <hr className="my-8" />

      {blogs.length ? (
        <div className="space-y-8">
          {blogs.map((blog) => (
            <Spotlight className="group" key={blog.slug}>
              <SpotlightCard>
                <article className="relative z-20 size-full cursor-pointer overflow-hidden rounded-[inherit] bg-background p-4">
                  {/* Radial gradient */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/2 -translate-x-1/2 translate-y-1/2"
                    aria-hidden="true"
                  >
                    <div className="translate-z-0 absolute inset-0 rounded-full bg-accent/50 blur-[80px]"></div>
                  </div>

                  <div className="flex flex-col min-h-20 justify-around gap-4">
                    {blog.title && (
                      <h5 className="text-2xl font-extrabold text-primary">
                        {blog.title}
                      </h5>
                    )}
                    {blog.date && (
                      <p className="text-sm text-muted-foreground/60">
                        {formatDate(blog.date)}
                      </p>
                    )}
                  </div>

                  <Link href={blog.slug} className="absolute inset-0">
                    <span className="sr-only">View Article</span>
                  </Link>
                </article>
              </SpotlightCard>
            </Spotlight>
          ))}
        </div>
      ) : (
        <p>No Blogs found</p>
      )}
    </div>
  );
}
