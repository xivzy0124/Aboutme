import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { PostContent } from "@/components/post-content";
import { fetchServerPost } from "@/lib/server-api";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchServerPost(slug);
  return {
    title: post?.title ?? "文章",
    description: post?.summary,
  };
}

const formatDate = (iso: string) => iso.replaceAll("-", ".");

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await fetchServerPost(slug);
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

        {/* 正文由管理后台维护，按空行分段渲染；摘要作为导语单独展示 */}
        <p className="mt-8 max-w-[62ch] text-lede text-foreground/90">{post.summary}</p>
        <PostContent content={post.content} />

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
