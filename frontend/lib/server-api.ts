/**
 * 仅服务端使用：带 Cookie 访问后端，用于管理页拦截与博客页首屏渲染。
 *
 * 浏览器请求走同源 /api 反代；服务端直接连后端（容器内用服务名，宿主机默认 localhost）。
 */

import { cookies } from "next/headers";

import type { Post } from "@/lib/posts-api";
import { ApiError, type Project } from "@/lib/projects-api";

const SERVER_API_BASE = process.env.INTERNAL_API_BASE_URL ?? "http://localhost:8000";

export type ServerSession = { username: string };

type PostDto = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  published_at: string;
  created_at: string;
};

type ProjectDto = {
  id: number;
  slug: string;
  title: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  tags: string[];
  url: string | null;
  repo_url: string | null;
  created_at: string;
};

/** 把请求头里的 Cookie 透传给后端，从而复用 HttpOnly 会话。 */
async function forwardedCookie(): Promise<string> {
  return (await cookies()).toString();
}

export async function fetchServerSession(): Promise<ServerSession | null> {
  const response = await fetch(`${SERVER_API_BASE}/api/auth/session`, {
    headers: { cookie: await forwardedCookie() },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as ServerSession;
}

export async function fetchServerPosts(): Promise<Post[]> {
  const response = await fetch(`${SERVER_API_BASE}/api/posts`, { cache: "no-store" });
  if (!response.ok) throw new ApiError("文章列表加载失败", {}, response.status);
  const body = (await response.json()) as { items: PostDto[] };
  return body.items.map(toPost);
}

export async function fetchServerPost(slug: string): Promise<Post | null> {
  const response = await fetch(`${SERVER_API_BASE}/api/posts/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiError("文章加载失败", {}, response.status);
  return toPost((await response.json()) as PostDto);
}

export async function fetchServerProjects(): Promise<Project[]> {
  const response = await fetch(`${SERVER_API_BASE}/api/projects`, { cache: "no-store" });
  if (!response.ok) throw new ApiError("项目列表加载失败", {}, response.status);
  const body = (await response.json()) as { items: ProjectDto[] };
  return body.items.map((dto) => ({
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    role: dto.role,
    period: dto.period,
    description: dto.description,
    highlights: dto.highlights,
    tags: dto.tags,
    url: dto.url ?? undefined,
    repoUrl: dto.repo_url ?? undefined,
    createdAt: dto.created_at,
  }));
}

function toPost(dto: PostDto): Post {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    summary: dto.summary,
    content: dto.content,
    tags: dto.tags,
    publishedAt: dto.published_at,
    createdAt: dto.created_at,
  };
}
