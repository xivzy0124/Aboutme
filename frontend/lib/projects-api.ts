/**
 * 项目数据源。
 * 接口由 backend/api/projects.py 提供：GET /api/projects、POST /api/projects。
 * 页面只依赖这里的类型与函数，后端迁移数据库时无需改动。
 */

export type Project = {
  id: number;
  slug: string;
  title: string;
  role: string;
  period: string;
  description: string;
  highlights: string[];
  tags: string[];
  url?: string;
  repoUrl?: string;
  createdAt: string;
};

export type ProjectInput = {
  title: string;
  role: string;
  period: string;
  description: string;
  tags: string[];
  highlights: string[];
  repoUrl?: string;
  url?: string;
};

/** 后端返回的 snake_case 结构与前端的 camelCase 字段在这里完成转换。 */
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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const FIELD_LABELS: Record<string, string> = {
  title: "项目名称",
  role: "承担角色",
  period: "项目周期",
  description: "项目简介",
  tags: "技术栈",
  highlights: "项目亮点",
  repo_url: "仓库链接",
  url: "项目地址",
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function mapProject(dto: ProjectDto): Project {
  return {
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
  };
}

export async function fetchProjects(signal?: AbortSignal): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/api/projects`, { signal, cache: "no-store" });

  if (!response.ok) {
    throw await toApiError(response);
  }

  const body = (await response.json()) as { items: ProjectDto[]; total: number };
  return body.items.map(mapProject);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      role: input.role,
      period: input.period,
      description: input.description,
      tags: input.tags,
      highlights: input.highlights,
      repo_url: input.repoUrl ?? null,
      url: input.url ?? null,
    }),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return mapProject((await response.json()) as ProjectDto);
}

/** 把 FastAPI 的 detail 转换成可展示的错误与字段级提示。 */
async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { detail?: unknown };

    if (typeof body.detail === "string") {
      return new ApiError(body.detail);
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
      return new ApiError("提交内容未通过校验，请检查标出的字段。", fieldErrors);
    }
  } catch {
    // 非 JSON 响应，走下面的兜底提示
  }

  return new ApiError(`请求失败（HTTP ${response.status}）`);
}
