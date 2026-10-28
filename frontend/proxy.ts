import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/safe-next";

/** 后端地址：容器内用服务名，宿主机默认 localhost。 */
const API_BASE = process.env.INTERNAL_API_BASE_URL ?? "http://localhost:8000";
const LOGIN_PATH = "/admin/login";

/** 会话是否有效：交给后端判断签名与过期时间，前端不解析 Cookie。 */
async function hasSession(cookie: string | null): Promise<boolean> {
  const response = await fetch(`${API_BASE}/api/auth/session`, {
    headers: { cookie: cookie ?? "" },
    cache: "no-store",
  });
  return response.ok;
}

/**
 * /admin 的统一入口守卫。
 *
 * 登录态判断放在 Proxy 而不是 layout 里：Next 16 开发模式下，服务端组件直接抛
 * redirect() 会进入 React 的组件性能埋点，触发
 * “'AdminLayout' cannot have a negative time stamp”（vercel/next.js#86060）。
 * 在渲染前完成拦截就不会命中那条路径；layout 里仍保留一次兜底校验。
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = await hasSession(request.headers.get("cookie"));

  if (pathname === LOGIN_PATH) {
    // 已登录就不必再看登录表单，直接回到目标页（等价于原先页面里的 redirect）
    if (!authenticated) return NextResponse.next();
    return NextResponse.redirect(
      new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url),
    );
  }

  if (authenticated) return NextResponse.next();

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
