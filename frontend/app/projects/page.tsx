import type { Metadata } from "next";
import { ArrowUpRight, CodeXml, GitBranch, Link2 } from "lucide-react";

import { projects } from "@/data/projects";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "项目",
  description:
    "赵晓威的项目实践：智能体态分析与步态矫正系统、VCore 轻量化 Linux 运维工具、CI/CD 容器化自动部署系统。",
};

/** 时间跨度直接从数据里取起止月份，避免手写年份和项目数据脱节。 */
const periodEdges = projects
  .flatMap((project) => project.period.split(" - ").map((edge) => edge.trim()))
  .sort();
const periodRange = `${periodEdges[0]} — ${periodEdges.at(-1)}`;

const techCount = new Set(projects.flatMap((project) => project.tags)).size;

const githubUrl =
  site.socialLinks.find((link) => link.label === "GitHub")?.url ?? "https://github.com";

const stats = [
  { label: "项目", value: String(projects.length), suffix: "个" },
  { label: "技术标签", value: String(techCount), suffix: "项" },
  { label: "时间跨度", value: periodRange, suffix: "" },
];

const linkBase =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-meta font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const linkStyles = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary:
    "border border-border bg-background text-foreground hover:border-foreground/20 hover:bg-muted",
};

export default function ProjectsPage() {
  return (
    <div className="relative isolate">
      {/* 与关于页相同的顶部氛围光：纯渐变绘制，不触发移动端额外绘制成本 */}
      <div
        aria-hidden
        className="about-aura pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 opacity-70 sm:h-72"
      />

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <header className="pt-8 sm:pt-12 lg:pt-14">
          <p className="text-kicker text-primary">Projects · 项目</p>
          <h1 className="mt-3 max-w-[16ch] text-display">把想法做成能跑起来的系统</h1>
          <p className="mt-4 max-w-[62ch] text-body text-foreground/80">
            三段完整的工程实践：从鸿蒙端的数据采集，到服务器侧的运维工具，再到一条自动化的交付流水线。
            每一项都覆盖需求拆解、架构设计与部署落地。
          </p>

          <dl className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-t border-border/80 pt-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <dt className="text-meta text-muted-foreground">{stat.label}</dt>
                <dd className="font-mono text-meta font-medium text-foreground tabular-nums">
                  {stat.value}
                  {stat.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {/* 项目列表：左侧正文，右侧固定信息栏；窄屏时信息栏自然落到正文下方 */}
        <div className="mt-4 border-t border-border/80 sm:mt-6">
          {projects.map((project, index) => (
            <article
              key={project.slug}
              className="reveal group border-b border-border/80 py-8 sm:py-10"
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
                  </div>

                  <h2 className="mt-3 text-title">{project.title}</h2>
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

        {/* 收尾行动：把视线引到持续更新的 GitHub */}
        <section className="reveal pt-12 sm:pt-16">
          <div className="relative isolate overflow-hidden rounded-3xl border bg-card p-6 sm:p-8">
            <div
              aria-hidden
              className="about-aura pointer-events-none absolute -right-12 -bottom-24 -z-10 size-64"
            />
            <p className="text-kicker text-primary">More</p>
            <h2 className="mt-2 text-title">项目还在继续，更多实验在 GitHub</h2>
            <p className="mt-2 max-w-[46ch] text-copy text-foreground/80">
              除了上面三个完整项目，日常的脚本、练习与实验也都放在 GitHub 上，欢迎随手翻翻。
            </p>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={`${linkBase} ${linkStyles.primary} group/link mt-5`}
            >
              <GitBranch className="size-4 shrink-0" aria-hidden />
              打开 GitHub
              <ArrowUpRight
                className="size-3.5 shrink-0 opacity-70 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                aria-hidden
              />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
