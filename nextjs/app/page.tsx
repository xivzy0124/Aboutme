import Link from "next/link";

import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <section className="py-16 sm:py-24">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {site.name}
        </h1>
        <p className="pt-3 leading-relaxed text-muted-foreground">
          软件开发 / 运维 DevOps。做全栈项目，也折腾 Linux
          服务器；从代码到上线独立完成。
        </p>
        <nav className="flex gap-6 pt-5 text-sm">
          <Link
            href="/about"
            className="text-foreground underline-offset-4 hover:underline"
          >
            关于我
          </Link>
          <Link
            href="/projects"
            className="text-foreground underline-offset-4 hover:underline"
          >
            项目
          </Link>
          <Link
            href="/blog"
            className="text-foreground underline-offset-4 hover:underline"
          >
            博客
          </Link>
        </nav>
      </section>

      <section className="pb-16">
        <h2 className="pb-4 text-lg font-medium">项目</h2>
        <div className="flex flex-col gap-3">
          {projects.slice(0, 3).map((project) => (
            <Link
              key={project.slug}
              href="/projects"
              className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium">{project.title}</p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {project.period}
                </p>
              </div>
              <p className="pt-1 text-sm text-muted-foreground">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <h2 className="pb-4 text-lg font-medium">最新文章</h2>
        <div className="flex flex-col gap-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium">{post.title}</p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {post.publishedAt}
                </p>
              </div>
              <p className="pt-1 text-sm text-muted-foreground">{post.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
