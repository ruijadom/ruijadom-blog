/* eslint-disable tailwindcss/no-custom-classname */
import React from "react";
import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { blogs as allBlogs } from "#site/content";
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
    <main className="container max-w-4xl py-6 lg:py-10">
      <PageHeader
        title="Blog"
        description="Let`s dive in and explore the exciting world of frontend development"
      />
      <hr className="my-8" />

      {blogs.length ? (
        <section className="space-y-8">
          {blogs.map((blog) => (
            <Spotlight className="group" key={blog.slug}>
              <Link href={blog.slug} className="block rounded-2xl">
                <SpotlightCard>
                  <div className="relative z-20 size-full overflow-hidden rounded-[inherit] bg-background p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {/* Radial gradient */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/2 -translate-x-1/2 translate-y-1/2"
                      aria-hidden="true"
                    >
                      <div className="translate-z-0 absolute inset-0 rounded-full bg-accent/50 blur-[80px]"></div>
                    </div>

                    <div className="flex min-h-20 flex-col justify-around gap-4">
                      {blog.title && (
                        <h2 className="text-2xl font-semibold text-white">
                          {blog.title}
                        </h2>
                      )}
                      {blog.date && (
                        <p className="text-sm text-muted-foreground/60">
                          {formatDate(blog.date)}
                        </p>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            </Spotlight>
          ))}
        </section>
      ) : (
        <p>No Blogs found</p>
      )}
    </main>
  );
}
