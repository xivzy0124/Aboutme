import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { fetchServerSession } from "@/lib/server-api";

/**
 * 管理后台受保护布局：
 * 服务端先校验 HttpOnly 会话，未登录直接重定向到登录页，
 * 因此 /admin 下的页面在渲染前就被拦截，不存在“先出页面再跳转”的空窗。
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await fetchServerSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <header>
        <p className="text-kicker text-primary">Admin · 控制台</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h1 className="text-display">内容管理</h1>
          <AdminNav username={session.username} />
        </div>
      </header>

      <div className="mt-6 border-t border-border/80 pt-6 sm:mt-8 sm:pt-8">{children}</div>
    </div>
  );
}
