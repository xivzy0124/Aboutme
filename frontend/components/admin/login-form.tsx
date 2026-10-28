"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/projects-api";
import { login } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 text-ui text-foreground shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

/**
 * 登录表单：成功后由父页面跳转，令牌全程放在 HttpOnly Cookie 中。
 * next 只接受站内路径，避免开放重定向。
 */
export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!username.trim() || !password) {
      setError("请输入用户名与密码。");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(username.trim(), password);
      // 登录后刷新服务端组件，让受保护布局重新校验新 Cookie
      router.replace(next);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "网络异常，请稍后重试。");
      setSubmitting(false);
    }
  }

  return (
    <section className="relative isolate">
      <div
        aria-hidden
        className="about-aura pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 opacity-70"
      />

      <div className="mx-auto w-full max-w-md px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
        <Link
          href="/"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg text-meta text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          返回首页
        </Link>

        <header className="mt-6">
          <p className="text-kicker text-primary">Admin · 登录</p>
          <h1 className="mt-3 flex items-center gap-2.5 text-display">
            <LockKeyhole className="size-6 text-primary sm:size-7" aria-hidden />
            管理后台
          </h1>
          <p className="mt-3 text-body text-foreground/80">
            登录后可编辑项目与博客内容。会话有效期 2 小时，最长不超过 12 小时。
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 rounded-2xl border border-border bg-card/70 p-5 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="admin-username" className="text-meta font-medium text-foreground">
                用户名
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="off"
                spellCheck={false}
                required
                maxLength={64}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-invalid={Boolean(error)}
                className={cn(inputClass, "mt-1.5 h-11")}
                placeholder="xivzy"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="text-meta font-medium text-foreground">
                密码
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(error)}
                className={cn(inputClass, "mt-1.5 h-11")}
                placeholder="请输入管理员密码"
              />
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-meta text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="h-11 w-full rounded-xl"
            >
              {submitting ? "登录中…" : "登录"}
            </Button>
          </div>
        </form>

        <p className="mt-5 text-meta text-muted-foreground">
          忘记口令可在后端通过环境变量 ADMIN_PASSWORD 重新配置后重启服务。
        </p>
      </div>
    </section>
  );
}
