/**
 * 文章数据源。
 * 公开读接口：GET /api/posts、GET /api/posts/{slug}
 * 管理写接口：POST/PUT/DELETE /api/admin/posts（需要登录）
 */

import { ApiError } from "@/lib/projects-api";

export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
};

export type PostInput = {
  title: string;
  slug?: string;
  summary: string;
  content: string;
  tags: string[];
  publishedAt: string;
};

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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const FIELD_LABELS: Record<string, string> = {
  title: "文章标题",
  slug: "路径",
  summary: "文章摘要",
  content: "正文",
  tags: "标签",
  published_at: "发布日期",
};

function mapPost(dto: PostDto): Post {
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

export async function fetchPosts(signal?: AbortSignal): Promise<Post[]> {
  const response = await fetch(`${API_BASE}/api/posts`, { signal, cache: "no-store" });
  if (!response.ok) throw await toApiError(response);

  const body = (await response.json()) as { items: PostDto[]; total: number };
  return body.items.map(mapPost);
}

/** 后台新增：slug 留空时由后端按标题生成。 */
export async function createPost(input: PostInput): Promise<Post> {
  const response = await fetch(`${API_BASE}/api/admin/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(input)),
  });
  if (!response.ok) throw await toApiError(response);
  return mapPost((await response.json()) as PostDto);
}

/** 后台编辑：slug 不变，避免已发布链接失效。 */
export async function updatePost(slug: string, input: PostInput): Promise<Post> {
  const response = await fetch(`${API_BASE}/api/admin/posts/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(input)),
  });
  if (!response.ok) throw await toApiError(response);
  return mapPost((await response.json()) as PostDto);
}

export async function deletePost(slug: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/admin/posts/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw await toApiError(response);
}

function toPayload(input: PostInput) {
  return {
    title: input.title,
    slug: input.slug?.trim() || null,
    summary: input.summary,
    content: input.content,
    tags: input.tags,
    published_at: input.publishedAt,
  };
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { detail?: unknown };

    if (typeof body.detail === "string") {
      return new ApiError(body.detail, {}, response.status);
    }

    if (Array.isArray(body.detail)) {
      const fieldErrors: Record<string, string> = {};
      for (const item of body.detail as { loc?: unknown[] }[]) {
        const field = [...(item.loc ?? [])]
          .reverse()
          .find((part): part is string => typeof part === "string");
        if (!field) continue;
        fieldErrors[field] = `${FIELD_LABELS[field] ?? "表单"}不符合要求`;
      }
      return new ApiError("提交内容未通过校验，请检查标出的字段。", fieldErrors, response.status);
    }
  } catch {
    // 非 JSON 响应，走兜底提示
  }

  return new ApiError(`请求失败（HTTP ${response.status}）`, {}, response.status);
}
