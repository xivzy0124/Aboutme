import type { Metadata } from "next";

import { GithubTrending } from "@/components/github-trending";

export const metadata: Metadata = {
  title: "主页",
};

/**
 * 主页：左侧留给日常内容（暂时留空），右侧是独立的 GitHub 榜单模块。
 * 新增模块时按 section 追加即可，互不影响。
 */
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
        {/* 主内容区：后续日常使用的模块放在这里 */}
        <section aria-label="主内容" className="lg:min-h-[60vh]" />

        <aside aria-label="侧边栏" className="lg:sticky lg:top-24 lg:self-start">
          <GithubTrending />
        </aside>
      </div>
    </div>
  );
}
