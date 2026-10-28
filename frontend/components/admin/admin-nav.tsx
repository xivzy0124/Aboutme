"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { logout } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "概览" },
  { href: "/admin/projects", label: "项目" },
  { href: "/admin/blog", label: "博客" },
];

/** 后台导航：高亮当前路径，并提供退出登录入口。 */
export function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout().catch(() => undefined);
    // 退出后整页刷新，确保服务端不再使用旧会话渲染
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <nav aria-label="管理后台导航" className="flex flex-wrap items-center gap-1">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg px-3 text-meta font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <span aria-hidden className="hidden h-5 w-px bg-border sm:block" />

      <span className="hidden text-meta text-muted-foreground sm:inline">@{username}</span>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-meta text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <LogOut className="size-3.5" aria-hidden />
        退出
      </button>
    </div>
  );
}
