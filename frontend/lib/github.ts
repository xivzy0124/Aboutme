/**
 * GitHub 热门项目数据源。
 * 接口由 backend/api/github.py 提供，前端只做数据获取与类型声明。
 */

export type Period = "daily" | "weekly" | "monthly";

export type TrendingRepo = {
  rank: number;
  full_name: string;
  name: string;
  owner: string;
  owner_avatar_url: string | null;
  description: string | null;
  html_url: string;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  created_at: string;
  updated_at: string;
};

export type TrendingResponse = {
  period: Period;
  since: string;
  fetched_at: string;
  items: TrendingRepo[];
};

/**
 * 后端地址：默认指向本机 8000 端口（compose 已映射）。
 * 部署到其他环境时用 NEXT_PUBLIC_API_BASE_URL 覆盖。
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function fetchTrending(period: Period, signal?: AbortSignal): Promise<TrendingResponse> {
  const response = await fetch(`${API_BASE}/api/github/trending/${period}`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`榜单请求失败（HTTP ${response.status}）`);
  }

  return (await response.json()) as TrendingResponse;
}
