import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { posts } from "@/data/posts";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return { title: post?.title ?? "Post" };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="pb-2 text-3xl font-bold tracking-tight">{post.title}</h1>
      <p className="pb-4 text-sm text-muted-foreground">{post.publishedAt}</p>
      <div className="flex flex-wrap gap-2 pb-8">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="text-muted-foreground">
        <p>正文内容占位。</p>
        <p className="pt-2">
          当前为纯前端骨架阶段的静态数据；后续全栈阶段将接入 Tiptap 编辑器，
          正文以 HTML 存储于 PostgreSQL，渲染前经 Sanitization 处理。
        </p>
      </div>
    </article>
  );
}
