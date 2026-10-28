/**
 * 管理后台鉴权客户端。
 * 会话保存在后端 HttpOnly Cookie 中，前端不接触令牌，也不写入 localStorage。
 */

import { ApiError } from "@/lib/projects-api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type AdminSession = { username: string };

/** 登录；失败时抛出带 401 状态的 ApiError。 */
export async function login(username: string, password: string): Promise<AdminSession> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const detail = await response
      .json()
      .then((body: { detail?: string }) => body.detail)
      .catch(() => undefined);
    throw new ApiError(detail ?? "登录失败，请稍后重试", {}, response.status);
  }

  return (await response.json()) as AdminSession;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, { method: "POST" });
}

/** 查询当前会话；未登录返回 null，用于客户端拦截与页面提示。 */
export async function fetchSession(): Promise<AdminSession | null> {
  const response = await fetch(`${API_BASE}/api/auth/session`, { cache: "no-store" });
  if (response.status === 401) return null;
  if (!response.ok) throw new ApiError("会话状态查询失败", {}, response.status);
  return (await response.json()) as AdminSession;
}
