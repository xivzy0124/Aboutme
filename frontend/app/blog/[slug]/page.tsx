import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";

import { posts } from "@/data/posts";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return {
    title: post?.title ?? "文章",
    description: post?.summary,
  };
}

const formatDate = (iso: string) => iso.replaceAll("-", ".");

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="relative isolate">
      <div
        aria-hidden
        className="about-aura pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 opacity-60 sm:h-64"
      />

      <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="pt-6 sm:pt-10">
          <Link
            href="/blog"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg text-meta text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            全部文章
          </Link>
        </div>

        <header className="mt-5 sm:mt-6">
          <p className="text-kicker text-primary">Blog · 随笔</p>
          <h1 className="mt-3 text-display">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/80 pb-5">
            <time
              dateTime={post.publishedAt}
              className="font-mono text-meta text-muted-foreground tabular-nums"
            >
              {formatDate(post.publishedAt)}
            </time>
            {post.tags.length > 0 ? (
              <>
                <span aria-hidden className="h-3 w-px bg-border" />
                <ul className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-lg border border-border bg-muted/50 px-2 py-0.5 text-xs leading-5 text-foreground/70"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </header>

        {/* 正文：显式写排版权重，等后续接入 Tiptap 的 HTML 时只需替换内容容器 */}
        <div className="mt-8 flex flex-col gap-5">
          <p className="max-w-[62ch] text-lede text-foreground/90">{post.summary}</p>
          <p className="max-w-[68ch] text-body text-foreground/80">
            这里先把它当作排版样张：验证中文长文在窄屏与宽屏下的行长、行高和节奏，
            也顺带确认标题、标签、引用块这些元素放在一起是否协调。
          </p>

          <h2 className="mt-4 text-title">接下来会写什么</h2>
          <p className="max-w-[68ch] text-body text-foreground/80">
            主要围绕自己在做项目时真正遇到的问题：运维部署、容器化、后端接口设计， 以及 AI
            工具如何进入日常工作流。尽量写清楚背景、过程和结论，少一点正确的废话。
          </p>

          <ul className="flex max-w-[68ch] flex-col gap-2.5">
            {[
              "项目复盘：从需求到上线的完整链路",
              "运维笔记：部署、排障与自动化",
              "AI 实践：工具与工作流的组合方式",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-body text-foreground/80">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <p className="text-meta font-medium text-foreground">关于当前版本</p>
              <p className="mt-1 text-copy text-foreground/75">
                现在是纯前端阶段，文章以静态数据展示。后续全栈阶段会接入 Tiptap 编辑器， 正文以 HTML
                存入 PostgreSQL，渲染前做 Sanitization 处理。
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-5">
          <Link
            href="/blog"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg text-meta text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            返回博客
          </Link>
          <Link
            href="/projects"
            className="group inline-flex min-h-9 items-center gap-1.5 rounded-lg text-meta text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            看看项目
            <ArrowUpRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        </footer>
      </div>
    </article>
  );
}
