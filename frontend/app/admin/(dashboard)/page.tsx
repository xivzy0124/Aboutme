import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, FolderKanban, ShieldCheck } from "lucide-react";

import { fetchServerPosts, fetchServerProjects } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

/** 概览页：展示数据量并作为项目 / 博客管理的入口。 */
export default async function AdminDashboardPage() {
  const [projects, posts] = await Promise.all([fetchServerProjects(), fetchServerPosts()]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/projects"
          className="group flex flex-col rounded-2xl border border-border bg-card/70 p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderKanban className="size-5" aria-hidden />
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 text-muted-foreground transition-transform duration-200 ease-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
          <h2 className="mt-4 text-card-title">项目管理</h2>
          <p className="mt-1.5 text-copy text-muted-foreground">
            编辑或删除公开项目页中的条目，修改即时生效。
          </p>
          <p className="mt-3 font-mono text-meta text-foreground tabular-nums">
            {projects.length} 个项目
          </p>
        </Link>

        <Link
          href="/admin/blog"
          className="group flex flex-col rounded-2xl border border-border bg-card/70 p-5 transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" aria-hidden />
            </span>
            <ArrowUpRight
              aria-hidden
              className="size-4 text-muted-foreground transition-transform duration-200 ease-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </div>
          <h2 className="mt-4 text-card-title">博客管理</h2>
          <p className="mt-1.5 text-copy text-muted-foreground">
            撰写、编辑或删除文章；正文按空行分段，支持二级标题与列表。
          </p>
          <p className="mt-3 font-mono text-meta text-foreground tabular-nums">
            {posts.length} 篇文章
          </p>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <p className="text-meta font-medium text-foreground">登录态说明</p>
            <ul className="mt-2 space-y-1.5 text-copy text-muted-foreground">
              <li>会话保存在 HttpOnly Cookie 中，页面脚本无法读取，避免 XSS 窃取。</li>
              <li>有操作时自动续期 2 小时，会话总时长不超过 12 小时，退出即失效。</li>
              <li>所有写接口在服务端校验会话，未登录请求返回 401 并引导登录。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
