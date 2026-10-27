import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, PenLine } from "lucide-react";

import { posts } from "@/data/posts";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "博客",
  description: "赵晓威的技术笔记、项目复盘与日常踩坑记录。",
};

/** 列表按发布时间倒序；日期统一换成 2026.10.27 这种更易扫读的写法。 */
const sortedPosts = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const formatDate = (iso: string) => iso.replaceAll("-", ".");
const emailUrl = site.socialLinks.find((link) => link.url.startsWith("mailto:"))?.url;

export default function BlogPage() {
  return (
    <div className="relative isolate">
      <div
        aria-hidden
        className="about-aura pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 opacity-70 sm:h-72"
      />

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <header className="pt-8 sm:pt-12 lg:pt-14">
          <p className="text-kicker text-primary">Blog · 博客</p>
          <h1 className="mt-3 text-display">记录与复盘</h1>
          <p className="mt-4 max-w-[58ch] text-body text-foreground/80">
            技术笔记、项目复盘和日常踩坑。写作是为了把经验沉淀下来，也方便以后回头对照。
          </p>

          <dl className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-border/80 pt-4">
            <div className="flex items-baseline gap-2">
              <dt className="text-meta text-muted-foreground">文章</dt>
              <dd className="font-mono text-meta font-medium text-foreground tabular-nums">
                {sortedPosts.length} 篇
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-meta text-muted-foreground">状态</dt>
              <dd className="text-meta font-medium text-foreground">持续更新</dd>
            </div>
          </dl>
        </header>

        {sortedPosts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed bg-card/60 p-10 text-center">
            <PenLine className="mx-auto size-5 text-muted-foreground" aria-hidden />
            <p className="mt-3 text-card-title">第一篇文章正在路上</p>
            <p className="mt-1.5 text-copy text-muted-foreground">
              等把手头的项目复盘写完，就会出现在这里。
            </p>
          </div>
        ) : (
          /* 文章列表：日期成列、标题与摘要为主，最新一篇放大半级 */
          <div className="mt-10 border-t border-border/80">
            {sortedPosts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="reveal group grid gap-2.5 border-b border-border/80 py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[7rem_minmax(0,1fr)_1.5rem] sm:items-start sm:gap-6 sm:py-7"
              >
                <div className="flex items-center gap-2.5 sm:block sm:pt-1">
                  <time
                    dateTime={post.publishedAt}
                    className="font-mono text-meta text-muted-foreground tabular-nums"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                  {index === 0 ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] leading-5 font-medium text-primary ring-1 ring-primary/15 ring-inset sm:mt-1.5 sm:inline-flex">
                      最新
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <h2
                    className={cn(
                      "transition-colors duration-200 group-hover:text-primary",
                      index === 0 ? "text-title" : "text-card-title",
                    )}
                  >
                    {post.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 max-w-[64ch] text-copy text-muted-foreground">
                    {post.summary}
                  </p>
                  {post.tags.length > 0 ? (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-lg border border-border bg-muted/50 px-2 py-0.5 text-xs leading-5 text-foreground/70"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <ArrowUpRight
                  aria-hidden
                  className="hidden size-4 text-muted-foreground opacity-0 transition duration-200 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:block sm:pt-1"
                />
              </Link>
            ))}
          </div>
        )}

        {emailUrl ? (
          <p className="reveal mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground">
            对某篇文章有想法？
            <a
              href={emailUrl}
              className="inline-flex items-center gap-1 rounded text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <Mail className="size-3.5" aria-hidden />
              写信聊聊
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
