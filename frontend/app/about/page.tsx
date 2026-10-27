import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  Briefcase,
  Code,
  Container,
  GitBranch,
  Globe,
  GraduationCap,
  Mail,
  Phone,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import { about } from "@/data/about";
import { site, type SocialLink } from "@/data/site";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  数据派生：全部从 data/about.ts 与 data/site.ts 计算，不重复维护文案           */
/* -------------------------------------------------------------------------- */

const nationalAwards = about.awards.filter((award) => award.level === "国家级").length;
const provincialAwards = about.awards.filter((award) => award.level === "省级").length;

const heroStats = [
  { label: "国家级", suffix: "项", value: String(nationalAwards) },
  { label: "省级", suffix: "项", value: String(provincialAwards) },
  { label: "获奖总计", suffix: "项", value: String(about.awards.length) },
];

export const metadata: Metadata = {
  title: "关于我",
  description: `${about.name}的个人介绍：软件开发 / 运维 DevOps 双方向，具备全栈项目开发与服务器部署经验，获国家级奖项 ${nationalAwards} 项、省级奖项 ${provincialAwards} 项。`,
};

/** 联系方式按「邮件 → GitHub → 个人博客 → 电话」的优先级排列，邮件作为主行动按钮。 */
const contactPriority = ["Email", "GitHub", "个人博客", "Phone"];

const contacts = [...site.socialLinks].sort(
  (a, b) => contactPriority.indexOf(a.label) - contactPriority.indexOf(b.label),
);

const contactIcons: Record<string, LucideIcon> = {
  GitHub: Code,
  Email: Mail,
  Phone: Phone,
  个人博客: Globe,
};

/** 把 href 还原成人类可读文案：邮箱显示完整地址，电话按 3-4-4 分组。 */
function contactText(link: SocialLink) {
  if (link.url.startsWith("mailto:")) {
    return link.url.slice("mailto:".length);
  }
  if (link.url.startsWith("tel:")) {
    const digits = link.url.slice("tel:".length);
    return digits.length === 11
      ? `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
      : digits;
  }
  return link.label;
}

/**
 * 「个人优势」在数据里是「短标题：具体说明」的写法，在卡片里拆成标题 + 正文，
 * 只有冒号出现在前 14 个字符内才拆，避免把句中的冒号误判成标题分隔符。
 */
const strengths = about.highlights.map((item) => {
  const separator = item.indexOf("：");
  if (separator > 0 && separator <= 14) {
    return { title: item.slice(0, separator), description: item.slice(separator + 1).trim() };
  }
  return { title: "", description: item };
});

const skillIcons: Record<string, LucideIcon> = {
  系统与自动化: Terminal,
  "容器化与编排": Container,
  运维开发: Code,
  流水线与监控: GitBranch,
  人工智能工具: Sparkles,
};

const awardStyles: Record<string, string> = {
  国家级: "bg-primary text-primary-foreground",
  省级: "bg-primary/10 text-primary ring-1 ring-primary/20 ring-inset",
  校级: "bg-muted text-foreground/70 ring-1 ring-border ring-inset",
};

const buttonBase =
  "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl px-3.5 text-ui font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4";

const buttonStyles = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  secondary:
    "border border-border bg-background text-foreground hover:border-foreground/20 hover:bg-muted",
};

/* -------------------------------------------------------------------------- */
/*  局部组件                                                                    */
/* -------------------------------------------------------------------------- */

function ContactActions({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-2 sm:flex sm:flex-wrap sm:items-center", className)}>
      {contacts.map((link) => {
        const Icon = contactIcons[link.label] ?? Sparkles;
        const isExternal = link.url.startsWith("http");
        const isPrimary = link.label === "Email";
        const text = contactText(link);

        return (
          <a
            key={link.label}
            href={link.url}
            title={text}
            {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
            className={cn(
              buttonBase,
              "group",
              isPrimary ? buttonStyles.primary : buttonStyles.secondary,
              /* 邮箱地址较长，窄屏下略降字号，保证 320px 视口也能完整显示 */
              isPrimary && "text-[0.8125rem] sm:text-ui",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{text}</span>
            {isExternal ? (
              <ArrowUpRight
                className="hidden size-3.5 shrink-0 opacity-50 transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
                aria-hidden
              />
            ) : null}
          </a>
        );
      })}
    </div>
  );
}

function SectionHeading({ index, title, meta }: { index: string; title: string; meta?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 border-b border-border/80 pb-3">
      <div className="flex items-baseline gap-2.5">
        <span
          aria-hidden
          className="font-mono text-xs font-medium tracking-[0.18em] text-muted-foreground tabular-nums"
        >
          {index}
        </span>
        <h2 className="text-title">{title}</h2>
      </div>
      {meta ? (
        <span className="shrink-0 pb-0.5 text-meta text-muted-foreground">{meta}</span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  页面                                                                       */
/* -------------------------------------------------------------------------- */

export default function AboutPage() {
  const emailLink = contacts.find((link) => link.label === "Email");
  const phoneLink = contacts.find((link) => link.label === "Phone");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.name,
    jobTitle: "软件开发 / 运维 DevOps",
    description: about.summary,
    email: emailLink?.url.replace(/^mailto:/, ""),
    telephone: phoneLink?.url.replace(/^tel:/, ""),
    sameAs: site.socialLinks.filter((link) => link.url.startsWith("http")).map((link) => link.url),
    alumniOf: {
      "@type": "EducationalOrganization",
      name: about.education.school,
    },
    award: about.awards.map((award) =>
      [award.year, award.name, award.result].filter(Boolean).join(" · "),
    ),
  };

  return (
    <div className="relative isolate">
      {/* 顶部氛围光：纯径向渐变，不依赖 blur 滤镜，移动端也不会额外掉帧 */}
      <div
        aria-hidden
        className="about-aura pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 opacity-70 sm:h-72"
      />

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        {/* 个人名片 */}
        <header className="pt-8 sm:pt-12 lg:pt-14">
          <div className="relative isolate overflow-hidden rounded-3xl border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div
              aria-hidden
              className="about-aura pointer-events-none absolute -top-24 -right-16 -z-10 size-64 sm:size-80"
            />

            <div className="grid lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                  {/* 证件照：5:7 竖图裁成方形头像，object-position 上移让面部居中 */}
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border ring-inset shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)] sm:size-24">
                    <Image
                      src="/avatar.png"
                      alt={`${about.name}的证件照`}
                      width={1280}
                      height={1792}
                      priority
                      sizes="(min-width: 640px) 6rem, 5rem"
                      className="size-full object-cover object-[50%_18%]"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-kicker text-primary">About · 个人简介</p>
                    <h1 className="mt-1.5 text-display">{about.name}</h1>
                    <p className="mt-1 text-lede text-muted-foreground">软件开发 / 运维 DevOps</p>
                  </div>
                </div>

                <p className="mt-5 max-w-[64ch] text-body text-foreground/80 sm:mt-6">
                  {about.summary}
                </p>

                <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                  {about.basicInfo.split(" · ").map((info) => (
                    <li
                      key={info}
                      className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-meta text-foreground/75"
                    >
                      {info}
                    </li>
                  ))}
                  <li className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-meta text-primary">
                    {about.education.school}
                  </li>
                </ul>

                <ContactActions className="mt-5 sm:mt-6" />
              </div>

              <dl className="grid grid-cols-3 divide-x divide-border/80 border-t bg-muted/30 lg:grid-cols-1 lg:grid-rows-3 lg:divide-x-0 lg:divide-y lg:border-t-0 lg:border-l">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex min-w-0 flex-col justify-center px-3 py-4 sm:px-5 lg:px-6 lg:py-4"
                  >
                    <dt className="truncate text-meta text-muted-foreground">
                      {stat.label}
                      <span className="sr-only">奖项数量</span>
                    </dt>
                    <dd className="mt-1 flex items-baseline gap-1">
                      <span className="text-stat tabular-nums">{stat.value}</span>
                      <span className="text-meta text-muted-foreground">{stat.suffix}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </header>

        {/* 个人优势 */}
        <section id="strengths" className="reveal scroll-mt-20 pt-12 sm:pt-16">
          <SectionHeading index="01" title="个人优势" meta={`${about.highlights.length} 项`} />
          <ul className="grid gap-3 sm:gap-4 md:grid-cols-2">
            {strengths.map((item, index) => (
              <li
                key={index}
                className="flex flex-col rounded-2xl border bg-card p-5 transition duration-300 ease-soft hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_16px_36px_-26px_rgba(15,23,42,0.4)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-meta font-semibold text-primary tabular-nums ring-1 ring-primary/15 ring-inset"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-border" />
                </div>
                {item.title ? <h3 className="mt-3 text-card-title">{item.title}</h3> : null}
                <p className={cn("text-copy text-foreground/80", item.title ? "mt-1.5" : "mt-3")}>
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 专业技能 */}
        <section id="skills" className="reveal scroll-mt-20 pt-12 sm:pt-16">
          <SectionHeading index="02" title="专业技能" meta={`${about.skillGroups.length} 个方向`} />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {about.skillGroups.map((group) => {
              const Icon = skillIcons[group.name] ?? Sparkles;
              return (
                <div
                  key={group.name}
                  className="rounded-2xl border bg-card p-5 transition duration-300 ease-soft hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_16px_36px_-26px_rgba(15,23,42,0.4)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                    <h3 className="text-card-title">{group.name}</h3>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="max-w-full rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-meta text-foreground/80"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* 实习经历 */}
        <section id="experience" className="reveal scroll-mt-20 pt-12 sm:pt-16">
          <SectionHeading index="03" title="实习经历" meta={`${about.experience.length} 段`} />
          <div className="flex flex-col gap-3 sm:gap-4">
            {about.experience.map((job) => (
              <article
                key={`${job.company}-${job.period}`}
                className="rounded-2xl border bg-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex min-w-0 items-start gap-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-card-title">{job.company}</h3>
                      <p className="mt-1 text-meta text-muted-foreground">{job.role}</p>
                    </div>
                  </div>
                  <p className="flex shrink-0 items-center gap-1.5 font-mono text-meta text-muted-foreground tabular-nums sm:pt-1">
                    {job.period}
                  </p>
                </div>
                <ul className="mt-4 flex flex-col gap-2 border-t border-border/80 pt-4">
                  {job.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-copy text-foreground/80">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/40"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* 荣誉奖项 */}
        <section id="awards" className="reveal scroll-mt-20 pt-12 sm:pt-16">
          <SectionHeading index="04" title="荣誉奖项" meta={`${about.awards.length} 项`} />
          <ol className="divide-y divide-border/80 overflow-hidden rounded-2xl border bg-card">
            {about.awards.map((award, index) => (
              <li
                key={`${award.name}-${award.year}-${index}`}
                className="px-4 py-4 transition-colors duration-200 hover:bg-muted/40 sm:px-5"
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span className="font-mono text-meta text-muted-foreground tabular-nums">
                    {award.year || "—"}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs leading-5 font-medium",
                      awardStyles[award.level],
                    )}
                  >
                    {award.level}
                  </span>
                  <span className="ml-auto text-meta font-medium text-foreground">
                    {award.result}
                  </span>
                </div>
                <p className="mt-1.5 text-copy text-foreground/80">{award.name}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 教育经历 */}
        <section id="education" className="reveal scroll-mt-20 pt-12 sm:pt-16">
          <SectionHeading index="05" title="教育经历" />
          <article className="rounded-2xl border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="flex min-w-0 items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-card-title">{about.education.school}</h3>
                  <p className="mt-1 text-meta text-muted-foreground">
                    {about.education.major} · {about.education.degree}
                  </p>
                </div>
              </div>
              <p className="flex shrink-0 items-center gap-1.5 font-mono text-meta text-muted-foreground tabular-nums sm:pt-1">
                {about.education.period}
              </p>
            </div>
            <p className="mt-4 border-t border-border/80 pt-4 text-copy text-foreground/80">
              {about.education.description}
            </p>
          </article>
        </section>

        {/* 联系行动 */}
        <section className="reveal pt-12 sm:pt-16">
          <div className="relative isolate overflow-hidden rounded-3xl border bg-card p-6 sm:p-8">
            <div
              aria-hidden
              className="about-aura pointer-events-none absolute -right-12 -bottom-24 -z-10 size-64"
            />
            <p className="text-kicker text-primary">Contact</p>
            <h2 className="mt-2 text-title">想聊聊技术、项目或者合作？</h2>
            <p className="mt-2 max-w-[46ch] text-copy text-foreground/80">
              欢迎通过邮件或 GitHub 找到我，看到消息会尽快回复。
            </p>
            <ContactActions className="mt-5" />
          </div>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
