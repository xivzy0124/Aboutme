import type { Metadata } from "next";
import { ArrowUpRight, GitBranch } from "lucide-react";

import { ProjectShowcase } from "@/components/project-showcase";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "项目",
  description:
    "赵晓威的项目实践：智能体态分析与步态矫正系统、VCore 轻量化 Linux 运维工具、CI/CD 容器化自动部署系统，并支持在页面内新增项目记录。",
};

const githubUrl =
  site.socialLinks.find((link) => link.label === "GitHub")?.url ?? "https://github.com";

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
            从端侧数据采集到服务器运维，再到一条自动化的交付流水线。这里记录每个项目的背景、承担角色与关键结果，
            新增的项目会直接写入数据库并即时出现在列表中。
          </p>
        </header>

        {/* 列表、统计与新增入口都在客户端组件里，数据来源于后端接口 */}
        <ProjectShowcase />

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
              除了上面列出的项目，日常的脚本、练习与实验也都放在 GitHub 上，欢迎随手翻翻。
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
