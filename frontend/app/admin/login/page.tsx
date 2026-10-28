import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = {
  title: "登录管理后台",
  robots: { index: false, follow: false },
};

/**
 * 已登录时的跳转由 proxy.ts 处理，这里只负责渲染表单。
 * 页面内不再调用 redirect()，避免 dev 模式下的性能埋点异常。
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);

  return <LoginForm next={next} />;
}
