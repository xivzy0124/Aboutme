"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CodeXml, FolderOpen, Link2, Plus, RotateCw } from "lucide-react";

import { ProjectFormDialog } from "@/components/project-form-dialog";
import { Button } from "@/components/ui/button";
import { fetchProjects, type Project } from "@/lib/projects-api";
import { cn } from "@/lib/utils";

const linkBase =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-meta font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const linkStyles = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary:
    "border border-border bg-background text-foreground hover:border-foreground/20 hover:bg-muted",
};

/**
 * 项目列表：从后端读取数据，并承载「新增项目」弹窗。
 * 数据提交成功后直接把返回值插入列表顶部，无需整页刷新。
 */
export function ProjectShowcase() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  // 每次打开弹窗换一个 key，让表单以干净状态重新挂载
  const [dialogSession, setDialogSession] = useState(0);
  const [highlightSlug, setHighlightSlug] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const statusTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    fetchProjects(controller.signal)
      .then((projects) => {
        setItems(projects);
        setLoading(false);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "项目列表加载失败");
        setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  // 成功提示几秒后自动消失，避免长期占据版面
  useEffect(() => {
    return () => window.clearTimeout(statusTimer.current);
  }, []);

  const stats = useMemo(() => {
    const tagCount = new Set(items.flatMap((project) => project.tags)).size;
    const edges = items.flatMap((project) => project.period.split(" - ")).sort();
    return [
      { label: "项目", value: loading ? "—" : `${items.length} 个` },
      { label: "技术标签", value: loading ? "—" : `${tagCount} 项` },
      {
        label: "时间跨度",
        value: loading || edges.length === 0 ? "—" : `${edges[0]} — ${edges.at(-1)}`,
      },
    ];
  }, [items, loading]);

  const handleCreated = (project: Project) => {
    setItems((previous) => [project, ...previous]);
    setHighlightSlug(project.slug);
    setDialogOpen(false);
    setStatus(`已保存「${project.title}」，数据已写入本地数据库`);
    window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(""), 4200);
  };

  const reload = () => {
    setHighlightSlug(null);
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const openDialog = () => {
    setDialogSession((session) => session + 1);
    setDialogOpen(true);
  };

  return (
    <section aria-labelledby="project-list-heading" aria-busy={loading}>
      {/* 统计与新增入口：桌面端左右分布，窄屏纵向排列 */}
      <div className="mt-6 flex flex-col gap-4 border-t border-border/80 pt-4 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
        <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <dt className="text-meta text-muted-foreground">{stat.label}</dt>
              <dd className="font-mono text-meta font-medium text-foreground tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <Button
          type="button"
          size="lg"
          onClick={openDialog}
          className="h-10 w-full rounded-xl px-4 sm:w-auto sm:shrink-0"
        >
          <Plus aria-hidden />
          新增项目
        </Button>
      </div>

      <h2 id="project-list-heading" className="sr-only">
        项目列表
      </h2>

      <div role="status" aria-live="polite">
        {status ? <p className="mt-3 text-meta text-primary">{status}</p> : null}
      </div>

      {loading ? (
        <div aria-hidden className="mt-4 space-y-8 border-t border-border/80 pt-8">
          {[0, 1].map((row) => (
            <div key={row} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
              <div className="space-y-3">
                <div className="h-3 w-28 rounded bg-muted motion-safe:animate-pulse" />
                <div className="h-6 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
                <div className="h-4 w-full rounded bg-muted motion-safe:animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-muted motion-safe:animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-muted motion-safe:animate-pulse" />
              </div>
              <div className="space-y-3 lg:border-l lg:border-border/80 lg:pl-6">
                <div className="h-3 w-12 rounded bg-muted motion-safe:animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted motion-safe:animate-pulse" />
                <div className="h-6 w-full rounded bg-muted motion-safe:animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-dashed p-8 text-center">
          <p className="text-card-title">项目列表加载失败</p>
          <p className="mt-1.5 text-copy text-muted-foreground">{error}</p>
          <p className="mt-1 text-meta text-muted-foreground">
            请确认后端服务已启动（默认 http://localhost:8000）。
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={reload}
            className="mt-4 h-9 rounded-xl px-4"
          >
            <RotateCw aria-hidden />
            重新加载
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed p-10 text-center">
          <FolderOpen aria-hidden className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-card-title">还没有项目记录</p>
          <p className="mt-1.5 text-copy text-muted-foreground">
            记录第一个项目，之后会出现在这里。
          </p>
          <Button type="button" size="lg" onClick={openDialog} className="mt-4 h-9 rounded-xl px-4">
            <Plus aria-hidden />
            新增项目
          </Button>
        </div>
      ) : (
        /* 项目列表：左侧正文，右侧固定信息栏；窄屏时信息栏自然落到正文下方 */
        <div className="mt-4 border-t border-border/80">
          {items.map((project, index) => (
            <article
              key={project.slug}
              className={cn(
                "reveal group border-b border-border/80 py-8 sm:py-10",
                project.slug === highlightSlug &&
                  "animate-in fade-in-0 slide-in-from-top-2 duration-500",
              )}
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-meta font-medium text-primary tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="h-px w-7 bg-border" />
                    <span className="min-w-0 truncate text-meta text-muted-foreground">
                      {project.role}
                    </span>
                    {project.slug === highlightSlug ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[0.625rem] font-semibold tracking-[0.14em] text-primary uppercase">
                        New
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 text-title">{project.title}</h3>
                  <p className="mt-3 max-w-[64ch] text-copy text-muted-foreground">
                    {project.description}
                  </p>

                  <ul className="mt-5 flex flex-col gap-2.5 border-t border-border/70 pt-4">
                    {project.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex gap-3 text-copy text-foreground/80">
                        <span
                          aria-hidden
                          className="mt-[0.35rem] shrink-0 font-mono text-[0.6875rem] leading-5 font-medium text-muted-foreground tabular-nums"
                        >
                          {String(highlightIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <aside className="flex flex-col gap-5 lg:border-l lg:border-border/80 lg:pl-6">
                  <div>
                    <p className="text-kicker text-muted-foreground">周期</p>
                    <p className="mt-1.5 font-mono text-meta text-foreground tabular-nums">
                      {project.period}
                    </p>
                  </div>

                  <div>
                    <p className="text-kicker text-muted-foreground">技术栈</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="max-w-full rounded-lg border border-border bg-muted/50 px-2 py-0.5 text-xs leading-5 text-foreground/75"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.repoUrl ? (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${linkBase} ${linkStyles.primary} group/link`}
                      >
                        <CodeXml className="size-3.5 shrink-0" aria-hidden />
                        源码
                        <ArrowUpRight
                          className="size-3 shrink-0 opacity-70 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                          aria-hidden
                        />
                      </a>
                    ) : null}
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`${linkBase} ${linkStyles.secondary} group/link`}
                      >
                        <Link2 className="size-3.5 shrink-0" aria-hidden />
                        访问项目
                      </a>
                    ) : null}
                  </div>
                </aside>
              </div>
            </article>
          ))}
        </div>
      )}

      <ProjectFormDialog
        key={dialogSession}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleCreated}
      />
    </section>
  );
}
